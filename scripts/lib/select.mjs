/**
 * 7·9단계 · 상한 적용과 확정 — SPEC 6.3, 원칙 P3/P4
 *
 * 출처 가중치는 특정 매체를 우대하는 장치가 아니라 발행량이 많은 매체가
 * 순위를 독점하는 것을 막는 장치다. 그 의도를 실제로 강제하는 곳이 여기다.
 *
 *   한 출처 최대 3건
 *   공식 발표(primary) 최소 2자리 보장
 *   후보가 모자라면 모자란 채로 확정한다 — 자리를 채우려 기준을 낮추지 않는다
 */
export const TARGET = 10;
export const PER_SOURCE_MAX = 3;
export const PRIMARY_MIN = 2;

export function select(scored, opts = {}) {
  const target = opts.target ?? TARGET;
  const perSource = opts.perSourceMax ?? PER_SOURCE_MAX;
  const primaryMin = opts.primaryMin ?? PRIMARY_MIN;

  /* 점수 내림차순. 동점이면 최신 우선, 그래도 같으면 URL 순 — 결정적이어야 한다. */
  const pool = scored.slice().sort(cmp);

  const chosen = [];
  const counts = new Map();
  const capped = [];

  for (const c of pool) {
    if (chosen.length >= target) break;
    const n = counts.get(c.source) ?? 0;
    if (n >= perSource) { capped.push(c); continue; }
    counts.set(c.source, n + 1);
    chosen.push(c);
  }

  /* 공식 2자리 보장. 후보 풀에 공식이 아예 없으면 보장할 수 없다 — 그건 사실대로 남긴다. */
  const swaps = [];
  const isPrimary = (c) => c.sourceType === 'primary';
  const restPrimaries = pool.filter((c) => isPrimary(c) && !chosen.includes(c));

  while (chosen.filter(isPrimary).length < primaryMin && restPrimaries.length) {
    const incoming = restPrimaries.shift();
    if ((counts.get(incoming.source) ?? 0) >= perSource) continue;

    const nonPrimary = chosen.filter((c) => !isPrimary(c)).sort(cmp);
    const outgoing = nonPrimary[nonPrimary.length - 1];
    if (!outgoing) break;
    /* 들어오는 쪽이 나가는 쪽보다 점수가 높으면 애초에 탐욕 선택에서 뽑혔을 것이다.
       여기서의 교체는 점수를 거스르는 개입이므로 반드시 기록에 남긴다. */
    chosen.splice(chosen.indexOf(outgoing), 1);
    counts.set(outgoing.source, (counts.get(outgoing.source) ?? 1) - 1);
    chosen.push(incoming);
    counts.set(incoming.source, (counts.get(incoming.source) ?? 0) + 1);
    swaps.push({ in: incoming.url, inScore: incoming.score, out: outgoing.url, outScore: outgoing.score });
  }

  chosen.sort(cmp);
  chosen.forEach((c, i) => { c.rank = i + 1; });

  return {
    chosen,
    swaps,
    capped,
    shortfall: chosen.length < target ? target - chosen.length : 0,
    primaryCount: chosen.filter(isPrimary).length,
    primaryAvailable: pool.filter(isPrimary).length
  };
}

function cmp(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  const t = Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  if (t !== 0) return t;
  return a.url < b.url ? -1 : a.url > b.url ? 1 : 0;
}

/** 10건에 못 미친 이유를 Phase 3 에 넘길 초안으로 만든다. */
export function shortfallNote(result, funnel) {
  if (!result.shortfall) return null;
  return {
    missing: result.shortfall,
    fetchFailed: funnel.fetchFailed,
    scored: funnel.scored,
    reason: funnel.fetchFailed > 0 && funnel.scored < TARGET
      ? 'fetch-failed-and-thin-window'
      : funnel.fetchFailed > 0
        ? 'fetch-failed'
        : 'thin-window'
  };
}
