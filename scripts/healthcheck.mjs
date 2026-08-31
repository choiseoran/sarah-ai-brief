#!/usr/bin/env node
/**
 * Sarah's AI Brief — 피드 헬스체크 (SPEC 6.3 파이프라인 0단계)
 *
 * data/meta.js의 feeds를 단일 출처로 삼아 12개 주소를 모두 두드리고,
 * HTTP 상태·항목 수·최신 항목 나이를 보고한다.
 * 수집 전에 돌려서 죽은 피드를 드러내는 것이 목적이다 (SPEC P2).
 *
 * 사용:
 *   node scripts/healthcheck.mjs           사람이 읽는 표
 *   node scripts/healthcheck.mjs --json    funnel.feedStatus 에 넣을 JSON
 *
 * 심각도 구분이 핵심이다:
 *   fail — 4xx, 항목 0건, 발행 시각 없음. 주소가 틀렸다는 뜻이고 사람이 고쳐야 한다.
 *   warn — 5xx, 연결 실패, 오래된 피드. 상대 서버 사정이므로 그날 수집에서만 빠진다.
 * 종료 코드는 fail 이 있을 때만 1이다. hnrss.org 같은 곳은 실제로 간헐적으로
 * 502를 내는데, 그것 때문에 그날 브리핑 발행이 멈추면 안 된다.
 *
 * 파싱과 재시도는 collect.mjs 와 같은 lib/ 를 쓴다. 헬스체크가 통과한 피드를
 * 수집기가 못 읽는 일이 없어야 하므로 두 곳이 같은 코드를 봐야 한다.
 *
 * 의존성 0개. SPEC 8절 제약을 그대로 따른다.
 */
import { loadMeta } from './lib/meta.mjs';
import { fetchText, TIMEOUT_MS } from './lib/http.mjs';
import { itemDates } from './lib/feeds.mjs';

const STALE_DAYS = 7;

async function check(feed) {
  const row = {
    id: feed.id,
    name: feed.name,
    url: feed.url,
    format: feed.format || 'rss',
    attempts: 1,
    status: null,
    items: null,
    items24h: null,
    newestAgeHours: null,
    severity: 'ok',
    note: ''
  };

  let res, xml;
  try {
    const state = {};
    ({ res, body: xml } = await fetchText(feed.url, { state }));
    row.attempts = state.attempts;
  } catch (err) {
    row.severity = 'warn';
    row.note = '연결 실패 — ' + err.message;
    return row;
  }

  row.status = res.status;
  if (!res.ok) {
    row.severity = res.status >= 500 ? 'warn' : 'fail';
    row.note = 'HTTP ' + res.status + (row.attempts > 1 ? ' (' + row.attempts + '회 시도)' : '') +
      (res.status >= 500 ? ' — 상대 서버 일시 장애' : ' — 주소를 고쳐야 함');
    return row;
  }

  const parsed = itemDates(xml, feed).map((d) => (d ? Date.parse(d) : NaN));
  const valid = parsed.filter((t) => Number.isFinite(t));
  const now = Date.now();
  row.items = parsed.length;
  row.items24h = valid.filter((t) => t > now - 86400000).length;
  row.newestAgeHours = valid.length ? +((now - Math.max(...valid)) / 3600000).toFixed(1) : null;

  if (row.items === 0) {
    row.severity = 'fail';
    row.note = '항목 0건 — 주소는 살아있으나 피드가 비었거나 format이 다름';
  } else if (valid.length === 0) {
    row.severity = 'fail';
    row.note = '발행 시각을 읽지 못함 — format 확인 필요';
  } else if (row.newestAgeHours > STALE_DAYS * 24) {
    row.severity = 'warn';
    row.note = '최신 항목이 ' + Math.round(row.newestAgeHours / 24) + '일 전';
  }
  return row;
}

const meta = loadMeta();
const feeds = await Promise.all(meta.feeds.map(check));
const fails = feeds.filter((f) => f.severity === 'fail');
const warns = feeds.filter((f) => f.severity === 'warn');

const report = {
  checkedAt: new Date().toISOString(),
  total: feeds.length,
  ok: feeds.length - fails.length - warns.length,
  warn: warns.length,
  fail: fails.length,
  feeds
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const pad = (s, n) => String(s ?? '').padEnd(n);
  const lpad = (s, n) => String(s ?? '-').padStart(n);
  const MARK = { ok: 'o', warn: '!', fail: 'X' };
  console.log('피드 헬스체크 · ' + report.checkedAt);
  console.log('');
  console.log(pad('', 2) + pad('id', 13) + pad('형식', 9) + lpad('HTTP', 5) + lpad('항목', 6) + lpad('24h', 5) + lpad('최신', 9) + '  비고');
  console.log('-'.repeat(84));
  for (const f of feeds) {
    const age = f.newestAgeHours === null ? '-' : f.newestAgeHours + 'h';
    console.log(
      pad(MARK[f.severity], 2) + pad(f.id, 13) + pad(f.format, 9) + lpad(f.status, 5) +
      lpad(f.items, 6) + lpad(f.items24h, 5) + lpad(age, 9) + '  ' + f.note
    );
  }
  console.log('-'.repeat(84));
  console.log('정상 ' + report.ok + ' · 경고 ' + report.warn + ' · 실패 ' + report.fail + ' / 전체 ' + report.total);
  if (fails.length) {
    console.log('');
    console.log('고쳐야 하는 피드 (종료 코드 1):');
    for (const f of fails) console.log('  ' + f.id + ' — ' + f.note + '\n    ' + f.url);
  }
  if (warns.length) {
    console.log('');
    console.log('오늘 수집에서 빠지는 피드 (발행은 계속):');
    for (const f of warns) console.log('  ' + f.id + ' — ' + f.note);
  }
}

process.exit(fails.length ? 1 : 0);
