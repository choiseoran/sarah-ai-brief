/**
 * Sarah's AI Brief — 용어사전
 * 브리핑에 등장한 용어가 여기에 쌓인다. SPEC.md 7절 참조.
 *
 * 이 파일은 scripts/summarize.mjs 가 생성한다. 손으로 고치지 않는다.
 * count 와 firstSeen 은 저장값을 믿지 않고 briefs.js 전체에서 매번 다시 센다.
 */
window.SAB = window.SAB || {};

SAB.glossary = [
  {
    "id": "agent",
    "term": {
      "ko": "에이전트",
      "en": "AI agent"
    },
    "definition": {
      "ko": "사람이 매 단계를 지시하지 않아도 도구를 호출하고 결과를 보며 다음 행동을 스스로 정하는 프로그램. 한 번의 질문에 한 번 답하는 챗봇과 달리 여러 단계를 이어서 수행한다.",
      "en": "A program that calls tools, reads the results, and decides its next step without a human directing each move — unlike a chatbot, which answers once per question."
    },
    "firstSeen": "2026-09-01",
    "count": 7
  },
  {
    "id": "tokens",
    "term": {
      "ko": "토큰",
      "en": "Token"
    },
    "definition": {
      "ko": "모델이 글을 쪼개어 다루는 최소 단위. 영어는 대략 단어의 4분의 3, 한국어는 글자 한두 개가 한 토큰에 해당한다. API 요금과 길이 제한이 모두 토큰 수로 계산된다.",
      "en": "The unit a model chops text into — roughly three-quarters of an English word. API pricing and length limits are both counted in tokens."
    },
    "firstSeen": "2026-09-01",
    "count": 6
  },
  {
    "id": "open-weights",
    "term": {
      "ko": "공개 가중치",
      "en": "Open weights"
    },
    "definition": {
      "ko": "학습이 끝난 모델의 파라미터 파일을 내려받아 각자의 서버에서 돌릴 수 있게 공개한 것. 학습 데이터와 코드까지 공개하는 완전한 오픈소스와는 구분된다.",
      "en": "Publishing a trained model’s parameter files so anyone can download and run it on their own hardware — distinct from full open source, which also releases the data and training code."
    },
    "firstSeen": "2026-09-01",
    "count": 2
  },
  {
    "id": "eval",
    "term": {
      "ko": "평가 벤치마크",
      "en": "Evaluation benchmark"
    },
    "definition": {
      "ko": "모델의 능력을 정해진 문제 묶음으로 측정하는 시험. 문제가 학습 데이터에 섞여 들어가면 점수가 부풀려지기 때문에, 최근에는 비공개 문제를 쓰는 쪽으로 옮겨가고 있다.",
      "en": "A fixed problem set used to measure model capability. Scores inflate once the questions leak into training data, which is pushing the field toward held-out, private sets."
    },
    "firstSeen": "2026-09-01",
    "count": 4
  },
  {
    "id": "alignment",
    "term": {
      "ko": "정렬",
      "en": "Alignment"
    },
    "definition": {
      "ko": "모델이 사람의 의도와 가치에 맞게 행동하도록 만드는 연구 분야이자 그 상태. 능력을 키우는 것과는 별개의 문제로 다룬다.",
      "en": "The field — and the property — of getting a model to act in line with human intent and values. Treated as a separate problem from raw capability."
    },
    "firstSeen": "2026-09-01",
    "count": 3
  },
  {
    "id": "red-teaming",
    "term": {
      "ko": "레드팀",
      "en": "Red teaming"
    },
    "definition": {
      "ko": "모델을 일부러 공격해 위험한 출력이나 우회 경로를 찾아내는 사전 점검. 출시 전에 내부 팀이나 외부 전문가가 수행한다.",
      "en": "Deliberately attacking a model before release to surface harmful outputs and bypasses, run by internal teams or outside experts."
    },
    "firstSeen": "2026-09-01",
    "count": 2
  },
  {
    "id": "guardrails",
    "term": {
      "ko": "가드레일",
      "en": "Guardrails"
    },
    "definition": {
      "ko": "모델의 입력과 출력을 검사해 허용 범위를 벗어나는 요청이나 답변을 막는 별도의 장치. 모델 자체의 학습과 분리해 운영하는 것이 일반적이다.",
      "en": "A separate layer that inspects inputs and outputs and blocks what falls outside policy — usually operated independently of the model’s own training."
    },
    "firstSeen": "2026-09-01",
    "count": 3
  },
  {
    "id": "expedited-discovery",
    "term": {
      "ko": "신속 증거개시",
      "en": "Expedited discovery"
    },
    "definition": {
      "ko": "미국 민사소송에서 정해진 일정보다 앞당겨 상대방의 자료를 확보하도록 법원에 요청하는 절차다. 로그나 기기 기록처럼 시간이 지나면 덮어쓰이거나 사라지는 증거가 있을 때 주로 쓰인다.",
      "en": "A request to a U.S. court for permission to gather evidence from the other side ahead of the normal schedule. It is typically used when the material at issue is transient, such as device logs or metadata that can be overwritten or lost while a case proceeds."
    },
    "firstSeen": "2026-09-02",
    "count": 1
  },
  {
    "id": "zero-data-retention",
    "term": {
      "ko": "데이터 무보존",
      "en": "Zero data retention"
    },
    "definition": {
      "ko": "AI 사업자가 요청을 처리한 뒤 입력과 출력을 저장하지 않고 곧바로 버리는 운영 방식이다. 외부 업체에 기록이 남는 것 자체가 규정 위반이 될 수 있는 규제 산업에서 계약 조건으로 요구하는 경우가 많다. 대신 기록이 남지 않으므로 여러 세션에 걸쳐 이뤄지는 오남용을 나중에 되짚어 찾아내기는 어려워진다.",
      "en": "A mode of operation in which an AI provider processes a request and then discards the input and output instead of storing them. Regulated industries often require it by contract, because records held by an outside vendor can themselves create compliance exposure. The trade-off is that misuse spread across many sessions becomes hard to detect once nothing is kept to compare against."
    },
    "firstSeen": "2026-09-02",
    "count": 1
  }
];
