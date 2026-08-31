/**
 * Phase 3 · data/*.js 쓰기 — SPEC 7절 데이터 계약
 *
 * 사이트는 이 형식만 알면 되고 파이프라인은 이 형식만 지키면 된다. 그 경계가 여기다.
 * JSON 이 아니라 전역 객체에 대입하는 .js 인 이유는 file:// 에서도 열려야 하기 때문이다.
 *
 * 발행된 브리핑은 삭제하지 않는다. 같은 날짜를 다시 만들면 그 자리만 갈아 끼운다.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './meta.mjs';

/* 저장소에 처음부터 들어 있던 구조 확인용 샘플. --drop-samples 가 지우는 대상이다. */
export const SAMPLE_DATES = ['2026-08-31', '2026-08-30', '2026-08-29', '2026-08-28'];

const BRIEFS_HEAD = (hasSamples) => `/**
 * Sarah's AI Brief — 브리핑 데이터 (최신순)
 * SPEC.md 7절 데이터 계약 참조.
 *
 * 이 파일은 scripts/summarize.mjs 가 생성한다. 손으로 고치지 않는다.
${hasSamples ? ` *
 * ⚠ ${SAMPLE_DATES.join(' · ')} 는 구조 확인용 샘플이다. 실제 보도된 기사가 아니며
 *   출처 링크는 각 매체 홈으로 연결한다. \`--drop-samples\` 로 제거할 수 있다.
` : ''} *
 * 점수 규칙 (SPEC 6.2)
 *   weight = 출처 유형 가중치, cross = min(교차보도 매체 수, 4) / 4,
 *   fresh  = 24시간 창 안에서의 선형 감쇠 (창 끝 = 발행 전날 23:00Z)
 *   score  = round((0.40×weight + 0.35×cross + 0.25×fresh) × 100)
 *   기사는 score 내림차순으로 정렬되며 rank 와 id 는 발행 후 바뀌지 않는다.
 */
window.SAB = window.SAB || {};

SAB.briefs = `;

const GLOSSARY_HEAD = `/**
 * Sarah's AI Brief — 용어사전
 * 브리핑에 등장한 용어가 여기에 쌓인다. SPEC.md 7절 참조.
 *
 * 이 파일은 scripts/summarize.mjs 가 생성한다. 손으로 고치지 않는다.
 * count 와 firstSeen 은 저장값을 믿지 않고 briefs.js 전체에서 매번 다시 센다.
 */
window.SAB = window.SAB || {};

SAB.glossary = `;

export function writeBriefs(briefs) {
  const hasSamples = briefs.some((b) => SAMPLE_DATES.includes(b.date));
  const body = BRIEFS_HEAD(hasSamples) + JSON.stringify(briefs, null, 2) + ';\n';
  writeFileSync(join(ROOT, 'data', 'briefs.js'), body, 'utf8');
  return join('data', 'briefs.js');
}

export function writeGlossary(glossary) {
  const body = GLOSSARY_HEAD + JSON.stringify(glossary, null, 2) + ';\n';
  writeFileSync(join(ROOT, 'data', 'glossary.js'), body, 'utf8');
  return join('data', 'glossary.js');
}

/** 같은 날짜는 갈아 끼우고, 나머지는 최신순을 유지한다. date 가 고유 키다. */
export function mergeBrief(briefs, brief) {
  const rest = briefs.filter((b) => b.date !== brief.date);
  return [...rest, brief].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function dropSamples(briefs) {
  return briefs.filter((b) => !SAMPLE_DATES.includes(b.date));
}

/**
 * count·firstSeen 재계산.
 * 사이트의 glossary.html 과 data.html 이 이 두 값을 그대로 읽으므로
 * 브리핑이 늘어날 때마다 다시 세지 않으면 화면이 조용히 틀린 수를 보여 준다.
 */
export function recountGlossary(glossary, briefs) {
  const count = new Map();
  const first = new Map();

  for (const b of [...briefs].sort((x, y) => (x.date < y.date ? -1 : 1))) {
    for (const a of b.articles ?? []) {
      for (const id of a.terms ?? []) {
        count.set(id, (count.get(id) ?? 0) + 1);
        if (!first.has(id)) first.set(id, b.date);
      }
    }
  }

  return glossary.map((g) => ({
    ...g,
    firstSeen: first.get(g.id) ?? g.firstSeen,
    count: count.get(g.id) ?? 0
  }));
}

/** 모델이 제안한 신규 용어를 하루 최대 max 개까지 받는다. 이미 있는 id 는 무시한다. */
export function addNewTerms(glossary, proposals, date, max = 2) {
  const have = new Set(glossary.map((g) => g.id));
  const added = [];
  for (const p of proposals) {
    if (added.length >= max) break;
    const id = String(p.id ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    if (!id || have.has(id)) continue;
    have.add(id);
    added.push({ id, term: p.term, definition: p.definition, firstSeen: date, count: 0 });
  }
  return { glossary: [...glossary, ...added], added };
}
