#!/usr/bin/env node
/**
 * Sarah's AI Brief — 요약 생성 (SPEC 10절 Phase 3)
 *
 * Phase 2 가 고른 후보(runs/<date>/candidates.json)를 받아 한/영 요약·시사점·
 * 오늘의 인사이트를 만들고 data/briefs.js 를 생성한다. 여기서 처음 LLM 이 등장한다.
 * 그 경계 덕분에 '잘못 골랐다'와 '잘못 요약했다'를 따로 디버깅할 수 있다.
 *
 * 호출은 기사 1건당 1회 + 인사이트 1회다. 기사별로 나누는 이유는 두 가지다.
 * 실패한 기사만 다시 부탁할 수 있고, 원문 10편이 한 컨텍스트에 섞이지 않는다.
 *
 * 발행 전 사람 검토는 두지 않는다(자동 발행 + 사후 정정). 대신 lib/validate.mjs 가
 * 규격을 검사하고, 여러 번 고쳐도 어기는 기사는 빼고 발행한다.
 *
 * 사용:
 *   node scripts/summarize.mjs                     이미 지나간 마지막 발행분
 *   node scripts/summarize.mjs --date 2026-09-01   기준일 고정
 *   node scripts/summarize.mjs --limit 1           앞의 1건만 (비용 확인용)
 *   node scripts/summarize.mjs --dry-run           호출 없이 프롬프트·스키마만 확인
 *   node scripts/summarize.mjs --provider api        API 키로 (기본값은 구독으로 도는 cli)
 *   node scripts/summarize.mjs --model sonnet
 *   node scripts/summarize.mjs --drop-samples      샘플 4일치를 지우고 실데이터만 남긴다
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, loadMeta, loadBriefs, loadGlossary } from './lib/meta.mjs';
import { defaultDate } from './lib/time.mjs';
import { createClient, askJson, tally, describeError, DEFAULT_MODEL } from './lib/claude.mjs';
import { askJsonViaCli, cliAvailable, DEFAULT_CLI_MODEL } from './lib/claude-code.mjs';
import {
  articleSystem, articleUser, articleSchema,
  insightSystem, insightUser, insightSchema, retryNote
} from './lib/prompt.mjs';
import { validateArticle, validateInsight, validateBrief } from './lib/validate.mjs';
import {
  writeBriefs, writeGlossary, mergeBrief, dropSamples,
  recountGlossary, addNewTerms
} from './lib/publish.mjs';

/* ── 인자 ─────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const value = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const DATE = value('date', defaultDate());
const LIMIT = Number(value('limit', 0)) || 0;
const DRY_RUN = flag('dry-run');

/* 기본은 cli — 이미 로그인된 Claude 구독으로 돌아 API 크레딧을 쓰지 않는다.
   --provider api 는 ANTHROPIC_API_KEY 로 도는 경로이고 JSON 스키마를 강제할 수 있다. */
const PROVIDER = value('provider', 'cli');
const MODEL = value('model', PROVIDER === 'cli' ? DEFAULT_CLI_MODEL : DEFAULT_MODEL);
const DROP_SAMPLES = flag('drop-samples');

if (!/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  console.error('--date 는 YYYY-MM-DD 형식이어야 합니다: ' + DATE);
  process.exit(2);
}

/* 규격을 어기면 무엇이 틀렸는지 붙여 다시 부탁한다. 이 횟수를 넘기면 그 기사를 뺀다.
   재시도 횟수는 규격이 아니라 운영 값이다 — 늘려도 통과 기준은 그대로다. */
const MAX_ATTEMPTS = 3;

const RUN_DIR = join(ROOT, 'runs', DATE);
const CANDIDATES = join(RUN_DIR, 'candidates.json');
const say = (...a) => console.error(...a);

const WEEKDAYS = [
  { ko: '일요일', en: 'Sunday' }, { ko: '월요일', en: 'Monday' }, { ko: '화요일', en: 'Tuesday' },
  { ko: '수요일', en: 'Wednesday' }, { ko: '목요일', en: 'Thursday' }, { ko: '금요일', en: 'Friday' },
  { ko: '토요일', en: 'Saturday' }
];

/* ── 준비 ─────────────────────────────────────────────────────────── */
if (!existsSync(CANDIDATES)) {
  console.error('후보 파일이 없습니다: ' + CANDIDATES);
  console.error('먼저 수집을 돌리세요:  node scripts/collect.mjs --date ' + DATE);
  process.exit(1);
}

const run = JSON.parse(readFileSync(CANDIDATES, 'utf8'));
const meta = loadMeta();
let briefs = loadBriefs();
let glossary = loadGlossary();

const topicIds = meta.topics.map((t) => t.id);
const glossaryIds = glossary.map((g) => g.id);

const candidates = LIMIT ? run.candidates.slice(0, LIMIT) : run.candidates;

say("Sarah's AI Brief · 요약 생성");
say('  기준일    ' + DATE + '  (발행 ' + DATE + ' 08:00 KST)');
say('  후보      ' + run.candidates.length + '건' + (LIMIT ? ' 중 ' + candidates.length + '건만' : ''));
say('  생성      ' + (PROVIDER === 'cli' ? 'claude -p (구독)' : 'Anthropic API (크레딧)') + ' · 모델 ' + MODEL);
say('');

if (!candidates.length) {
  console.error('후보가 0건입니다. 발행할 것이 없습니다.');
  process.exit(1);
}

const SYSTEM_ARTICLE = articleSystem(meta, glossary);
const SCHEMA_ARTICLE = articleSchema(topicIds, glossaryIds);

/* ── dry-run — 호출 없이 무엇이 나갈지만 본다 ────────────────────── */
if (DRY_RUN) {
  say('── 시스템 프롬프트 (' + SYSTEM_ARTICLE.length + '자, 하루치 전체가 공유) ' + '─'.repeat(18));
  say(SYSTEM_ARTICLE);
  say('── 첫 기사의 user 메시지 (앞 600자) ' + '─'.repeat(30));
  say(articleUser(candidates[0]).slice(0, 600) + ' …');
  say('');
  say('── 출력 스키마 ' + '─'.repeat(52));
  say(JSON.stringify(SCHEMA_ARTICLE, null, 2));
  say('');
  say('호출 예정: 기사 ' + candidates.length + '건 + 인사이트 1건 = ' + (candidates.length + 1) + '회');
  process.exit(0);
}

/* ── 생성 ─────────────────────────────────────────────────────────── */
let ask;
if (PROVIDER === 'cli') {
  const status = await cliAvailable();
  if (!status.ok) {
    console.error(status.why);
    console.error('API 키로 돌리려면:  node scripts/summarize.mjs --provider api');
    process.exit(1);
  }
  say('  인증      ' + status.how);
  say('');
  ask = (opts) => askJsonViaCli({ ...opts, model: MODEL });
} else {
  const client = createClient();
  ask = (opts) => askJson(client, { ...opts, model: MODEL });
}

const usage = tally();
const articles = [];
const dropped = [];
const proposals = [];

for (const c of candidates) {
  const label = '[' + c.rank + '/' + candidates.length + '] ' + c.source + ' — ' + c.sourceTitle.slice(0, 40);
  let violations = null;
  let made = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, usage: u } = await ask({
        system: SYSTEM_ARTICLE,
        user: articleUser(c) + (violations ? retryNote(violations) : ''),
        schema: SCHEMA_ARTICLE,
        maxTokens: 8000
      });
      usage.add(u);
      violations = validateArticle(data, { topicIds, glossaryIds });
      if (!violations.length) { made = data; break; }
      say(label + '  x 규격 위반 ' + violations.length + '건' + (attempt < MAX_ATTEMPTS ? ' — 다시 만듭니다' : ''));
      for (const v of violations) say('        · ' + v);
    } catch (err) {
      say(label + '  x ' + describeError(err));
      if (attempt === MAX_ATTEMPTS) break;
      violations = ['호출이 실패했습니다. 같은 규격으로 다시 만든다.'];
    }
  }

  if (!made) {
    dropped.push({ url: c.url, source: c.source, title: c.sourceTitle, why: violations ?? ['호출 실패'] });
    say(label + '  → 뺍니다');
    continue;
  }

  /* 제안한 기사의 자리를 함께 기록한다 — 채택되면 그 기사의 terms 에 붙는다. */
  proposals.push(...(made.newTerms ?? []).map((n) => ({ ...n, at: articles.length })));
  articles.push({
    id: null, rank: null,
    title: made.title,
    source: c.source,
    sourceType: c.sourceType,
    url: c.url,
    publishedAt: c.publishedAt,
    topic: made.topic,
    score: c.score,
    scoreParts: c.scoreParts,
    crossRefs: c.crossRefs ?? [],
    summary: made.summary,
    implication: made.implication,
    terms: made.terms ?? []
  });
  say(label + '  o ' + made.topic + ' · ' + made.title.ko.slice(0, 30));
}

if (!articles.length) {
  console.error('\n실을 수 있는 기사가 한 건도 없습니다. 발행하지 않습니다.');
  process.exit(1);
}

/* 뺀 기사가 있으면 번호가 비므로 다시 매긴다. 아직 발행 전이라 id 를 바꿔도 된다. */
articles.forEach((a, i) => { a.rank = i + 1; a.id = DATE + '-' + String(i + 1).padStart(2, '0'); });

/* 신규 용어를 사전에 넣고, 제안한 기사의 terms 에 붙인다.
   붙이지 않으면 어느 기사도 가리키지 않는 용어가 되어 사전에서 다시 빠진다. */
const merged = addNewTerms(glossary, proposals, DATE, 2);
glossary = merged.glossary;
for (const t of merged.added) {
  const a = articles[t.at];
  if (a && a.terms.length < 3 && !a.terms.includes(t.id)) a.terms.push(t.id);
}
const glossaryIdsAfter = glossary.map((g) => g.id);

/* ── 오늘의 인사이트 ──────────────────────────────────────────────── */
say('');
say('인사이트 생성 — 기사 ' + articles.length + '건을 가로질러');

const SYSTEM_INSIGHT = insightSystem();
const SCHEMA_INSIGHT = insightSchema(articles.length);
let insight = null;
let insightViolations = null;

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    const { data, usage: u } = await ask({
      system: SYSTEM_INSIGHT,
      user: insightUser(articles) + (insightViolations ? retryNote(insightViolations) : ''),
      schema: SCHEMA_INSIGHT,
      maxTokens: 4000
    });
    usage.add(u);
    insightViolations = validateInsight(data, { articleCount: articles.length });
    if (!insightViolations.length) { insight = data; break; }
    say('  x 규격 위반 ' + insightViolations.length + '건' + (attempt < MAX_ATTEMPTS ? ' — 다시 만듭니다' : ''));
    for (const v of insightViolations) say('      · ' + v);
  } catch (err) {
    say('  x ' + describeError(err));
    if (attempt === MAX_ATTEMPTS) break;
    insightViolations = ['호출이 실패했습니다. 같은 규격으로 다시 만든다.'];
  }
}

if (!insight) {
  console.error('\n인사이트를 만들지 못했습니다. 인사이트 없는 브리핑은 발행하지 않습니다.');
  console.error('여기까지 ' + fmtCost() + '. 다시 돌리려면 같은 명령을 그대로 실행하세요.');
  process.exit(1);
}

say('  o ' + insight.title.ko + '  (근거 ' + insight.refs.join(', ') + '번)');

/* ── 브리핑 조립 ──────────────────────────────────────────────────── */
const brief = {
  date: DATE,
  weekday: WEEKDAYS[new Date(DATE + 'T00:00:00Z').getUTCDay()],
  type: 'daily',
  note: buildNote(articles.length, run.shortfall, dropped.length),
  funnel: { ...run.funnel, published: articles.length },
  insight: { title: insight.title, body: insight.body },
  articles
};

/* 생성 결과는 발행 여부와 무관하게 남긴다. 여기까지 쓴 비용을 버리지 않기 위해서다. */
writeFileSync(join(RUN_DIR, 'brief.json'),
  JSON.stringify({ ...brief, _refs: insight.refs, _dropped: dropped, _proposals: proposals }, null, 2), 'utf8');

const problems = validateBrief(brief, { topicIds, glossaryIds: glossaryIdsAfter });
if (problems.length) {
  console.error('\n발행 직전 검사에서 ' + problems.length + '건이 걸렸습니다. 발행하지 않습니다.');
  for (const p of problems) console.error('  · ' + p);
  console.error('\n생성 결과는 ' + join('runs', DATE, 'brief.json') + ' 에 있습니다.');
  process.exit(1);
}

/* ── 발행 ─────────────────────────────────────────────────────────── */
if (DROP_SAMPLES) briefs = dropSamples(briefs);
briefs = mergeBrief(briefs, brief);

glossary = recountGlossary(glossary, briefs);

const wroteBriefs = writeBriefs(briefs);
const wroteGlossary = writeGlossary(glossary);
appendReport();

say('');
say('── 발행 ' + '─'.repeat(58));
say('  ' + wroteBriefs + '     ' + brief.date + ' · 기사 ' + articles.length + '건' +
  (dropped.length ? ' · 규격 미달로 뺀 것 ' + dropped.length + '건' : ''));
say('  ' + wroteGlossary + '   용어 ' + glossary.length + '개' +
  (merged.added.length ? ' (신규 ' + merged.added.map((t) => t.id).join(', ') + ')' : ''));
if (DROP_SAMPLES) {
  say('');
  say('  샘플 데이터를 제거했습니다. 화면의 데모 배너도 지우려면:');
  say('    · assets/js/app.js 의 renderBanner 호출부');
  say('    · 각 HTML 의 <div id="demo-banner">');
}
say('');
say('  호출 ' + usage.total.calls + '회 · 입력 ' + usage.total.input + ' (캐시 읽기 ' + usage.total.cacheRead +
  ') · 출력 ' + usage.total.output + ' 토큰 · ' + fmtCost());
say('  확인:  npm run serve  →  http://localhost:8000');

/* ── 보조 ─────────────────────────────────────────────────────────── */

/* cli 경로는 구독으로 돈다. 청구되지 않으므로 금액이 아니라 환산값이라고 말한다. */
function fmtCost() {
  const usd = '$' + usage.cost.toFixed(2);
  return PROVIDER === 'cli' ? '구독 사용 (API 정가 환산 ' + usd + ')' : '약 ' + usd;
}

/** 10건에 못 미친 날은 사유를 브리핑 상단에 쓴다 — P3. LLM 을 쓰지 않는다. */
function buildNote(count, shortfall, droppedCount) {
  if (count >= 10 && !droppedCount) return null;

  const ko = [`오늘은 ${count}건입니다.`];
  const en = [`Today's brief carries ${count} ${count === 1 ? 'story' : 'stories'}.`];

  const reason = shortfall?.reason;
  if (reason === 'source-cap') {
    ko.push(`후보는 충분했지만 한 출처에서 최대 3건까지만 싣기 때문에 여기까지입니다. 창 안에 AI 기사를 낸 매체가 ${shortfall.sources ?? 0}곳이었습니다.`);
    en.push(`There were enough candidates, but no single outlet gets more than three slots. ${shortfall.sources ?? 0} outlets published AI stories inside the window.`);
  }
  if (reason === 'thin-window' || reason === 'fetch-failed-and-thin-window') {
    ko.push('24시간 창 안에서 확보한 후보가 10건에 못 미쳤습니다.');
    en.push('Fewer than ten candidates cleared the 24-hour window.');
  }
  if (reason === 'fetch-failed-and-thin-window') {
    ko.push(`원문 본문을 읽지 못한 기사 ${shortfall.fetchFailed}건은 싣지 않았습니다.`);
    en.push(`${shortfall.fetchFailed} ${shortfall.fetchFailed === 1 ? 'story was' : 'stories were'} dropped because the full text could not be retrieved.`);
  }
  if (droppedCount) {
    ko.push(`요약 규격을 맞추지 못한 ${droppedCount}건도 뺐습니다.`);
    en.push(`${droppedCount} more ${droppedCount === 1 ? 'was' : 'were'} dropped for failing the writing spec.`);
  }
  ko.push('자리를 채우려고 RSS 요약만 보고 쓰지는 않습니다.');
  en.push('We do not fill the gap by writing from RSS blurbs alone.');

  return { ko: ko.join(' '), en: en.join(' ') };
}

function appendReport() {
  const path = join(RUN_DIR, 'report.txt');
  const L = ['', '── Phase 3 요약 생성 ' + '─'.repeat(48)];
  L.push('생성 ' + new Date().toISOString() + ' · ' + PROVIDER + ' · 모델 ' + MODEL);
  L.push('기사 ' + articles.length + '건 발행' + (dropped.length ? ' · 규격 미달 ' + dropped.length + '건 제외' : ''));
  L.push('인사이트: ' + insight.title.ko + '  (근거 ' + insight.refs.join(', ') + '번)');
  for (const d of dropped) {
    L.push('  뺀 기사 — ' + d.source + ' — ' + d.title);
    for (const w of d.why) L.push('      · ' + w);
  }
  if (proposals.length) L.push('신규 용어 제안: ' + proposals.map((p) => p.id).join(', '));
  L.push('호출 ' + usage.total.calls + '회 · ' + fmtCost());
  L.push('');
  if (existsSync(path)) appendFileSync(path, L.join('\n'), 'utf8');
  else writeFileSync(path, L.join('\n'), 'utf8');
}
