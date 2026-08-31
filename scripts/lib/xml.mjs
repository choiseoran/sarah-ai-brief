/**
 * XML/HTML 조각 다루기 — 의존성 0개.
 *
 * 파서라고 부를 만한 물건이 아니다. 우리가 읽는 피드는 12개뿐이고
 * 형태를 전부 눈으로 확인했다. 그 12개를 읽는 데 필요한 만큼만 있다.
 */

/** <name>…</name> 블록의 내용만 모아 준다. <urlset>이 <url>에 걸리지 않도록
 *  여는 태그 뒤를 '>' 또는 공백으로 못박는다. [^]는 개행 포함 임의 문자. */
export function blocks(xml, name) {
  const re = new RegExp('<' + name + '(?:>|[ \\t\\r\\n][^>]*>)([^]*?)</' + name + '>', 'g');
  return [...xml.matchAll(re)].map((m) => m[1]);
}

/** 블록 안에서 태그 하나의 텍스트를 꺼낸다. 없으면 null. */
export function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '(?:>|[ \\t\\r\\n][^>]*>)([^]*?)</' + name + '>'));
  if (!m) return null;
  return unwrapCdata(m[1]).trim();
}

/** 자기닫는 태그의 속성값. atom의 <link rel="alternate" href="…"/> 때문에 필요하다.
 *  같은 이름의 태그가 여러 개면 모두 돌려준다: [{ rel, href, … }] */
export function selfClosing(block, name) {
  const re = new RegExp('<' + name + '([ \\t\\r\\n][^>]*?)/?>', 'g');
  return [...block.matchAll(re)].map((m) => {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = decodeEntities(a[2]);
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*'([^']*)'/g)) attrs[a[1]] = decodeEntities(a[2]);
    return attrs;
  });
}

export function unwrapCdata(s) {
  return s.replaceAll('<![CDATA[', '').replaceAll(']]>', '');
}

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', middot: '·', times: '×', deg: '°',
  eacute: 'é', egrave: 'è', uuml: 'ü', ouml: 'ö', auml: 'ä', ccedil: 'ç'
};

/** 제목의 엔티티를 풀지 않으면 토큰화가 어긋나고 클러스터가 갈라진다.
 *  &#8217; 하나 때문에 같은 사건이 두 묶음이 되는 일을 막는다. */
export function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, n) => (n in NAMED ? NAMED[n] : m));
}

function safeChar(code) {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

/** 통째로 지워야 하는 요소들. 본문 추출 전에 먼저 턴다. */
const DROP = ['script', 'style', 'noscript', 'svg', 'iframe', 'form', 'nav', 'footer', 'aside', 'header'];

export function stripChrome(html) {
  let out = html;
  for (const t of DROP) {
    out = out.replace(new RegExp('<' + t + '[^>]*>[^]*?</' + t + '>', 'gi'), ' ');
  }
  return out.replace(/<!--[^]*?-->/g, ' ');
}

/** 태그를 벗기고 공백을 정리한다. 블록 요소 자리에는 개행을 남긴다. */
export function toText(html) {
  return decodeEntities(
    html
      .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr)\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/[ \t ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
