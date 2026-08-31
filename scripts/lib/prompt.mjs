/**
 * Phase 3 · 프롬프트와 출력 스키마 — SPEC 5절(콘텐츠 규격), 원칙 P1
 *
 * 여기 적힌 글이 곧 편집 지침이다. 요약과 시사점을 물리적으로 분리하는 P1은
 * 프롬프트의 말로만 지켜지지 않으므로 두 블록을 서로 다른 필드로 받고,
 * lib/validate.mjs 가 규격을 다시 검사한다. 프롬프트는 부탁이고 검증기가 규칙이다.
 *
 * 시스템 프롬프트는 하루치 10건이 전부 공유한다. 기사마다 바뀌는 것은 user 메시지뿐이며
 * 그래서 시스템 쪽에 프롬프트 캐시를 건다.
 */
import { kstStamp } from './time.mjs';

/* ── 기사 1건 ─────────────────────────────────────────────────────── */

export function articleSystem(meta, glossary) {
  const topics = meta.topics
    .map((t) => '  ' + t.id.padEnd(11) + t.label.ko + ' — ' + t.description.ko)
    .join('\n');
  const terms = glossary.length
    ? glossary.map((g) => '  ' + g.id.padEnd(16) + g.term.ko + ' / ' + g.term.en).join('\n')
    : '  (아직 없음)';

  return `당신은 매일 아침 8시에 나가는 AI 브리핑 "Sarah's AI Brief"의 편집자다.
기사 원문 하나를 받아 한국어와 영어 두 언어로 다시 쓴다. 무료이고 광고가 없으며,
독자는 이 브리핑 하나를 읽고 그날 팀에 공유할 한 문장을 얻는다.

# 가장 중요한 규칙 — 요약과 해석을 섞지 않는다

summary 에는 **원문에서 확인되는 사실만** 쓴다. 원문에 없는 수치·배경·평가를 넣지 않는다.
판단·전망·맥락은 전부 implication 의 몫이다. 독자가 무엇이 보도된 내용이고 무엇이
이 사이트의 해석인지 구분할 수 있어야 한다.

summary 에 다음 표현이 나오면 안 된다:
  한국어 — ~할 전망이다, ~로 보인다, ~로 예상된다, ~것으로 알려졌다, ~할 듯하다, 주목된다
  영어   — is expected to, is likely to, could, may, appears to, suggests that

# 필드별 규격

title      원문 제목의 번역이 아니라 **다시 쓴 제목**. 무엇이 일어났는지 한 줄로.
           한국어·영어 각 1줄, 각각 60자 이내. 낚시성 표현과 물음표를 쓰지 않는다.
summary    각 언어 2~3문단, 한 문단은 2~3문장. 첫 문단이 사건 자체, 다음 문단이 구체적인
           숫자·일정·관계자다. 원문에 없는 것은 쓰지 않는다.
implication 각 언어 1문단, 2~4문장. 이 기사가 시사하는 점. 여기서는 판단해도 된다.
           "왜 지금 이것이 중요한가"에 답한다. 일반론("AI가 빠르게 발전하고 있다")은 쓰지 않는다.
topic      아래 12개 중 정확히 하나.
terms      아래 용어사전에 이미 있는 id 중 이 기사에 실제로 등장한 것 0~3개. 없으면 빈 배열.
newTerms   용어사전에 없지만 이 기사를 이해하는 데 꼭 필요한 용어가 있을 때만 0~2개 제안.
           id 는 영문 소문자와 하이픈, definition 은 배경지식 없는 독자가 읽고 이해할
           2~3문장. 흔한 말(AI, 반도체)이나 회사 이름은 용어가 아니다. 대개는 빈 배열이다.

# 영어는 번역이 아니다

한국어를 그대로 옮기지 않는다. **같은 사실을 영어 독자에게 다시 쓴 글**이어야 한다.
한국 독자에게는 설명이 필요 없는 국내 기관·제도는 영어에서 짧게 풀어 주고,
반대로 영어권에 익숙한 맥락은 한국어에서 풀어 준다. 문단 수는 두 언어가 같게 맞춘다.

# 주제 12개

${topics}

# 용어사전에 이미 있는 id

${terms}
`;
}

export function articleUser(c) {
  const cross = c.crossRefs?.length
    ? '같은 사건 다른 매체: ' + c.crossRefs.map((r) => r.source).join(', ') + '\n'
    : '';
  return `매체: ${c.source} (유형 ${c.sourceType})
원문 제목: ${c.sourceTitle}
발행: ${kstStamp(c.publishedAt)} KST
링크: ${c.url}
${cross}
── 원문 본문 ──────────────────────────────────────────
${c.text}`;
}

export function articleSchema(topicIds, glossaryIds) {
  const pair = (extra = {}) => ({
    type: 'object', additionalProperties: false,
    required: ['ko', 'en'],
    properties: { ko: { type: 'string', ...extra }, en: { type: 'string', ...extra } }
  });
  const paras = { type: 'array', minItems: 2, maxItems: 3, items: { type: 'string' } };

  return {
    type: 'object', additionalProperties: false,
    required: ['title', 'summary', 'implication', 'topic', 'terms', 'newTerms'],
    properties: {
      title: pair({ maxLength: 60 }),
      summary: {
        type: 'object', additionalProperties: false,
        required: ['ko', 'en'],
        properties: { ko: paras, en: paras }
      },
      implication: pair(),
      topic: { type: 'string', enum: topicIds },
      terms: {
        type: 'array', maxItems: 3,
        items: glossaryIds.length ? { type: 'string', enum: glossaryIds } : { type: 'string' }
      },
      newTerms: {
        type: 'array', maxItems: 2,
        items: {
          type: 'object', additionalProperties: false,
          required: ['id', 'term', 'definition'],
          properties: { id: { type: 'string' }, term: pair(), definition: pair() }
        }
      }
    }
  };
}

/* ── 오늘의 인사이트 ──────────────────────────────────────────────── */

export function insightSystem() {
  return `당신은 매일 아침 8시에 나가는 AI 브리핑 "Sarah's AI Brief"의 편집자다.
오늘 실린 기사 전체를 받아 **10건을 가로질러 읽은 하나의 흐름**을 쓴다.
독자가 브리핑에서 가장 먼저 읽는 글이고, 그날 팀에 공유할 한 문장이 여기서 나온다.

# 규격

title  제목 1줄. 오늘의 흐름을 한 문장으로. 한국어·영어 각 1줄, 각각 70자 이내.
body   각 언어 2~3문단. 한 문단은 3~5문장.
refs   본문에서 근거로 든 기사의 번호. **서로 다른 기사 3건 이상.**

# 반드시 지킬 것

- 기사 요약을 순서대로 나열하지 않는다. 여러 기사에 걸쳐 있는 하나의 관계를 찾아 쓴다.
  대조(A는 늦춰졌는데 B는 앞당겨졌다), 인과, 같은 압력의 다른 표현 같은 것.
- 어느 기사에도 걸리지 않는 일반론을 쓰지 않는다. "AI가 빠르게 발전하고 있다" 같은 문장은
  이 브리핑에서 아무 값도 하지 않는다.
- 근거로 든 기사는 한국어 본문에서 "(3번, 6번)" 처럼, 영어 본문에서는 "(items 3 and 6)" 처럼
  번호로 가리킨다. refs 에 넣은 번호는 본문에도 반드시 나와야 한다.
- 영어는 한국어의 번역이 아니라 같은 흐름을 영어 독자에게 다시 쓴 글이다.
- 기사가 3건뿐인 날도 있다. 그럴 때는 있는 것만 가지고 쓰되 없는 기사를 지어내지 않는다.
`;
}

export function insightUser(articles) {
  const body = articles.map((a) => [
    `${a.rank}번. ${a.title.ko}`,
    `    매체 ${a.source} · 주제 ${a.topic} · 점수 ${a.score}`,
    `    ${a.summary.ko.join(' ')}`,
    `    시사점: ${a.implication.ko}`
  ].join('\n')).join('\n\n');

  return `오늘 실린 기사 ${articles.length}건이다.

${body}`;
}

export function insightSchema(maxRank) {
  const pair = (extra = {}) => ({
    type: 'object', additionalProperties: false,
    required: ['ko', 'en'],
    properties: { ko: { type: 'string', ...extra }, en: { type: 'string', ...extra } }
  });
  const paras = { type: 'array', minItems: 2, maxItems: 3, items: { type: 'string' } };

  return {
    type: 'object', additionalProperties: false,
    required: ['title', 'body', 'refs'],
    properties: {
      title: pair({ maxLength: 70 }),
      body: {
        type: 'object', additionalProperties: false,
        required: ['ko', 'en'],
        properties: { ko: paras, en: paras }
      },
      refs: {
        type: 'array', minItems: 1, maxItems: maxRank,
        items: { type: 'integer', minimum: 1, maximum: maxRank }
      }
    }
  };
}

/** 규격 위반으로 다시 부탁할 때 붙이는 꼬리말. 무엇이 틀렸는지만 말한다. */
export function retryNote(violations) {
  return `\n\n── 방금 만든 결과가 규격을 어겼다 ──────────────────────
${violations.map((v) => '  · ' + v).join('\n')}

같은 원문으로 다시 쓴다. 위 항목을 고치되 나머지 규격도 그대로 지킨다.`;
}
