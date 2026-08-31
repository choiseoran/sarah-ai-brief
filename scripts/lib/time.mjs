/**
 * 시각 — 발행 기준시각, 24시간 창, 신선도.
 *
 * 이 파일이 존재하는 이유는 하나다. 시간 필터가 쓰는 창과 점수식이 쓰는
 * 신선도가 반드시 같은 기준시각에서 나와야 한다. 샘플 데이터를 만들 때
 * 이 둘이 어긋나 9건의 점수가 틀렸다. 값이 두 곳에서 계산되면 또 어긋난다.
 *
 * KST는 서머타임이 없다. UTC+9 고정이므로 산술로 충분하다.
 */
const KST_OFFSET_MS = 9 * 3600 * 1000;
const HOUR_MS = 3600 * 1000;

export const WINDOW_HOURS = 24;
export const PUBLISH_HOUR_KST = 8;

/**
 * 날짜 T의 브리핑은 T 08:00 KST에 나간다. 그 시각이 기준시각이다.
 * '2026-08-31' → 2026-08-30T23:00:00Z
 */
export function anchorFor(date) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, PUBLISH_HOUR_KST, 0, 0) - KST_OFFSET_MS);
}

export function windowStart(anchor) {
  return new Date(anchor.getTime() - WINDOW_HOURS * HOUR_MS);
}

/**
 * 이미 지나간 가장 최근 발행 시각의 날짜.
 *
 * 오전 8시 전에 돌리면 어제치, 8시 이후면 오늘치를 겨냥한다.
 * 아직 오지 않은 창을 겨냥하면 발행 시각이 미래인 기사를 다루게 되므로
 * 항상 '닫힌 창'만 본다. 덕분에 같은 날 몇 번을 돌려도 결과가 같다.
 */
export function defaultDate(now = new Date()) {
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  if (kst.getUTCHours() < PUBLISH_HOUR_KST) kst.setUTCDate(kst.getUTCDate() - 1);
  return kst.toISOString().slice(0, 10);
}

/** 창 안에서 선형. 기준시각에 붙은 기사가 1, 창 시작이 0, 창 밖은 0. */
export function freshness(publishedAt, anchor) {
  const t = publishedAt instanceof Date ? publishedAt.getTime() : Date.parse(publishedAt);
  if (!Number.isFinite(t)) return 0;
  const start = anchor.getTime() - WINDOW_HOURS * HOUR_MS;
  const ratio = (t - start) / (WINDOW_HOURS * HOUR_MS);
  return Math.min(1, Math.max(0, ratio));
}

export function inWindow(publishedAt, anchor) {
  const t = publishedAt instanceof Date ? publishedAt.getTime() : Date.parse(publishedAt);
  if (!Number.isFinite(t)) return false;
  return t > anchor.getTime() - WINDOW_HOURS * HOUR_MS && t <= anchor.getTime();
}

export function hoursApart(a, b) {
  return Math.abs(Date.parse(a) - Date.parse(b)) / HOUR_MS;
}

/** 화면용이 아니라 로그용. KST 벽시계를 그대로 보여준다. */
export function kstStamp(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '?';
  return new Date(t + KST_OFFSET_MS).toISOString().replace('T', ' ').slice(5, 16);
}
