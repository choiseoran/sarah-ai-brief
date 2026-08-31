/**
 * 산출물이 SPEC 규칙을 지키는가 — 6.2 점수식, P3, P4, P5, P2 퍼널
 *
 * 검사 대상은 구현 세부가 아니라 명세가 약속한 것이다.
 * 픽스처로 항상 돌고, runs/ 에 실제 산출물이 있으면 가장 최근 것도 함께 본다.
 *   픽스처  — 저장소를 새로 받아도 검사할 것이 있게 한다. runs/ 는 gitignore 대상이다.
 *   실제 것 — 픽스처가 통과해도 진짜 수집 결과는 틀릴 수 있다.
 *
 * 네트워크를 쓰지 않는다.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { scoreFrom } from '../lib/score.mjs';
import { loadBriefs } from '../lib/meta.mjs';
import { canonicalUrl } from '../lib/normalize.mjs';

/* SPEC 의 값을 여기에 못박는다. lib/ 에서 import 하면 안 된다 —
   상수를 바꾸는 순간 테스트도 따라 움직여서 명세 위반을 못 잡는다.
   이 숫자들을 고쳐야 한다면 SPEC 을 먼저 고치고 여기를 함께 고치는 것이 맞다. */
const SPEC_TARGET = 10;          // 6.3 9단계 — 상위 10건
const SPEC_PER_SOURCE_MAX = 3;   // P4 — 한 출처 최대 3건
const SPEC_PRIMARY_MIN = 2;      // P4 — 공식 발표 최소 2자리
const SPEC_CROSS_CAP = 4;        // 6.2 — 교차 보도 4건에서 상한
const SPEC_MIN_CHARS = 300;      // P3 — 이보다 짧으면 원문 확보 실패

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');

export const name = '후보 산출물 규칙';

/**
 * 이미 발행된 URL 집합 — P5 의 판정 기준 (별도 저장소 없이 아카이브가 곧 상태다).
 *
 * P5 는 **지난** 브리핑에 대한 규칙이다. 지금 검사하는 날짜의 브리핑이 이미 발행돼 있다면
 * 그 산출물과 겹치는 것이 당연하다 — 같은 날짜를 다시 만든 것이기 때문이다. 그 날짜는 뺀다.
 */
function publishedUrls(exceptDate) {
  const set = new Set();
  for (const b of loadBriefs()) {
    if (exceptDate && b.date === exceptDate) continue;
    for (const a of b.articles ?? []) {
      const u = canonicalUrl(a.url);
      if (u) set.add(u);
      for (const c of a.crossRefs ?? []) {
        const cu = canonicalUrl(c.url);
        if (cu) set.add(cu);
      }
    }
  }
  return set;
}

/** 가장 최근 실제 수집 결과. 없으면 null. */
function latestRun() {
  const dir = join(ROOT, 'runs');
  if (!existsSync(dir)) return null;
  const dates = readdirSync(dir)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && existsSync(join(dir, d, 'candidates.json')))
    .sort();
  if (!dates.length) return null;
  const date = dates[dates.length - 1];
  return { date, data: JSON.parse(readFileSync(join(dir, date, 'candidates.json'), 'utf8')) };
}

function checkRun(run, t, tag, seen) {
  const C = run.candidates;
  const p = (s) => tag + ' ' + s;

  /* 6.2 — 데이터 페이지가 점수를 재현할 수 있어야 한다 (P2) */
  const mismatch = C.filter((c) => scoreFrom(c.scoreParts) !== c.score);
  t(p('scoreParts 에서 재계산한 점수가 저장값과 일치'), mismatch.length === 0,
    mismatch.length ? mismatch.map((m) => m.url).join(', ') : C.length + '건 전부');

  const badCross = C.filter(
    (c) => Math.abs(c.scoreParts.cross - Math.min(c.crossRefs.length, SPEC_CROSS_CAP) / SPEC_CROSS_CAP) > 1e-9
  );
  t(p('교차보도 점수 = min(독립매체수, 4) / 4'), badCross.length === 0);

  /* P4 — 한 출처가 지면을 독점하지 않는다 */
  const bySource = {};
  for (const c of C) bySource[c.source] = (bySource[c.source] ?? 0) + 1;
  t(p(`한 출처 최대 ${SPEC_PER_SOURCE_MAX}건`),
    Object.values(bySource).every((n) => n <= SPEC_PER_SOURCE_MAX),
    Object.entries(bySource).map(([s, n]) => s + ' ' + n).join(' · ') || '후보 없음');

  const primaries = C.filter((c) => c.sourceType === 'primary').length;
  const avail = run.primaryGuarantee?.availableInPool ?? 0;
  t(p(`공식 ${SPEC_PRIMARY_MIN}자리 보장 (풀에 있을 때만 가능)`),
    primaries >= SPEC_PRIMARY_MIN || avail < SPEC_PRIMARY_MIN,
    `확정 ${primaries}건 / 풀에 ${avail}건` + (avail < SPEC_PRIMARY_MIN ? ' → 풀에 없어 보장 불가, 사실대로 기록됨' : ''));

  /* P5 — 같은 링크를 두 번 싣지 않는다 */
  const repeat = C.filter((c) => seen.has(c.url));
  t(p('지난 브리핑 URL 과 겹치지 않음'), repeat.length === 0, `기존 ${seen.size}개와 대조`);

  /* P2 — 공개하는 퍼널 숫자가 앞뒤 맞아야 한다 */
  const f = run.funnel;
  t(p('퍼널: 수집 >= 시간창'), f.collected >= f.window24h, `${f.collected} >= ${f.window24h}`);
  t(p('퍼널: 시간창 − 제외 >= 묶음'), f.window24h - f.excluded >= f.deduped,
    `${f.window24h} − ${f.excluded} = ${f.window24h - f.excluded} >= ${f.deduped}`);
  t(p('퍼널: 묶음 >= 점수산정'), f.deduped >= f.scored, `${f.deduped} >= ${f.scored}`);
  t(p('퍼널: 점수산정 >= 발행'), f.scored >= f.published, `${f.scored} >= ${f.published}`);
  t(p(`퍼널: 발행 <= ${SPEC_TARGET}`), f.published <= SPEC_TARGET, String(f.published));

  /* 정렬과 형식 */
  t(p('점수 내림차순 정렬'), C.every((c, i) => i === 0 || C[i - 1].score >= c.score));
  t(p('rank 가 1..n 연속'), C.every((c, i) => c.rank === i + 1));

  /* P3 — 원문을 못 읽은 기사는 싣지 않는다 */
  t(p(`모든 후보에 본문 ${SPEC_MIN_CHARS}자 이상`),
    C.every((c) => c.text && c.text.length >= SPEC_MIN_CHARS),
    C.length ? `최소 ${Math.min(...C.map((c) => c.text.length))}자` : '후보 없음');

  t(p('모든 후보에 원문 링크'), C.every((c) => /^https:\/\//.test(c.url)));
}

export function run(t) {
  const fixture = JSON.parse(
    readFileSync(join(HERE, 'fixtures', 'candidates.sample.json'), 'utf8')
  );
  checkRun(fixture, t, '[픽스처]', publishedUrls(fixture.date));

  const real = latestRun();
  if (real) checkRun(real.data, t, `[실제 ${real.date}]`, publishedUrls(real.date));
  else t('[실제] runs/ 에 산출물 없음 — 픽스처만 검사', true, 'npm run collect 로 만들 수 있다');
}
