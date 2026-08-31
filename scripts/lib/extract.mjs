/**
 * 5단계 · 원문 확보 — SPEC 6.3, 원칙 P3
 *
 * 여기서 실패한 기사는 후보에서 빠지고, 그만큼 그날 브리핑이 짧아진다.
 * RSS 요약만 보고 요약을 쓰는 것은 하지 않기로 한 일이므로, 실패는 숨기지 않고
 * 건수 감소로 드러낸다.
 *
 * 추출 순서 — 앞의 것이 성공하면 뒤는 시도하지 않는다:
 *   1. JSON-LD  @type ∈ {NewsArticle, Article, BlogPosting …} → articleBody
 *   2. <article> / <main> 안의 <p>
 *   3. 문서 전체의 <p> 중 충분히 긴 것만  (텍스트 밀도 폴백)
 */
import { stripChrome, toText, blocks, tag, selfClosing, decodeEntities } from './xml.mjs';

export const MIN_CHARS = 300;
const MIN_PARA_CHARS = 40;

const ARTICLE_TYPES = new Set([
  'article', 'newsarticle', 'blogposting', 'reportagenewsarticle',
  'techarticle', 'scholarlyarticle', 'liveblogposting'
]);

export function extractFromHtml(html) {
  const jsonld = fromJsonLd(html);
  if (jsonld && jsonld.length >= MIN_CHARS) return { text: jsonld, via: 'jsonld' };

  const stripped = stripChrome(html);

  const scoped = fromScope(stripped);
  if (scoped && scoped.length >= MIN_CHARS) return { text: scoped, via: 'article' };

  const dense = fromParagraphs(stripped);
  if (dense && dense.length >= MIN_CHARS) return { text: dense, via: 'density' };

  /* 무엇이 가장 가까웠는지 남긴다. 실패 원인을 매체별로 보기 위한 것이다. */
  const best = [jsonld, scoped, dense].filter(Boolean).sort((a, b) => b.length - a.length)[0] ?? '';
  return { text: null, via: null, bestChars: best.length };
}

function fromJsonLd(html) {
  const scripts = [...html.matchAll(
    /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([^]*?)<\/script>/gi
  )].map((m) => m[1]);

  for (const raw of scripts) {
    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      continue;
    }
    const body = findArticleBody(parsed);
    if (body) return normalize(body);
  }
  return null;
}

function findArticleBody(node, depth = 0) {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findArticleBody(n, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof node !== 'object') return null;

  const type = node['@type'];
  const types = (Array.isArray(type) ? type : [type]).filter(Boolean).map((t) => String(t).toLowerCase());
  if (types.some((t) => ARTICLE_TYPES.has(t)) && typeof node.articleBody === 'string') {
    return node.articleBody;
  }
  for (const key of ['@graph', 'mainEntity', 'mainEntityOfPage', 'hasPart']) {
    if (node[key]) {
      const found = findArticleBody(node[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function fromScope(stripped) {
  for (const name of ['article', 'main']) {
    const found = blocks(stripped, name);
    if (!found.length) continue;
    const biggest = found.sort((a, b) => b.length - a.length)[0];
    const text = fromParagraphs(biggest);
    if (text) return text;
  }
  return null;
}

/* 본문이 아니라 페이지 장식인 문단들. 밀도 폴백은 문서 전체의 <p>를 긁으므로
   기사 머리의 '입력 :2026/08/31 15:08 수정:' 같은 줄이 본문 첫 문단이 되어 버린다.
   매체별 선택자를 박지 않고 잡을 수 있는 것만 잡는다. */
const BOILERPLATE = [
  /저작권|무단\s*전재|재배포|all rights reserved|ⓒ|©/i,
  /^\s*(?:입력|수정|등록)\s*[:：]/,
  /^[^가-힣a-z]*(?:입력|수정)\s*[:：]?\s*\d{4}[./-]\d{1,2}[./-]\d{1,2}/i,
  /^\s*\[?(?:사진|영상|자료)\s*[=:]/
];

function isBoilerplate(t) {
  return BOILERPLATE.some((re) => re.test(t));
}

function fromParagraphs(html) {
  const paras = [...html.matchAll(/<p(?:>|[ \t\r\n][^>]*>)([^]*?)<\/p>/gi)]
    .map((m) => toText(m[1]))
    .filter((t) => t.length >= MIN_PARA_CHARS && !isBoilerplate(t));
  if (!paras.length) return null;
  return normalize(paras.join('\n\n'));
}

function normalize(s) {
  return decodeEntities(String(s))
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t ]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 제목이 없는 피드(사이트맵)를 위해 문서에서 제목을 건진다. */
export function titleFromHtml(html) {
  const og = selfClosing(html, 'meta').find(
    (m) => (m.property === 'og:title' || m.name === 'og:title') && m.content
  );
  if (og) return og.content.trim();
  const t = tag(html, 'title');
  return t ? decodeEntities(t).trim() : '';
}
