/**
 * URL과 제목 정규화.
 *
 * URL 정규화는 P5(같은 링크를 두 번 싣지 않는다)의 판정 기준이다.
 * 같은 기사가 utm 파라미터만 달라 두 번 실리는 일을 막는다.
 */

/* 추적용이라 내용에 영향이 없는 파라미터들. 붙어 있어도 같은 기사다. */
const DROP_PARAMS = [
  /^utm_/i, /^ref$/i, /^ref_/i, /^source$/i, /^fbclid$/i, /^gclid$/i, /^gbraid$/i,
  /^wbraid$/i, /^msclkid$/i, /^mc_cid$/i, /^mc_eid$/i, /^igshid$/i, /^cmpid$/i,
  /^_hsenc$/i, /^_hsmi$/i, /^__twitter_impression$/i, /^guccounter$/i, /^amp$/i
];

export function canonicalUrl(raw) {
  if (!raw) return null;
  let u;
  try {
    u = new URL(String(raw).trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

  u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
  u.hash = '';

  for (const key of [...u.searchParams.keys()]) {
    if (DROP_PARAMS.some((re) => re.test(key))) u.searchParams.delete(key);
  }
  u.searchParams.sort();

  /* 끝 슬래시 하나만 남긴다. 루트('/')는 그대로 둔다. */
  if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, '');

  return u.toString();
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/* " | TechCrunch", " - The Verge", " :: ZDNet" 같은 매체명 꼬리표.
   제목에 남으면 같은 사건의 기사끼리 토큰이 어긋난다. */
export function cleanTitle(title, sourceName) {
  if (!title) return '';
  let t = String(title).replace(/\s+/g, ' ').trim();
  if (sourceName) {
    const esc = sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp('\\s*[|\\-–—:·]{1,2}\\s*' + esc + '\\s*$', 'i'), '');
  }
  return t.trim();
}

/* 제목이 없는 피드(사이트맵)를 위해 URL 슬러그에서 임시 제목을 만든다.
   본문을 확보하면 <title>로 교체된다. */
export function titleFromSlug(url) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop() ?? '';
    return decodeURIComponent(seg).replace(/[-_]+/g, ' ').replace(/\.\w+$/, '').trim();
  } catch {
    return '';
  }
}
