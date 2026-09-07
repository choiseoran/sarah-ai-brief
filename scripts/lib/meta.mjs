/**
 * data/*.js 읽기.
 *
 * 사이트 데이터는 브라우저용 전역 대입 파일이다(SPEC 7절: file:// 에서 열려야
 * 하므로 JSON이 아니다). window가 곧 전역 객체인 컨텍스트를 만들어 그대로 실행한다.
 * 사이트와 파이프라인이 같은 파일을 읽으므로 형식이 어긋날 수 없다.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function loadGlobals(...files) {
  const sandbox = {};
  sandbox.window = sandbox;
  createContext(sandbox);
  for (const f of files) {
    const p = join(ROOT, 'data', f);
    if (existsSync(p)) runInContext(readFileSync(p, 'utf8'), sandbox);
  }
  return sandbox.SAB ?? {};
}

export function loadMeta() {
  return loadGlobals('meta.js').meta;
}

export function loadBriefs() {
  return loadGlobals('meta.js', 'briefs.js').briefs ?? [];
}

export function loadGlossary() {
  return loadGlobals('meta.js', 'glossary.js').glossary ?? [];
}

/**
 * 발행 언어 — data/meta.js 의 site.languages. 사이트도 같은 값을 읽는다(SPEC 5·7절).
 * 값이 없는 옛 meta.js 로도 돌아야 하므로 없으면 한/영 둘 다로 본다.
 */
export function enabledLangs(meta) {
  const list = (meta?.site?.languages ?? []).filter((l) => l === 'ko' || l === 'en');
  return list.length ? list : ['ko', 'en'];
}

/** 피드 id → 출처 유형 가중치. SPEC 6.1 */
export function weightIndex(meta) {
  const byType = new Map(meta.sourceTypes.map((t) => [t.id, t.weight]));
  return (type) => byType.get(type) ?? 0;
}

export function readJson(...parts) {
  return JSON.parse(readFileSync(join(ROOT, ...parts), 'utf8'));
}
