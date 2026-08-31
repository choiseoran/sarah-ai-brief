#!/usr/bin/env node
/**
 * Sarah's AI Brief — 수집·점수화 (SPEC 6.3 파이프라인 1~9단계)
 *
 * 12개 피드를 읽어 상위 10건 후보와 퍼널 숫자를 만든다. 요약은 하지 않는다.
 * 이 단계는 결정적이다. 같은 입력 XML이면 항상 같은 후보가 나온다.
 * LLM은 Phase 3에서 처음 등장하며, 그 경계 덕분에 '잘못 골랐다'와
 * '잘못 요약했다'를 따로 디버깅할 수 있다.
 *
 * 사용:
 *   node scripts/collect.mjs                       이미 지나간 마지막 발행분
 *   node scripts/collect.mjs --date 2026-08-31     기준일 고정
 *   node scripts/collect.mjs --save-raw            원본 XML·HTML 보존
 *   node scripts/collect.mjs --from runs/…/raw     네트워크 없이 재실행
 *   node scripts/collect.mjs --dry-run             5단계 생략, 후보 목록만
 *   node scripts/collect.mjs --json                candidates.json 을 표준출력으로
 *
 * 의존성 0개. SPEC 8절 제약을 그대로 따른다.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

import { ROOT, loadMeta, loadBriefs, weightIndex, readJson } from './lib/meta.mjs';
import { fetchText, ACCEPT_FEED, ACCEPT_HTML, hostThrottle, mapLimit } from './lib/http.mjs';
import { parseFeed } from './lib/feeds.mjs';
import { canonicalUrl } from './lib/normalize.mjs';
import { anchorFor, defaultDate, windowStart, kstStamp, WINDOW_HOURS } from './lib/time.mjs';
import { buildFilters, applyWindow, applyExclusions, seenUrlSet } from './lib/filter.mjs';
import { buildEntityIndex, clusterAll } from './lib/cluster.mjs';
import { robotsFor, isAllowed } from './lib/robots.mjs';
import { extractFromHtml, titleFromHtml, MIN_CHARS } from './lib/extract.mjs';
import { scoreCluster, verify } from './lib/score.mjs';
import { select, shortfallNote, TARGET } from './lib/select.mjs';

/* ── 인자 ─────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (name) => argv.includes('--' + name);
const value = (name, fallback) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const DATE = value('date', defaultDate());
const FROM = value('from', null);
const SAVE_RAW = flag('save-raw');
const DRY_RUN = flag('dry-run');
const AS_JSON = flag('json');
const EXTRACT_BUDGET = Number(value('extract-budget', 60));
const CONCURRENCY = 4;

if (!/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  console.error('--date 는 YYYY-MM-DD 형식이어야 합니다: ' + DATE);
  process.exit(2);
}

const OUT_DIR = join(ROOT, 'runs', DATE);
const RAW_DIR = join(OUT_DIR, 'raw');
const PAGE_DIR = join(RAW_DIR, 'pages');
const anchor = anchorFor(DATE);
const say = (...a) => { if (!AS_JSON) console.error(...a); };

/* ── 준비 ─────────────────────────────────────────────────────────── */
const meta = loadMeta();
const briefs = loadBriefs();
const lexicon = readJson('scripts', 'data', 'lexicon.json');
const entities = readJson('scripts', 'data', 'entities.json');

const weightOf = weightIndex(meta);
const filters = buildFilters(lexicon);
const entityIndex = buildEntityIndex(entities);
const stopset = new Set([...lexicon.stopwords.en, ...lexicon.stopwords.ko]);
const seenUrls = seenUrlSet(briefs, canonicalUrl, DATE);

say('Sarah\'s AI Brief · 수집');
say('  기준일    ' + DATE + '  (발행 ' + DATE + ' 08:00 KST)');
say('  창        ' + windowStart(anchor).toISOString() + ' → ' + anchor.toISOString() + '  (' + WINDOW_HOURS + 'h)');
say('  이미 실린 URL ' + seenUrls.size + '건');
say('');

/* ── 1단계 · 수집 ─────────────────────────────────────────────────── */
const pageThrottle = hostThrottle(1500);
const feedStatus = [];

async function loadFeed(feed) {
  const rawPath = join(FROM ?? RAW_DIR, feed.id + '.xml');
  if (FROM) {
    if (!existsSync(rawPath)) return { feed, xml: null, note: '저장된 XML 없음' };
    return { feed, xml: readFileSync(rawPath, 'utf8'), note: 'from-cache' };
  }
  try {
    const state = {};
    const { res, body } = await fetchText(feed.url, { accept: ACCEPT_FEED, state });
    if (!res.ok) return { feed, xml: null, note: 'HTTP ' + res.status, status: res.status, attempts: state.attempts };
    return { feed, xml: body, status: res.status, attempts: state.attempts };
  } catch (err) {
    return { feed, xml: null, note: '연결 실패 — ' + err.message };
  }
}

const loaded = await mapLimit(meta.feeds, 6, loadFeed);

if (SAVE_RAW && !FROM) {
  mkdirSync(RAW_DIR, { recursive: true });
  for (const l of loaded) if (l.xml) writeFileSync(join(RAW_DIR, l.feed.id + '.xml'), l.xml);
}

let collected = [];
for (const l of loaded) {
  const items = l.xml ? parseFeed(l.xml, l.feed) : [];
  collected = collected.concat(items);
  feedStatus.push({
    id: l.feed.id,
    name: l.feed.name,
    type: l.feed.type,
    status: l.status ?? null,
    items: items.length,
    note: l.note ?? ''
  });
  say('  ' + (items.length ? 'o' : '!') + ' ' + l.feed.id.padEnd(12) + String(items.length).padStart(4) + '건  ' + (l.note ?? ''));
}
say('');
say('1. 수집        ' + collected.length + '건');

/* ── 2단계 · 시간 필터 ────────────────────────────────────────────── */
const win = applyWindow(collected, anchor);
say('2. 시간 필터    ' + win.kept.length + '건  (창 밖 ' + win.dropped.length + '건 제외)');

/* ── 3단계 · 제외 필터 ────────────────────────────────────────────── */
const exc = applyExclusions(win.kept, { filters, seenUrls });
const excludedCount = win.kept.length - exc.kept.length;
say('3. 제외 필터    ' + exc.kept.length + '건  (' +
  Object.entries(exc.byReason).map(([k, v]) => k + ' ' + v).join(', ') || '제외 없음' + ')');

/* ── 4단계 · 중복 묶음 ────────────────────────────────────────────── */
const { clusters, borderline } = clusterAll(exc.kept, { entityIndex, stopset, weightOf });
const multi = clusters.filter((c) => c.members.length > 1);
say('4. 중복 묶음    ' + clusters.length + '묶음  (2건 이상 묶인 것 ' + multi.length + '개)');

/* ── 6단계 · 점수 (원문 확보 순서를 정하기 위해 먼저 매긴다) ──────── */
const ranked = clusters
  .map((c) => {
    const { parts, score } = scoreCluster(c, { weightOf, anchor });
    const rep = c.representative;
    return {
      url: rep.url,
      canonicalUrl: rep.url,
      sourceTitle: rep.title,
      source: rep.source,
      sourceType: rep.sourceType,
      feedId: rep.feedId,
      publishedAt: rep.publishedAt,
      score,
      scoreParts: parts,
      crossRefs: c.crossRefs,
      clusterSize: c.members.length,
      clusterWhy: c.why,
      rawSummary: rep.rawSummary
    };
  })
  .sort((a, b) => b.score - a.score || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

/* ── 5단계 · 원문 확보 ────────────────────────────────────────────
   P3 — 원문을 못 읽은 기사는 싣지 않고 예비 후보로 교체한다.
   그러려면 점수 순서대로 받아야 하므로 6단계 뒤에 온다. */
const attempt = ranked.slice(0, Math.min(EXTRACT_BUDGET, ranked.length));
const robotsCache = new Map();
const extraction = new Map();

if (!DRY_RUN) {
  if (SAVE_RAW && !FROM) mkdirSync(PAGE_DIR, { recursive: true });
  say('5. 원문 확보    ' + attempt.length + '건 시도' + (ranked.length > attempt.length ? ' (전체 ' + ranked.length + '묶음 중 상위만)' : ''));

  await mapLimit(attempt, CONCURRENCY, async (c) => {
    const cached = pageCachePath(c.url);
    let html = null;

    if (FROM && existsSync(cached)) {
      html = readFileSync(cached, 'utf8');
    } else if (!FROM) {
      const rules = await robotsFor(c.url, robotsCache);
      if (!isAllowed(rules, new URL(c.url).pathname)) {
        extraction.set(c.url, { ok: false, why: 'robots-blocked' });
        return;
      }
      await pageThrottle(c.url);
      try {
        const { res, body } = await fetchText(c.url, { accept: ACCEPT_HTML, attempts: 2, timeoutMs: 20000 });
        if (!res.ok) {
          extraction.set(c.url, { ok: false, why: 'http-' + res.status });
          return;
        }
        html = body;
        if (SAVE_RAW) writeFileSync(cached, html);
      } catch (err) {
        extraction.set(c.url, { ok: false, why: 'fetch-error' });
        return;
      }
    }

    if (html === null) {
      extraction.set(c.url, { ok: false, why: 'no-cached-page' });
      return;
    }

    const got = extractFromHtml(html);
    if (!got.text) {
      extraction.set(c.url, { ok: false, why: 'too-short', chars: got.bestChars ?? 0 });
      return;
    }
    extraction.set(c.url, {
      ok: true,
      via: got.via,
      text: got.text,
      chars: got.text.length,
      pageTitle: titleFromHtml(html)
    });
  });
} else {
  say('5. 원문 확보    건너뜀 (--dry-run)');
}

const withText = DRY_RUN
  ? ranked
  : attempt.filter((c) => extraction.get(c.url)?.ok);

const fetchFailed = DRY_RUN ? 0 : attempt.length - withText.length;

for (const c of withText) {
  if (DRY_RUN) continue;
  const got = extraction.get(c.url);
  c.text = got.text;
  c.textChars = got.chars;
  c.extractedVia = got.via;
  /* 사이트맵 피드는 제목이 없다. 본문에서 건진 제목으로 채운다. */
  if (!c.sourceTitle && got.pageTitle) c.sourceTitle = got.pageTitle;
}

if (!DRY_RUN) say('   → 성공 ' + withText.length + '건 · 실패 ' + fetchFailed + '건');

/* ── 7·8·9단계 · 상한, 중복 배제 안전망, 확정 ────────────────────── */
const safe = withText.filter((c) => !seenUrls.has(c.url));   /* 8단계 안전망 */
const result = select(safe, { target: TARGET });

say('6. 점수 산정    ' + withText.length + '건');
say('7. 상한 적용    한 출처 최대 3건 · 공식 ' + result.primaryCount + '자리 (후보 풀에 ' + result.primaryAvailable + '건)');
if (result.swaps.length) say('   교체 ' + result.swaps.length + '건 — 공식 2자리 보장');
say('9. 확정        ' + result.chosen.length + '건' + (result.shortfall ? '  ← 10건 미달 ' + result.shortfall + '건' : ''));

/* ── 산출물 ───────────────────────────────────────────────────────── */
const funnel = {
  collected: collected.length,
  window24h: win.kept.length,
  excluded: excludedCount,
  deduped: clusters.length,
  fetchFailed,
  scored: withText.length,
  published: result.chosen.length
};

const extractionStats = summarizeExtraction(attempt, extraction);
const scoreMismatch = verify(result.chosen);

const out = {
  date: DATE,
  generatedAt: new Date().toISOString(),
  anchor: anchor.toISOString(),
  windowStart: windowStart(anchor).toISOString(),
  funnel,
  excludedBy: exc.byReason,
  extraction: extractionStats,
  feedStatus,
  shortfall: shortfallNote(result, funnel),
  primaryGuarantee: {
    required: 2,
    achieved: result.primaryCount,
    availableInPool: result.primaryAvailable,
    swaps: result.swaps
  },
  candidates: result.chosen.map((c) => ({
    rank: c.rank,
    url: c.url,
    canonicalUrl: c.canonicalUrl,
    sourceTitle: c.sourceTitle,
    source: c.source,
    sourceType: c.sourceType,
    publishedAt: c.publishedAt,
    score: c.score,
    scoreParts: c.scoreParts,
    crossRefs: c.crossRefs,
    clusterSize: c.clusterSize,
    clusterWhy: c.clusterWhy,
    text: c.text ?? null,
    textChars: c.textChars ?? 0,
    extractedVia: c.extractedVia ?? null
  }))
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'candidates.json'), JSON.stringify(out, null, 2) + '\n');
writeFileSync(join(OUT_DIR, 'funnel.json'), JSON.stringify({ date: DATE, funnel, excludedBy: exc.byReason, extraction: extractionStats }, null, 2) + '\n');
writeFileSync(join(OUT_DIR, 'report.txt'), report(), 'utf8');

if (AS_JSON) console.log(JSON.stringify(out, null, 2));
else {
  say('');
  say('  runs/' + DATE + '/candidates.json   후보 ' + result.chosen.length + '건 (본문 포함, git 제외)');
  say('  runs/' + DATE + '/funnel.json       퍼널 숫자');
  say('  runs/' + DATE + '/report.txt        사람이 읽는 보고서 ← 클러스터와 추출 성공률은 여기서 확인');
}

if (scoreMismatch.length) {
  console.error('');
  console.error('점수 불일치 ' + scoreMismatch.length + '건 — scoreParts 에서 재계산한 값이 다릅니다.');
  for (const m of scoreMismatch) console.error('  ' + m.url + ' 저장 ' + m.stored + ' vs 재계산 ' + m.recomputed);
  process.exit(1);
}

/* ── 보조 ─────────────────────────────────────────────────────────── */

function pageCachePath(url) {
  const h = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return join(PAGE_DIR, h + '.html');
}

function summarizeExtraction(attempted, map) {
  const bySource = new Map();
  for (const c of attempted) {
    if (!bySource.has(c.source)) {
      bySource.set(c.source, { source: c.source, tried: 0, ok: 0, via: { jsonld: 0, article: 0, density: 0 }, failed: {} });
    }
    const row = bySource.get(c.source);
    row.tried++;
    const got = map.get(c.url);
    if (got?.ok) {
      row.ok++;
      row.via[got.via] = (row.via[got.via] ?? 0) + 1;
    } else if (got) {
      row.failed[got.why] = (row.failed[got.why] ?? 0) + 1;
    }
  }
  return [...bySource.values()].sort((a, b) => b.tried - a.tried);
}

function report() {
  const L = [];
  const pad = (s, n) => String(s ?? '').padEnd(n);
  const lp = (s, n) => String(s ?? '').padStart(n);

  L.push('Sarah\'s AI Brief — 수집 보고서');
  L.push('기준일 ' + DATE + ' · 발행 ' + DATE + ' 08:00 KST');
  L.push('창 ' + windowStart(anchor).toISOString() + ' → ' + anchor.toISOString());
  L.push('생성 ' + new Date().toISOString() + (FROM ? ' · 저장된 XML 재실행' : '') + (DRY_RUN ? ' · dry-run' : ''));
  L.push('');

  L.push('── 퍼널 ' + '─'.repeat(60));
  L.push('1. 수집        ' + lp(funnel.collected, 5));
  L.push('2. 시간 필터    ' + lp(funnel.window24h, 5) + '   창 밖 ' + (funnel.collected - funnel.window24h) + '건 제외');
  L.push('3. 제외 필터    ' + lp(funnel.window24h - funnel.excluded, 5) + '   ' +
    (Object.entries(exc.byReason).map(([k, v]) => k + ' ' + v).join(' · ') || '제외 없음'));
  L.push('4. 중복 묶음    ' + lp(funnel.deduped, 5) + '   2건 이상 묶인 것 ' + multi.length + '개');
  L.push('5. 원문 확보    ' + lp(funnel.scored, 5) + '   시도 ' + attempt.length + ' · 실패 ' + funnel.fetchFailed);
  L.push('6·7. 점수·상한 ' + lp(funnel.scored, 5) + '   공식 ' + result.primaryCount + '자리 / 풀에 ' + result.primaryAvailable + '건');
  L.push('9. 확정        ' + lp(funnel.published, 5) + (result.shortfall ? '   ← 10건 미달 ' + result.shortfall + '건' : ''));
  L.push('');

  L.push('── 피드별 수집 ' + '─'.repeat(54));
  for (const f of feedStatus) {
    L.push('  ' + pad(f.id, 13) + pad(f.type, 11) + lp(f.items, 5) + '건  ' + (f.note || ''));
  }
  L.push('');

  L.push('── 확정 후보 ' + '─'.repeat(56));
  if (!out.candidates.length) L.push('  없음');
  for (const c of out.candidates) {
    L.push('  ' + lp(c.rank, 2) + '. [' + c.score + '] ' + c.source + '  ' + kstStamp(c.publishedAt) + ' KST');
    L.push('      ' + c.sourceTitle);
    L.push('      가중치 ' + c.scoreParts.weight + ' · 교차 ' + c.scoreParts.cross + ' (' + c.crossRefs.length + '개 매체) · 신선도 ' + c.scoreParts.fresh);
    if (c.clusterWhy) L.push('      묶음: ' + c.clusterWhy);
    if (c.crossRefs.length) L.push('      함께: ' + c.crossRefs.map((r) => r.source).join(', '));
    L.push('      본문 ' + c.textChars + '자 (' + (c.extractedVia ?? '-') + ')  ' + c.url);
    L.push('');
  }

  L.push('── 매체별 원문 추출 성공률 ' + '─'.repeat(42));
  L.push('  ' + pad('매체', 24) + lp('시도', 5) + lp('성공', 5) + '  경로 / 실패 사유');
  for (const e of extractionStats) {
    const via = Object.entries(e.via).filter(([, v]) => v).map(([k, v]) => k + ' ' + v).join(' ');
    const bad = Object.entries(e.failed).map(([k, v]) => k + ' ' + v).join(' ');
    L.push('  ' + pad(e.source, 24) + lp(e.tried, 5) + lp(e.ok, 5) + '  ' + [via, bad].filter(Boolean).join(' / '));
  }
  L.push('');
  L.push('  이 표가 "자체 추출기로 충분한가"의 판단 자료다. 실패가 한 매체에 몰리면');
  L.push('  그 매체만 따로 보고, 전반적으로 낮으면 라이브러리 도입을 근거를 갖고 검토한다.');
  L.push('');

  L.push('── 묶인 것 (2건 이상) ' + '─'.repeat(47));
  if (!multi.length) L.push('  없음 — 이 창에서는 교차 보도가 잡히지 않았다');
  for (const c of multi) {
    L.push('  · ' + c.representative.source + ' — ' + c.representative.title);
    for (const m of c.members) {
      if (m === c.representative) continue;
      L.push('      + ' + m.source + ' — ' + m.title);
    }
    L.push('      why: ' + c.why);
  }
  L.push('');

  L.push('── 경계 건 (묶이지 않았지만 가까운 쌍) ' + '─'.repeat(31));
  L.push('  엔티티 사전을 보강할 지점을 드러낸다. 같은 사건인데 안 묶였다면 별칭을 추가한다.');
  if (!borderline.length) L.push('  없음');
  for (const b of borderline.slice(0, 25)) {
    L.push('  · jaccard ' + b.jaccard + ' · 공유 [' + b.shared.join(', ') + '] · ' + b.hoursApart + 'h');
    L.push('      A: ' + b.a);
    L.push('      B: ' + b.b);
  }
  if (borderline.length > 25) L.push('  … 외 ' + (borderline.length - 25) + '쌍');
  L.push('');

  L.push('── 제외된 기사 ' + '─'.repeat(54));
  for (const [reason, n] of Object.entries(exc.byReason)) {
    L.push('  ' + reason + ' — ' + n + '건');
    for (const e of exc.log.filter((x) => x.reason === reason).slice(0, 8)) {
      L.push('      ' + e.source + ' — ' + e.title);
    }
    const more = exc.log.filter((x) => x.reason === reason).length - 8;
    if (more > 0) L.push('      … 외 ' + more + '건');
  }
  L.push('');
  return L.join('\n');
}
