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
    "firstSeen": "2026-08-28",
    "count": 8
  },
  {
    "id": "context-window",
    "term": {
      "ko": "컨텍스트 창",
      "en": "Context window"
    },
    "definition": {
      "ko": "모델이 한 번에 볼 수 있는 입력의 최대 길이. 이 한도를 넘으면 앞부분을 잊거나 잘라내야 하므로, 긴 문서나 오래 도는 작업에서 병목이 된다.",
      "en": "The maximum amount of input a model can hold at once. Past that limit, earlier content is dropped or truncated — the bottleneck for long documents and long-running tasks."
    },
    "firstSeen": "2026-08-31",
    "count": 2
  },
  {
    "id": "inference",
    "term": {
      "ko": "추론",
      "en": "Inference"
    },
    "definition": {
      "ko": "학습이 끝난 모델을 실제로 실행해 답을 만드는 단계. 학습은 한 번이지만 추론은 사용자가 부를 때마다 일어나므로 서비스 원가의 대부분을 차지한다.",
      "en": "Running a trained model to produce an answer. Training happens once; inference happens on every request, which is why it dominates the cost of running a service."
    },
    "firstSeen": "2026-08-29",
    "count": 3
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
    "firstSeen": "2026-08-31",
    "count": 3
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
    "firstSeen": "2026-08-29",
    "count": 3
  },
  {
    "id": "fine-tuning",
    "term": {
      "ko": "미세조정",
      "en": "Fine-tuning"
    },
    "definition": {
      "ko": "이미 학습된 범용 모델에 특정 분야의 데이터를 추가로 학습시켜 그 분야에 맞게 조정하는 것. 처음부터 학습하는 것보다 훨씬 적은 비용이 든다.",
      "en": "Further training a general model on domain-specific data so it fits that domain — far cheaper than training from scratch."
    },
    "firstSeen": "2026-08-28",
    "count": 3
  },
  {
    "id": "rag",
    "term": {
      "ko": "검색 증강 생성(RAG)",
      "en": "Retrieval-augmented generation"
    },
    "definition": {
      "ko": "질문을 받으면 먼저 문서를 검색해 근거를 찾고, 그 근거를 함께 넣어 답을 생성하는 방식. 모델이 모르는 최신 정보나 사내 문서를 다룰 때 쓴다.",
      "en": "Searching a document store for evidence first, then generating an answer with that evidence attached — the usual way to handle fresh or internal information a model never saw."
    },
    "firstSeen": "2026-08-28",
    "count": 3
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
    "firstSeen": "2026-08-28",
    "count": 6
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
    "firstSeen": "2026-08-28",
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
    "firstSeen": "2026-08-29",
    "count": 3
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
    "firstSeen": "2026-08-29",
    "count": 5
  },
  {
    "id": "sovereign-ai",
    "term": {
      "ko": "소버린 AI",
      "en": "Sovereign AI"
    },
    "definition": {
      "ko": "한 국가가 자국 영토 안의 인프라와 자국어 데이터로 AI를 구축·운영해 외국 사업자에 대한 의존을 줄이려는 정책 기조.",
      "en": "A national push to build and run AI on domestic infrastructure with domestic-language data, reducing dependence on foreign providers."
    },
    "firstSeen": "2026-08-31",
    "count": 1
  },
  {
    "id": "hbm",
    "term": {
      "ko": "고대역폭 메모리(HBM)",
      "en": "High-bandwidth memory"
    },
    "definition": {
      "ko": "메모리 칩을 수직으로 쌓아 데이터 통로를 넓힌 반도체. AI 가속기의 성능은 연산 속도보다 이 메모리 대역폭에 먼저 막히는 경우가 많다.",
      "en": "Memory stacked vertically to widen the data path. AI accelerators are often limited by this bandwidth before they are limited by raw compute."
    },
    "firstSeen": "2026-08-28",
    "count": 2
  },
  {
    "id": "pue",
    "term": {
      "ko": "전력사용효율(PUE)",
      "en": "Power usage effectiveness"
    },
    "definition": {
      "ko": "데이터센터 전체 전력을 서버가 실제로 쓴 전력으로 나눈 값. 1에 가까울수록 냉각 등 부대 설비에 낭비되는 전력이 적다.",
      "en": "Total data-center power divided by the power the servers actually consume. The closer to 1, the less is lost to cooling and overhead."
    },
    "firstSeen": "2026-08-28",
    "count": 2
  }
];
