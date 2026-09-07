/**
 * Phase 3 · 생성 결과 검증 — SPEC 5절(콘텐츠 규격)·7절(데이터 계약)
 *
 * 발행 전 사람 검토를 두지 않기로 했으므로(자동 발행 + 사후 정정) 여기가 유일한 게이트다.
 * 프롬프트는 부탁이고 이 파일이 규칙이다. 규격을 어긴 기사는 한 번 다시 만들어 보고,
 * 그래도 어기면 그 기사를 빼고 발행한다 — 자리를 채우려 규격을 낮추지 않는다(P3의 정신).
 *
 * SPEC 의 숫자는 여기에 그대로 적는다.
 */
import { scoreFrom } from './score.mjs';

/*
 * 발행 언어. data/meta.js 의 site.languages 가 정하고 부르는 쪽이 ctx.langs 로 넘긴다.
 * 넘기지 않으면 한/영 둘 다 — 게이트는 기본값이 느슨한 쪽이 아니라 **엄한 쪽**이어야 한다.
 * 끈 언어는 검사하지 않을 뿐 규격이 달라지지는 않는다. 켠 언어는 예전과 똑같이 본다.
 */
export const ALL_LANGS = ['ko', 'en'];
const langsOf = (ctx) => (Array.isArray(ctx?.langs) && ctx.langs.length ? ctx.langs : ALL_LANGS);

export const TITLE_MAX = 60;
/*
 * 요약은 2문단 × 2문장 고정이다 — 범위가 아니다.
 * 상한을 열어 두면 모델이 늘 상한을 채우므로 상한이 곧 실측 분량이 된다.
 * 09-01·09-02 두 번의 발행에서 19건 전부가 3문단을 채워 한국어 요약이 평균 750자였다.
 * 첫 문단은 사건, 둘째 문단은 그 사건을 재는 숫자. 가용성·요금·일정은 원문 링크가 진다.
 */
export const SUMMARY_PARAS = [2, 2];
/*
 * 문장은 상한만 규격이다 — 프롬프트는 2문장을 부탁하고 검증기는 1문장도 통과시킨다.
 * 관측된 실패 방식은 늘 "넘친다" 쪽이었지 "모자란다" 쪽이 아니었다. 하한을 2로 조이면
 * 줄이려는 목적에 아무 보탬도 없이 드랍 사유만 하나 늘어난다 — 약어 오판으로
 * 멀쩡한 기사 3건이 빠진 전례가 있다.
 */
export const SUMMARY_SENTENCES = [1, 2];
/*
 * 시사점도 상한이 곧 실측 분량이었다 — 09-01~09-04 서른일곱 건 중 서른세 건이
 * 상한인 4문장을 채워 평균 313자였다. 판단은 길다고 깊어지지 않는다.
 * 하한을 2에서 1로 내린 것은 요약·인사이트와 같은 규율이다(문장은 상한만 규격).
 */
export const IMPLICATION_SENTENCES = [1, 2];
/*
 * 인사이트도 2문단 고정이다 — 요약과 같은 이유로 상한이 곧 실측 분량이 된다.
 * 09-01~09-04 네 번의 발행이 전부 3문단 상한을 채워 976~1088자였다.
 * 아침에 가장 먼저 읽는 글이고 메일에서는 맨 위에 오므로 그 길이는 길다.
 */
export const INSIGHT_PARAS = [2, 2];
/*
 * 문장은 상한만 규격이다. 요약과 같은 판단이지만 여기서는 이유가 하나 더 있다 —
 * 인사이트가 끝내 실패하면 **그날은 발행하지 않는다.** 하한을 조여도 분량은 줄지 않고
 * 하루치가 통째로 멈출 사유만 늘어난다. 편집 지침은 2~3문장을 부탁한다(lib/prompt.mjs).
 */
export const INSIGHT_SENTENCES = [1, 3];
export const INSIGHT_MIN_REFS = 3;
export const MAX_TERMS = 3;

/* 요약은 사실만 담는다. 추측은 시사점의 몫이다 — SPEC 5절 문장 규칙 */
const HEDGE_KO = /(?:으?로|것으로)\s*(?:보인다|예상된다|전망된다|관측된다|풀이된다|분석된다)|전망이다|알려졌다|듯하다|주목된다/;
const HEDGE_EN = /\b(?:is|are|was|were)\s+(?:expected|likely|poised|set)\s+to\b|\bappears?\s+to\b|\bcould\s+(?:be|see|reach)\b|\bmay\s+(?:be|see|reach)\b/i;

/*
 * 영어 약어의 마침표를 문장 끝으로 세면 멀쩡한 기사가 규격 위반으로 빠진다.
 * 실측에서 "Aug. 31", "Samsung Electronics Co.", "U.S." 때문에 3문장짜리 문단이
 * 4~5문장으로 세어져 기사 3건이 드랍됐다. 세는 방식이 틀리면 규격이 아니라 검사기가 문제다.
 */
const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|Inc|Ltd|Co|Corp|Gov|Sen|Rep|Univ|Dept|Est|vs|etc|approx|No|Nos|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\./gi;
const DOTTED = /\b(?:[A-Z]\.){1,3}/g;            /* U.S. · U.K. · J.R. · 이니셜 */
const LATIN = /\b(?:e\.g|i\.e|a\.m|p\.m)\./gi;

/** 마침표·물음표·느낌표 뒤에 공백이나 끝이 오는 것만 문장 끝으로 센다. "3.5%" 는 세지 않는다. */
export function sentenceCount(text) {
  const t = String(text)
    .replace(LATIN, 'X')
    .replace(ABBREV, 'X')
    .replace(DOTTED, 'X');
  /* 닫는 따옴표·괄호가 마침표 뒤에 오는 문장이 있다 — `... AI supply chain."`
     이것을 못 세면 3문장짜리 영어 문단이 1문장으로 세어져 규격 위반이 된다. */
  return (t.match(/[.!?]["'”’)\]]*(?=\s|$)/g) ?? []).length;
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const between = (n, [lo, hi]) => n >= lo && n <= hi;
/* 위반 문구는 그대로 모델에게 되돌아가는 재시도 지시다. "2~2문단" 이라고 쓰면 안 된다. */
const range = ([lo, hi]) => (lo === hi ? String(lo) : lo + '~' + hi);

/** 발행 언어 중 값이 빠진 곳을 전부 찾는다 — SPEC 7절 불변 규칙 */
export function missingPairs(node, path = '', langs = ALL_LANGS) {
  const out = [];
  if (Array.isArray(node)) {
    node.forEach((v, i) => out.push(...missingPairs(v, path + '[' + i + ']', langs)));
    return out;
  }
  if (!node || typeof node !== 'object') return out;

  const keys = Object.keys(node);
  if (keys.some((k) => ALL_LANGS.includes(k))) {
    for (const lang of langs) {
      const v = node[lang];
      const empty = v === undefined || v === null ||
        (typeof v === 'string' && !v.trim()) ||
        (Array.isArray(v) && (!v.length || v.some((p) => !isStr(p))));
      if (empty) out.push((path || '(루트)') + '.' + lang + ' 이 비어 있다');
    }
  }
  for (const k of keys) out.push(...missingPairs(node[k], path ? path + '.' + k : k, langs));
  return out;
}

/** 기사 1건. 모델이 방금 만든 결과를 검사한다. */
export function validateArticle(a, ctx) {
  const { topicIds, glossaryIds } = ctx;
  const v = [];

  for (const lang of langsOf(ctx)) {
    if (!isStr(a.title?.[lang])) v.push(`title.${lang} 이 비어 있다`);
    else if ([...a.title[lang]].length > TITLE_MAX) {
      v.push(`title.${lang} 이 ${[...a.title[lang]].length}자다 — ${TITLE_MAX}자 이내여야 한다`);
    }

    const paras = a.summary?.[lang];
    if (!Array.isArray(paras) || paras.some((p) => !isStr(p))) {
      v.push(`summary.${lang} 이 문단 배열이 아니다`);
    } else {
      if (!between(paras.length, SUMMARY_PARAS)) {
        v.push(`summary.${lang} 이 ${paras.length}문단이다 — ${range(SUMMARY_PARAS)}문단이어야 한다`);
      }
      paras.forEach((p, i) => {
        const n = sentenceCount(p);
        if (!between(n, SUMMARY_SENTENCES)) {
          v.push(`summary.${lang} ${i + 1}번째 문단이 ${n}문장이다 — ${range(SUMMARY_SENTENCES)}문장이어야 한다`);
        }
      });
      const hedge = lang === 'ko' ? HEDGE_KO : HEDGE_EN;
      const bad = paras.filter((p) => hedge.test(p));
      if (bad.length) {
        v.push(`summary.${lang} 에 추측 표현이 있다 ("${(bad[0].match(hedge) ?? [''])[0]}") — 요약은 사실만 담고 판단은 implication 으로 옮긴다`);
      }
    }

    const imp = a.implication?.[lang];
    if (!isStr(imp)) v.push(`implication.${lang} 이 비어 있다`);
    else {
      const n = sentenceCount(imp);
      if (!between(n, IMPLICATION_SENTENCES)) {
        v.push(`implication.${lang} 이 ${n}문장이다 — ${range(IMPLICATION_SENTENCES)}문장이어야 한다`);
      }
    }
  }

  if (!topicIds.includes(a.topic)) v.push(`topic "${a.topic}" 은 12개 주제에 없다`);

  const terms = a.terms ?? [];
  if (!Array.isArray(terms)) v.push('terms 가 배열이 아니다');
  else {
    if (terms.length > MAX_TERMS) v.push(`terms 가 ${terms.length}개다 — ${MAX_TERMS}개 이내`);
    for (const id of terms) if (!glossaryIds.includes(id)) v.push(`terms 의 "${id}" 는 용어사전에 없는 id 다`);
  }

  return v;
}

/** 오늘의 인사이트. 10건을 가로질러 읽었는지 — 근거 3건이 그 증거다. */
export function validateInsight(ins, ctx) {
  const { articleCount } = ctx;
  const langs = langsOf(ctx);
  const v = [];
  const need = Math.min(INSIGHT_MIN_REFS, articleCount);

  for (const lang of langs) {
    if (!isStr(ins.title?.[lang])) v.push(`insight.title.${lang} 이 비어 있다`);
    const paras = ins.body?.[lang];
    if (!Array.isArray(paras) || paras.some((p) => !isStr(p))) {
      v.push(`insight.body.${lang} 이 문단 배열이 아니다`);
    } else {
      if (!between(paras.length, INSIGHT_PARAS)) {
        v.push(`insight.body.${lang} 이 ${paras.length}문단이다 — ${range(INSIGHT_PARAS)}문단이어야 한다`);
      }
      paras.forEach((para, i) => {
        const n = sentenceCount(para);
        if (!between(n, INSIGHT_SENTENCES)) {
          v.push(`insight.body.${lang} ${i + 1}번째 문단이 ${n}문장이다 — ${range(INSIGHT_SENTENCES)}문장이어야 한다`);
        }
      });
    }
  }

  const refs = [...new Set(ins.refs ?? [])];
  if (refs.length < need) {
    v.push(`refs 가 ${refs.length}건이다 — 서로 다른 기사 ${need}건 이상을 근거로 들어야 한다`);
  }
  for (const r of refs) {
    if (!Number.isInteger(r) || r < 1 || r > articleCount) v.push(`refs 의 ${r} 번 기사는 오늘 실리지 않았다`);
  }

  /* 번호를 refs 에만 적고 본문에서는 언급하지 않는 일이 실제로 생긴다. 본문에 있어야 근거다. */
  const ko = (ins.body?.ko ?? []).join(' ');
  const en = (ins.body?.en ?? []).join(' ');
  for (const r of refs) {
    if (langs.includes('ko') && !new RegExp('(?:^|[^\d])' + r + '\s*번').test(ko)) {
      v.push(`refs 의 ${r}번이 한국어 본문에 "${r}번" 으로 나오지 않는다`);
    }
    if (langs.includes('en') && !new RegExp('(?:^|[^\d])' + r + '(?![\d])').test(en)) {
      v.push(`refs 의 ${r}번이 영어 본문에 숫자로 나오지 않는다`);
    }
  }

  return v;
}

/** 발행 직전 브리핑 전체. 데이터 계약(SPEC 7절)을 여기서 마지막으로 본다. */
export function validateBrief(brief, ctx) {
  const langs = langsOf(ctx);
  const v = [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(brief.date)) v.push('date 가 YYYY-MM-DD 가 아니다');
  if (!['daily', 'weekly'].includes(brief.type)) v.push('type 이 daily/weekly 가 아니다');
  if (brief.funnel?.published !== brief.articles.length) {
    v.push(`funnel.published(${brief.funnel?.published}) 와 실린 기사 수(${brief.articles.length})가 다르다`);
  }
  if (brief.articles.length < 10 && !brief.note) v.push('10건 미달인데 note 가 없다 — 사유를 상단에 표기해야 한다 (P3)');

  brief.articles.forEach((a, i) => {
    const at = 'articles[' + i + ']';
    if (a.rank !== i + 1) v.push(`${at}.rank 가 ${a.rank} 다 — ${i + 1} 이어야 한다`);
    const id = brief.date + '-' + String(i + 1).padStart(2, '0');
    if (a.id !== id) v.push(`${at}.id 가 "${a.id}" 다 — "${id}" 여야 한다`);
    if (!isStr(a.url)) v.push(`${at}.url 이 없다 — 링크 없는 기사는 싣지 않는다`);
    if (!/^\d{4}-\d{2}-\d{2}T/.test(a.publishedAt ?? '')) v.push(`${at}.publishedAt 이 ISO8601 UTC 가 아니다`);
    const again = scoreFrom(a.scoreParts ?? {});
    if (again !== a.score) v.push(`${at}.score 가 ${a.score} 인데 scoreParts 에서는 ${again} 이 나온다 — 데이터 페이지가 점수를 재현할 수 없다`);
    v.push(...validateArticle(a, ctx).map((m) => at + ' ' + m));
  });

  v.push(...validateInsight({ ...brief.insight, refs: brief.insight?.refs ?? [] },
    { articleCount: brief.articles.length, langs })
    .filter((m) => !m.startsWith('refs'))); /* refs 는 발행 데이터에 남기지 않는다 */

  v.push(...missingPairs(
    { weekday: brief.weekday, insight: brief.insight, note: brief.note ?? undefined, articles: brief.articles },
    '', langs));

  return v;
}
