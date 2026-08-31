/**
 * 6단계 · 점수 산정 — SPEC 6.2
 *
 *   score = 0.40 × 출처가중치 + 0.35 × 교차보도 + 0.25 × 신선도
 *
 * scoreParts 를 그대로 실어 보내므로 데이터 페이지가 점수를 재현할 수 있다 (P2).
 * 그러려면 저장된 값에서 다시 계산해도 같은 수가 나와야 한다. 그래서 신선도를
 * 먼저 소수 둘째 자리로 반올림한 뒤 그 값으로 점수를 낸다.
 */
import { freshness } from './time.mjs';

export const W_SOURCE = 0.40;
export const W_CROSS = 0.35;
export const W_FRESH = 0.25;
export const CROSS_CAP = 4;

/* 0.4*1.0 + 0.35*0.5 + 0.25*0.8 은 0.774999… 가 된다. 이 보정이 없으면 78이 77이 된다. */
const EPS = 1e-9;

export function scoreFrom(parts) {
  return Math.round((W_SOURCE * parts.weight + W_CROSS * parts.cross + W_FRESH * parts.fresh) * 100 + EPS);
}

export function crossScore(independentSources) {
  return Math.min(independentSources, CROSS_CAP) / CROSS_CAP;
}

export function scoreCluster(cluster, { weightOf, anchor }) {
  const rep = cluster.representative;
  const parts = {
    weight: weightOf(rep.sourceType),
    cross: crossScore(cluster.crossCount),
    fresh: round2(freshness(rep.publishedAt, anchor))
  };
  return { parts, score: scoreFrom(parts) };
}

const round2 = (n) => Math.round(n * 100 + EPS) / 100;

/** 검증용 — 저장된 scoreParts 에서 점수를 다시 계산해 대조한다. */
export function verify(candidates) {
  const bad = [];
  for (const c of candidates) {
    const again = scoreFrom(c.scoreParts);
    if (again !== c.score) bad.push({ url: c.url, stored: c.score, recomputed: again });
  }
  return bad;
}
