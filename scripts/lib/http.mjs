/**
 * 네트워크 — 타임아웃, 백오프, 호스트별 간격.
 *
 * 재시도 정책은 healthcheck.mjs 에서 그대로 가져왔다.
 *   4xx는 주소가 틀린 것이므로 다시 두드리지 않는다.
 *   5xx와 연결 예외만 재시도한다. hnrss.org 는 실제로 간헐적 502를 낸다.
 *
 * 우리는 남의 서버를 긁는 쪽이므로 UA로 자신을 밝히고 호스트별 간격을 지킨다.
 */
export const UA = 'Mozilla/5.0 (compatible; SarahsAIBrief/1.0)';
export const ACCEPT_FEED = 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*';
export const ACCEPT_HTML = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

export const TIMEOUT_MS = 15000;
export const ATTEMPTS = 3;
const BACKOFF_MS = [2000, 4000];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function originOf(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * 성공/실패와 무관하게 응답을 돌려준다. 4xx도 res 로 온다.
 * 연결 자체가 안 되면 throw. state.attempts 에 시도 횟수를 적는다.
 */
export async function fetchText(url, opts = {}) {
  const accept = opts.accept ?? ACCEPT_FEED;
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
  const attempts = opts.attempts ?? ATTEMPTS;
  const state = opts.state ?? {};
  state.attempts = 1;

  let lastErr = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs)
      });
      const body = await res.text();
      if (res.ok || res.status < 500) return { res, body };
      lastErr = 'HTTP ' + res.status;
      if (attempt === attempts) return { res, body };
    } catch (err) {
      lastErr = err.name === 'TimeoutError' ? '타임아웃 ' + timeoutMs + 'ms' : String(err.message || err);
      if (attempt === attempts) throw new Error(lastErr);
    }
    state.attempts = attempt + 1;
    await sleep(BACKOFF_MS[attempt - 1] ?? 4000);
  }
  throw new Error(lastErr || '알 수 없는 오류');
}

/**
 * 호스트별 최소 간격을 지키는 큐. 같은 매체의 기사 여러 건을 연달아 받을 때
 * 한 서버에 몰아치지 않게 한다.
 */
export function hostThrottle(minGapMs = 1500) {
  const nextFree = new Map();
  return async function wait(url) {
    const origin = originOf(url);
    if (!origin) return;
    const now = Date.now();
    const at = Math.max(now, nextFree.get(origin) ?? 0);
    nextFree.set(origin, at + minGapMs);
    if (at > now) await sleep(at - now);
  };
}

/** 동시 실행 수를 제한하며 순서대로 처리한다. 결과는 입력 순서를 지킨다. */
export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}
