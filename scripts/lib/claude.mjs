/**
 * Phase 3 · Claude API 호출 — SPEC 8절 '서버가 하는 일'
 *
 * 사이트 코드에는 라이브러리가 0개지만 이 제약은 서버 코드에 적용되지 않는다(SPEC 8절).
 * 공식 SDK 하나만 쓴다. 재시도·타임아웃·에러 타입을 직접 만들 이유가 없다.
 *
 * 호출은 기사 1건당 1회다. 하루 10건이면 11회(+인사이트 1회)이고,
 * 시스템 프롬프트는 그 전부가 공유하므로 캐시를 건다.
 */
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './meta.mjs';

export const DEFAULT_MODEL = 'claude-opus-5';

/* $/1M 토큰. 비용을 화면에 보여 주기 위한 것이고 청구서가 아니다. */
const PRICE = { input: 5, cacheWrite: 6.25, cacheRead: 0.5, output: 25 };

/** 환경변수가 없으면 저장소 루트의 .env 를 본다. .env 는 .gitignore 에 있다. */
function keyFromEnvOrFile() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return null;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

export function createClient() {
  const apiKey = keyFromEnvOrFile();
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY 가 없습니다.\n' +
      '  환경변수로 두거나, 저장소 루트에 .env 파일을 만들고 다음 한 줄을 넣으세요:\n' +
      '    ANTHROPIC_API_KEY=sk-ant-...\n' +
      '  .env 는 .gitignore 에 있습니다.'
    );
  }
  return new Anthropic({ apiKey });
}

/**
 * JSON 스키마로 답을 받는다. 스키마가 형식을 강제하고, 내용 규격은 validate.mjs 가 본다.
 * 시스템 프롬프트에 캐시를 걸므로 같은 프롬프트를 쓰는 두 번째 호출부터 입력값이 싸진다.
 */
export async function askJson(client, { system, user, schema, maxTokens = 8000, model = DEFAULT_MODEL }) {
  const res = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: user }],
    output_config: { format: { type: 'json_schema', schema } }
  });

  if (res.stop_reason === 'refusal') {
    throw new Error('모델이 응답을 거부했습니다 (' + (res.stop_details?.category ?? '사유 없음') + ')');
  }
  if (res.stop_reason === 'max_tokens') {
    throw new Error('max_tokens(' + maxTokens + ')에서 잘렸습니다. 본문이 너무 길거나 한도가 낮습니다.');
  }

  const data = res.parsed_output ?? parseText(res);
  return { data, usage: res.usage, model: res.model };
}

function parseText(res) {
  const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('JSON 파싱 실패: ' + text.slice(0, 200));
  }
}

/** 호출마다의 usage 를 하나로 모은다. */
export function tally() {
  const total = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, calls: 0 };
  return {
    add(usage) {
      if (!usage) return;
      total.calls++;
      total.input += usage.input_tokens ?? 0;
      total.cacheWrite += usage.cache_creation_input_tokens ?? 0;
      total.cacheRead += usage.cache_read_input_tokens ?? 0;
      total.output += usage.output_tokens ?? 0;
    },
    get total() { return total; },
    get cost() {
      return (total.input * PRICE.input + total.cacheWrite * PRICE.cacheWrite +
        total.cacheRead * PRICE.cacheRead + total.output * PRICE.output) / 1e6;
    }
  };
}

/** 사람이 읽을 한 줄로. */
export function describeError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'API 키가 거부됐습니다 (401)';
  if (err instanceof Anthropic.RateLimitError) return '요청 한도에 걸렸습니다 (429) — SDK가 재시도한 뒤에도 실패';
  if (err instanceof Anthropic.BadRequestError) return '요청이 잘못됐습니다 (400): ' + err.message;
  if (err instanceof Anthropic.APIConnectionError) return '연결 실패: ' + err.message;
  if (err instanceof Anthropic.APIError) return 'API 오류 ' + err.status + ': ' + err.message;
  return err.message;
}
