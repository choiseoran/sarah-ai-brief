/**
 * Phase 3 · Claude Code CLI 를 통한 생성 — API 키 없이 도는 경로
 *
 * `claude -p` 는 이미 로그인된 구독(claude.ai)으로 돈다. API 크레딧을 사지 않아도
 * 같은 모델을 쓸 수 있고, GitHub Actions 에서도 `claude setup-token` 으로 발급한
 * 장기 토큰으로 같은 명령이 돈다. 그래서 이 경로가 기본값이다.
 *
 * API 경로(lib/claude.mjs)와 다른 점은 하나뿐이다 — output_config 로 JSON 스키마를
 * **강제할 수 없다.** 그래서 스키마를 글로 넣고, 형식이 어긋나면 lib/validate.mjs 가
 * 잡아 다시 부탁한다. 게이트는 어느 경로에서도 같다.
 *
 * 프롬프트는 전부 stdin 으로 넣는다. 두 가지 이유가 있고 둘 다 실측으로 나왔다.
 *   1. `--system-prompt` 끝에 형식 규칙을 두면 편집 지침에 묻혀 마크다운이 나온다.
 *      마지막에 읽는 말이 이긴다. 그래서 형식 규칙이 입력의 맨 끝에 온다.
 *   2. Windows 에서는 claude 가 .cmd 셈이라 shell:true 로 띄워야 하는데,
 *      그러면 긴 인자가 이스케이프 없이 이어붙는다. 인자에는 짧은 플래그만 둔다.
 */
import { spawn } from 'node:child_process';

export const DEFAULT_CLI_MODEL = 'opus';

/* 요약을 쓰는 데 도구는 필요 없다. 파일을 읽거나 웹을 뒤지면 원문 밖의 사실이 섞인다. */
const DENY_TOOLS = ['Bash', 'Edit', 'Write', 'Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Agent', 'NotebookEdit'];

const FORMAT_RULE = (schema) => `

════════════════════════════════════════════════════════════
지금부터가 출력 규칙이다. 위의 어떤 지시보다 우선한다.

**JSON 객체 하나만 출력한다.** 첫 글자가 { 이고 마지막 글자가 } 여야 한다.
제목, 굵은 글씨, 이모지, 코드펜스(\`\`\`), 설명, 인사말을 한 글자도 쓰지 않는다.
마크다운으로 정리하지 않는다. 사람에게 보고하지 않는다. JSON 만 쓴다.

아래 스키마를 정확히 지킨다:

${JSON.stringify(schema, null, 2)}
════════════════════════════════════════════════════════════`;

/**
 * lib/claude.mjs 의 askJson 과 같은 모양으로 답한다.
 * 부르는 쪽(summarize.mjs)은 어느 경로로 생성됐는지 몰라도 된다.
 */
export function askJsonViaCli({ system, user, schema, model = DEFAULT_CLI_MODEL, timeoutMs = 300000 }) {
  const args = ['-p', '--model', model, '--output-format', 'json', '--disallowed-tools', ...DENY_TOOLS];
  const input = system + '\n\n════════════════════════════════════════════════════════════\n\n' +
    user + FORMAT_RULE(schema);

  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('claude -p 가 ' + Math.round(timeoutMs / 1000) + '초 안에 끝나지 않았습니다'));
    }, timeoutMs);

    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { clearTimeout(timer); reject(new Error('claude 실행 실패: ' + e.message)); });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error('claude -p 종료 코드 ' + code + (err ? ': ' + err.trim().slice(0, 300) : '')));

      let envelope;
      try {
        envelope = JSON.parse(out);
      } catch {
        return reject(new Error('claude -p 출력이 JSON 이 아닙니다: ' + out.slice(0, 200)));
      }
      if (envelope.is_error || envelope.subtype !== 'success') {
        return reject(new Error('claude -p 실패 (' + envelope.subtype + '): ' + String(envelope.result).slice(0, 300)));
      }

      try {
        resolve({ data: parseResult(envelope.result), usage: envelope.usage, model: envelope.modelUsage });
      } catch (e) {
        reject(e);
      }
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}

/**
 * 코드펜스나 뒤따라 붙은 설명이 있어도 JSON 객체 하나를 꺼낸다.
 *
 * "마지막 } 까지"로 자르면 뒤에 붙은 설명 안의 중괄호까지 삼켜서 실패한다.
 * 실측에서 정상 JSON 뒤에 마크다운 요약이 붙어 온 답 두 건이 이 방식으로 죽었다.
 * 그래서 문자열과 이스케이프를 존중하며 중괄호 짝을 세어 첫 객체에서 끊는다.
 */
function parseResult(text) {
  const s = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(s);
  } catch { /* 아래에서 꺼내 본다 */ }

  const start = s.indexOf('{');
  if (start >= 0) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) {
        try { return JSON.parse(s.slice(start, i + 1)); } catch { break; }
      }
    }
  }
  throw new Error('JSON 이 아닌 답이 왔습니다: ' + s.slice(0, 160).replace(/\s+/g, ' '));
}

/** `claude auth status` 가 구독으로 로그인돼 있는지 본다. 아니면 무엇을 하라고 알려 준다. */
export function cliAvailable() {
  return new Promise((resolve) => {
    const child = spawn('claude', ['auth', 'status'], { stdio: ['ignore', 'pipe', 'ignore'], shell: process.platform === 'win32' });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.on('error', () => resolve({ ok: false, why: 'claude 명령을 찾을 수 없습니다' }));
    child.on('close', () => {
      try {
        const s = JSON.parse(out);
        if (!s.loggedIn) return resolve({ ok: false, why: 'Claude Code 에 로그인돼 있지 않습니다 — claude auth login' });
        resolve({ ok: true, how: s.authMethod + (s.subscriptionType ? ' · ' + s.subscriptionType : '') });
      } catch {
        resolve({ ok: false, why: 'claude auth status 를 읽지 못했습니다' });
      }
    });
  });
}
