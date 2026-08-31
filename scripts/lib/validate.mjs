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

export const TITLE_MAX = 60;
export const SUMMARY_PARAS = [2, 3];
export const SUMMARY_SENTENCES = [2, 3];
export const IMPLICATION_SENTENCES = [2, 4];
export const INSIGHT_PARAS = [2, 3];
export const INSIGHT_MIN_REFS = 3;
export const MAX_TERMS = 3;

/* 요약은 사실만 담는다. 추측은 시사점의 몫이다 — SPEC 5절 문장 규칙 */
const HEDGE_KO = /(?:으?로|것으로)\s*(?:보인다|예상된다|전망된다|관측된다|풀이된다|분석된다)|전망이다|알려졌다|듯하다|주목된다/;
const HEDGE_EN = /\b(?:is|are|was|were)\s+(?:expected|likely|poised|set)\s+to\b|\bappears?\s+to\b|\bcould\s+(?:be|see|reach)\b|\bmay\s+(?:be|see|reach)\b/i;

/** 마침표·물음표·느낌표 뒤에 공백이나 끝이 오는 것만 문장 끝으로 센다. "3.5%" 는 세지 않는다. */
export function sentenceCount(text) {
  return (String(text).match(/[.!?](?=\s|$)/g) ?? []).length;
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const between = (n, [lo, hi]) => n >= lo && n <= hi;

/** {ko,en} 쌍 중 한쪽만 있는 곳을 전부 찾는다 — SPEC 7절 불변 규칙 */
export function missingPairs(node, path = '') {
  const out = [];
  if (Array.isArray(node)) {
    node.forEach((v, i) => out.push(...missingPairs(v, path + '[' + i + ']')));
    return out;
  }
  if (!node || typeof node !== 'object') return out;

  const keys = Object.keys(node);
  if (keys.includes('ko') || keys.includes('en')) {
    for (const lang of ['ko', 'en']) {
      const v = node[lang];
      const empty = v === undefined || v === null ||
        (typeof v === 'string' && !v.trim()) ||
        (Array.isArray(v) && (!v.length || v.some((p) => !isStr(p))));
      if (empty) out.push((path || '(루트)') + '.' + lang + ' 이 비어 있다');
    }
  }
  for (const k of keys) out.push(...missingPairs(node[k], path ? path + '.' + k : k));
  return out;
}

/** 기사 1건. 모델이 방금 만든 결과를 검사한다. */
export function validateArticle(a, { topicIds, glossaryIds }) {
  const v = [];

  for (const lang of ['ko', 'en']) {
    if (!isStr(a.title?.[lang])) v.push(`title.${lang} 이 비어 있다`);
    else if ([...a.title[lang]].length > TITLE_MAX) {
      v.push(`title.${lang} 이 ${[...a.title[lang]].length}자다 — ${TITLE_MAX}자 이내여야 한다`);
    }

    const paras = a.summary?.[lang];
    if (!Array.isArray(paras) || paras.some((p) => !isStr(p))) {
      v.push(`summary.${lang} 이 문단 배열이 아니다`);
    } else {
      if (!between(paras.length, SUMMARY_PARAS)) {
        v.push(`summary.${lang} 이 ${paras.length}문단이다 — ${SUMMARY_PARAS[0]}~${SUMMARY_PARAS[1]}문단이어야 한다`);
      }
      paras.forEach((p, i) => {
        const n = sentenceCount(p);
        if (!between(n, SUMMARY_SENTENCES)) {
          v.push(`summary.${lang} ${i + 1}번째 문단이 ${n}문장이다 — ${SUMMARY_SENTENCES[0]}~${SUMMARY_SENTENCES[1]}문장이어야 한다`);
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
        v.push(`implication.${lang} 이 ${n}문장이다 — ${IMPLICATION_SENTENCES[0]}~${IMPLICATION_SENTENCES[1]}문장이어야 한다`);
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
export function validateInsight(ins, { articleCount }) {
  const v = [];
  const need = Math.min(INSIGHT_MIN_REFS, articleCount);

  for (const lang of ['ko', 'en']) {
    if (!isStr(ins.title?.[lang])) v.push(`insight.title.${lang} 이 비어 있다`);
    const paras = ins.body?.[lang];
    if (!Array.isArray(paras) || paras.some((p) => !isStr(p))) {
      v.push(`insight.body.${lang} 이 문단 배열이 아니다`);
    } else if (!between(paras.length, INSIGHT_PARAS)) {
      v.push(`insight.body.${lang} 이 ${paras.length}문단이다 — ${INSIGHT_PARAS[0]}~${INSIGHT_PARAS[1]}문단이어야 한다`);
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
    if (!new RegExp('(?:^|[^\d])' + r + '\s*번').test(ko)) v.push(`refs 의 ${r}번이 한국어 본문에 "${r}번" 으로 나오지 않는다`);
    if (!new RegExp('(?:^|[^\d])' + r + '(?![\d])').test(en)) v.push(`refs 의 ${r}번이 영어 본문에 숫자로 나오지 않는다`);
  }

  return v;
}

/** 발행 직전 브리핑 전체. 데이터 계약(SPEC 7절)을 여기서 마지막으로 본다. */
export function validateBrief(brief, { topicIds, glossaryIds }) {
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
    v.push(...validateArticle(a, { topicIds, glossaryIds }).map((m) => at + ' ' + m));
  });

  v.push(...validateInsight({ ...brief.insight, refs: brief.insight?.refs ?? [] },
    { articleCount: brief.articles.length })
    .filter((m) => !m.startsWith('refs'))); /* refs 는 발행 데이터에 남기지 않는다 */

  v.push(...missingPairs({ weekday: brief.weekday, insight: brief.insight, note: brief.note ?? undefined, articles: brief.articles }));

  return v;
}
