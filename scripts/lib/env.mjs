/**
 * .env 읽기 — 환경변수가 없을 때의 대체재
 *
 * dotenv 를 쓰지 않는 이유는 의존성이 아니라 범위다. 이 파일은 process.env 에
 * 아무것도 주입하지 않는다. 물어본 쪽에만 값을 돌려준다.
 *
 * Phase 3(ANTHROPIC_API_KEY)과 Phase 5a(MAIL_*)가 같은 파일을 읽는다. 해석 규칙이
 * 두 곳에 생기면 "API 키는 읽히는데 메일 설정은 안 읽힌다" 같은, 원인을 짚기
 * 어려운 차이가 난다. 그래서 규칙은 여기 하나만 둔다.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './meta.mjs';

/**
 * KEY=VALUE 를 한 줄씩. `export ` 접두사와 `#` 주석 줄을 허용한다.
 *
 * Windows 에서 실제로 물리는 두 가지를 먼저 걷어낸다.
 *   BOM  — 메모장이 UTF-8 BOM 으로 저장하면 첫 줄 키 앞에 \uFEFF 가 붙어
 *          첫 번째 키만 조용히 사라진다. daily.ps1 로 이미 한 번 데인 함정이다.
 *   CRLF — split('\n') 뒤 값 끝에 \r 가 남는다. 앱 비밀번호 끝에 붙으면 인증이 실패하는데
 *          화면에는 아무 차이도 보이지 않는다.
 *
 * 값은 첫 '=' 에서만 자른다. 값 안에 '=' 가 들어갈 수 있다(base64 패딩 등).
 * 따옴표는 양쪽이 짝을 이룰 때만 벗긴다.
 */
export function parseEnvFile(text) {
  const out = new Map();
  for (const raw of text.replace(/^\uFEFF/, '').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).replace(/^export\s+/, '').trim();
    if (!key) continue;
    out.set(key, line.slice(eq + 1).trim().replace(/^(["'])([\s\S]*)\1$/, '$2'));
  }
  return out;
}

/* 파일은 프로세스당 한 번만 읽는다. 한 실행 중에 .env 가 바뀔 일이 없다. */
let cached = null;
function envFile() {
  if (cached) return cached;
  const p = join(ROOT, '.env');
  cached = existsSync(p) ? parseEnvFile(readFileSync(p, 'utf8')) : new Map();
  return cached;
}

/** 환경변수가 이긴다. .env 는 대체재다. 빈 값은 없는 것으로 본다(SITE_URL= 처럼). */
export function envValue(name, fallback = null) {
  if (process.env[name]) return process.env[name];
  const v = envFile().get(name);
  return v === undefined || v === '' ? fallback : v;
}
