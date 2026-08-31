#!/usr/bin/env node
/**
 * 검증 스위트 — npm test
 *
 * 여기서 검사하는 것은 구현 세부가 아니라 SPEC 이 약속한 규칙이다.
 *   P3  원문을 못 읽은 기사는 싣지 않는다
 *   P4  한 출처 최대 3건, 공식 발표 최소 2자리
 *   P5  같은 링크를 두 번 싣지 않는다
 *   6.2 점수는 scoreParts 에서 재현된다
 *   8절 robots.txt 를 지킨다
 *
 * 전부 오프라인이다. 네트워크를 쓰는 검사는 여기 두지 않는다 —
 * 상대 서버 사정으로 실패하는 테스트는 아무도 믿지 않게 된다.
 *
 * 의존성 0개. 종료 코드는 실패가 있을 때만 1이다.
 */
import * as robots from './robots.test.mjs';
import * as score from './score.test.mjs';
import * as cluster from './cluster.test.mjs';
import * as select from './select.test.mjs';
import * as candidates from './candidates.test.mjs';
import * as summarize from './summarize.test.mjs';

const suites = [score, robots, cluster, select, candidates, summarize];
let pass = 0;
let fail = 0;
const failures = [];

for (const suite of suites) {
  console.log('');
  console.log('── ' + suite.name + ' ' + '─'.repeat(Math.max(0, 60 - suite.name.length)));
  const t = (label, cond, detail = '') => {
    if (cond) {
      pass++;
      console.log('  o ' + label + (detail ? '  — ' + detail : ''));
    } else {
      fail++;
      failures.push(suite.name + ' › ' + label + (detail ? '  — ' + detail : ''));
      console.log('  X ' + label + (detail ? '  — ' + detail : ''));
    }
  };
  try {
    suite.run(t);
  } catch (err) {
    fail++;
    failures.push(suite.name + ' › 실행 중 예외 — ' + err.message);
    console.log('  X 실행 중 예외 — ' + err.message);
  }
}

console.log('');
console.log('─'.repeat(64));
console.log(pass + '개 통과 · ' + fail + '개 실패');

if (fail) {
  console.log('');
  console.log('실패 목록:');
  for (const f of failures) console.log('  ' + f);
}

process.exit(fail ? 1 : 0);
