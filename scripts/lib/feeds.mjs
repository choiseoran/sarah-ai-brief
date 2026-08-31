/**
 * 1단계 · 수집 — SPEC 6.3
 *
 * 세 가지 형식을 읽어 하나의 형태로 정규화한다. 형식별 차이는 여기서 끝나고,
 * 이후 단계는 항목이 어느 피드에서 왔는지 신경 쓰지 않는다.
 *
 *   rss      <item>    title / link            / pubDate ‖ dc:date
 *   atom     <entry>   title / link[alternate] / published ‖ updated
 *   sitemap  <url>     (제목 없음) loc         / lastmod
 */
import { blocks, tag, selfClosing, decodeEntities, toText, unwrapCdata } from './xml.mjs';
import { canonicalUrl, cleanTitle, titleFromSlug } from './normalize.mjs';

export function parseFeed(xml, feed) {
  const format = feed.format || 'rss';
  const raw =
    format === 'sitemap' ? fromSitemap(xml, feed) :
    format === 'atom' ? fromAtom(xml) :
    fromRss(xml);

  const out = [];
  for (const it of raw) {
    const url = canonicalUrl(it.url);
    const ts = it.when ? Date.parse(it.when) : NaN;
    if (!url || !Number.isFinite(ts)) continue;

    const title = cleanTitle(decodeEntities(it.title || ''), feed.name) || titleFromSlug(url);
    out.push({
      feedId: feed.id,
      source: feed.name,
      sourceType: feed.type,
      title,
      url,
      publishedAt: new Date(ts).toISOString(),
      rawSummary: it.summary ? toText(it.summary).slice(0, 1200) : '',
      /* HN 은 링크가 외부 기사를 가리키고 <comments>가 토론 페이지다.
         텍스트 포스트만 링크가 HN 자신을 가리킨다 — 3단계에서 걸러진다. */
      discussion: it.discussion ? canonicalUrl(it.discussion) : null
    });
  }
  return dedupeByUrl(out);
}

function fromRss(xml) {
  return blocks(xml, 'item').map((b) => ({
    title: tag(b, 'title'),
    url: tag(b, 'link'),
    when: tag(b, 'pubDate') || tag(b, 'dc:date') || tag(b, 'date'),
    summary: tag(b, 'description') || tag(b, 'content:encoded'),
    discussion: tag(b, 'comments')
  }));
}

function fromAtom(xml) {
  return blocks(xml, 'entry').map((b) => {
    /* <id>는 주소가 아닐 수 있다. The Verge 는 'https://www.theverge.com/?p=986541'.
       반드시 link[rel=alternate] 의 href 를 쓴다. */
    const links = selfClosing(b, 'link');
    const alt = links.find((l) => l.rel === 'alternate' && l.href) || links.find((l) => l.href);
    return {
      title: tag(b, 'title'),
      url: alt?.href || tag(b, 'id'),
      when: tag(b, 'published') || tag(b, 'updated'),
      summary: tag(b, 'summary') || tag(b, 'content')
    };
  });
}

function fromSitemap(xml, feed) {
  return blocks(xml, 'url')
    .map((b) => ({ url: tag(b, 'loc'), when: tag(b, 'lastmod') }))
    .filter((it) => it.url && (!feed.pathPrefix || it.url.includes(feed.pathPrefix)))
    .map((it) => ({ title: null, url: it.url, when: it.when, summary: null }));
}

function dedupeByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    out.push(it);
  }
  return out;
}

/** healthcheck 가 쓰는 얇은 표면. 항목별 발행 시각 문자열만 필요하다. */
export function itemDates(xml, feed) {
  const format = feed.format || 'rss';
  const raw =
    format === 'sitemap' ? fromSitemap(xml, feed) :
    format === 'atom' ? fromAtom(xml) :
    fromRss(xml);
  return raw.map((it) => it.when);
}

export { unwrapCdata };
