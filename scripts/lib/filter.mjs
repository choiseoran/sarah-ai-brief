/**
 * 2·3단계 · 시간 필터와 제외 필터 — SPEC 6.3 / 6.4
 *
 * 제외는 건마다 사유를 남긴다. 데이터 페이지가 "몇 건을 왜 뺐는가"를
 * 보여주려면 숫자만으로는 부족하다 (P2).
 */
import { inWindow } from './time.mjs';
import { hostOf } from './normalize.mjs';

/* 영문 키워드는 단어 경계를 지켜야 한다. 'ai' 가 'said'·'chair' 에 걸리면
   필터가 아무것도 거르지 못한다. 한글은 조사가 붙어 늘어나므로 부분 일치가 맞다. */
function buildMatcher(list) {
  const ko = [];
  const en = [];
  for (const w of list) (/[가-힣]/.test(w) ? ko : en).push(w.toLowerCase());
  const enRe = en.length
    ? new RegExp('(?<![a-z0-9])(?:' + en.map(esc).join('|') + ')(?![a-z0-9])', 'i')
    : null;
  return function match(text) {
    const t = (text || '').toLowerCase();
    if (enRe && enRe.test(t)) return true;
    return ko.some((w) => t.includes(w));
  };
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function buildFilters(lexicon) {
  const strong = buildMatcher([...lexicon.aiKeywords.strong.en, ...lexicon.aiKeywords.strong.ko]);
  const weak = buildMatcher([...lexicon.aiKeywords.weak.en, ...lexicon.aiKeywords.weak.ko]);
  const isPromo = buildMatcher([...lexicon.promo.en, ...lexicon.promo.ko]);
  const selfPrefixes = lexicon.communitySelf.map((s) => s.toLowerCase());

  /**
   * AI 기사인가 — 판정은 제목이 한다.
   *
   * 본문이나 요약 어디든 'AI'가 한 번 스치면 통과시켰더니 전기설비 수주 기사와
   * 게임 업데이트 기사가 그대로 들어왔다. 하루 10건을 고르는 브리핑이 실을 기사는
   * AI'에 관한' 기사이고, 그런 기사는 표제가 그렇다고 말한다.
   *
   *   ① 제목에 확실한 AI 용어가 있으면 통과
   *   ② 제목에 인접 용어(반도체·로봇·데이터센터 …)가 있고 요약에 확실한 용어가 있으면 통과
   *   ③ 그 외는 제외
   */
  const isAi = (title, summary) => strong(title) || (weak(title) && strong(summary));

  return { isAi, isPromo, selfPrefixes, strong, weak };
}

/**
 * 제외 사유 하나를 돌려준다. 통과하면 null.
 * 순서가 곧 우선순위다 — 한 기사가 여러 사유에 걸려도 첫 사유로 집계한다.
 */
export function excludeReason(item, ctx) {
  const { filters, seenUrls } = ctx;

  /* 이미 실린 기사. SPEC 6.3 은 8단계에 두었지만 6.4 의 제외 규칙이기도 하다.
     여기서 빼는 이유는 두 가지 — 뒤에서 빼면 10자리에 구멍이 나고,
     이미 실은 기사를 다시 크롤링할 이유가 없다. */
  if (seenUrls.has(item.url)) return 'already-published';

  /* HN 텍스트 포스트와 자기소개 글. 링크가 HN 자신을 가리키면 원문이 없다. */
  const title = item.title.toLowerCase();
  if (ctx.filters.selfPrefixes.some((p) => title.startsWith(p))) return 'community-self';
  if (item.sourceType === 'community' && hostOf(item.url).endsWith('ycombinator.com')) {
    return 'community-self';
  }

  /* 공식 4개 피드는 AI 기업의 자체 발표다. 키워드 검사를 면제한다. */
  if (item.sourceType !== 'primary' && !filters.isAi(item.title, item.rawSummary)) return 'not-ai';

  /* 홍보·행사·인사 공지. 두 가지를 제한한다 —
     공식 발표의 'Introducing …' 을 죽이지 않으려고 업계·국내 피드에만 적용하고,
     제목만 본다. 요약문에 '개최·협약'이 스치는 것으로 걸었더니 휴머노이드 생태계
     기사와 헬스케어 AI 도입 기사가 함께 죽었다. */
  if ((item.sourceType === 'industry' || item.sourceType === 'domestic') && filters.isPromo(item.title)) {
    return 'promo';
  }

  return null;
}

export function applyWindow(items, anchor) {
  const kept = [];
  const dropped = [];
  for (const it of items) (inWindow(it.publishedAt, anchor) ? kept : dropped).push(it);
  return { kept, dropped };
}

export function applyExclusions(items, ctx) {
  const kept = [];
  const byReason = {};
  const log = [];
  for (const it of items) {
    const reason = excludeReason(it, ctx);
    if (!reason) {
      kept.push(it);
      continue;
    }
    byReason[reason] = (byReason[reason] ?? 0) + 1;
    log.push({ reason, source: it.source, title: it.title, url: it.url });
  }
  return { kept, byReason, log };
}

/**
 * P5 — 이미 발행한 URL 집합. 별도 저장소를 두지 않는다.
 * 발행된 아카이브(data/briefs.js)가 곧 상태이므로 둘이 어긋날 수 없다.
 *
 * exceptDate 는 지금 만들고 있는 날짜다. P5 는 **지난** 브리핑에 대한 규칙이지
 * 지금 다시 만드는 날짜에 대한 것이 아니다. 이것을 빼지 않으면 한 번 발행한 날짜를
 * 다시 수집할 때 자기가 방금 실은 URL을 스스로 걸러 후보가 0건이 된다.
 */
export function seenUrlSet(briefs, canonical, exceptDate = null) {
  const set = new Set();
  for (const b of briefs) {
    if (exceptDate && b.date === exceptDate) continue;
    for (const a of b.articles ?? []) {
      const u = canonical(a.url);
      if (u) set.add(u);
      for (const c of a.crossRefs ?? []) {
        const cu = canonical(c.url);
        if (cu) set.add(cu);
      }
    }
  }
  return set;
}
