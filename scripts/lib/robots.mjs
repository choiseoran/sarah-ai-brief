/**
 * robots.txt 최소 파서.
 *
 * 우리는 남의 서버에서 기사 본문을 받아 오는 쪽이다. 막아 둔 경로는 받지 않는다.
 * 표준의 전부가 아니라 User-agent / Disallow / Allow 세 줄만 읽는다.
 * 판정은 최장 일치 규칙 — 더 구체적인 규칙이 이긴다.
 */
import { fetchText, ACCEPT_HTML, originOf } from './http.mjs';

const OUR_TOKEN = 'sarahsaibrief';

export function parseRobots(txt) {
  const groups = new Map();
  let current = [];
  let expectingAgent = false;

  for (const line of txt.split(/\r?\n/)) {
    const clean = line.replace(/#.*$/, '').trim();
    if (!clean) continue;
    const m = clean.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();

    if (field === 'user-agent') {
      const agent = value.toLowerCase();
      if (!expectingAgent) { current = []; expectingAgent = true; }
      if (!groups.has(agent)) groups.set(agent, current);
      else current = groups.get(agent);
      continue;
    }
    if (field === 'disallow' || field === 'allow') {
      expectingAgent = false;
      current.push({ allow: field === 'allow', path: value });
    }
  }
  return groups.get(OUR_TOKEN) ?? groups.get('*') ?? [];
}

/**
 * 규칙 하나를 정규식으로. robots.txt 의 와일드카드는 두 가지뿐이다.
 *   *  임의의 문자열
 *   $  경로 끝 고정
 * 그 외에는 접두사 일치다.
 *
 * 이걸 대충 처리하면 안 된다. '*' 앞부분만 잘라 접두사로 쓰면
 * 'Disallow: * /trackback/' 이 빈 접두사가 되어 모든 경로를 막고,
 * 패턴이 길다는 이유로 최장 일치에서까지 이긴다. 실측에서 이 버그가
 * TechCrunch·Ars Technica·MIT Technology Review 를 통째로 차단했다.
 */
function toRegex(pattern) {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

export function isAllowed(rules, pathname) {
  let best = null;
  for (const r of rules) {
    if (r.path === '') continue;                 /* 빈 Disallow 는 '전부 허용' */
    if (!(r.re ??= toRegex(r.path)).test(pathname)) continue;
    /* 최장 패턴이 이긴다. 길이가 같으면 Allow 가 이긴다 — 표준의 관례다. */
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) {
      best = r;
    }
  }
  return best ? best.allow : true;
}

/** origin 당 한 번만 받아 캐시한다. 못 받으면 허용으로 본다. */
export async function robotsFor(url, cache) {
  const origin = originOf(url);
  if (!origin) return [];
  if (cache.has(origin)) return cache.get(origin);

  let rules = [];
  try {
    const { res, body } = await fetchText(origin + '/robots.txt', {
      accept: ACCEPT_HTML,
      timeoutMs: 8000,
      attempts: 1
    });
    if (res.ok) rules = parseRobots(body);
  } catch {
    rules = [];
  }
  cache.set(origin, rules);
  return rules;
}
