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
    "count": 17
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
    "count": 10
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
    "count": 4
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
    "count": 9
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
    "count": 5
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
    "count": 4
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
    "count": 8
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
    "count": 2
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
  },
  {
    "id": "frontier-model",
    "term": {
      "ko": "프런티어 모델",
      "en": "Frontier model"
    },
    "definition": {
      "ko": "현재 기술 수준에서 가장 앞선 성능을 가진 대규모 AI 모델을 가리키는 말이다. 능력이 크기 때문에 사이버 공격이나 무기 개발처럼 국가 안보와 얽힌 위험도 함께 커진다고 보아, 각국 규제 논의에서 별도의 검토 대상으로 다뤄진다.",
      "en": "A term for the most advanced large-scale AI models at the current state of the art. Because their capabilities are broad, regulators treat them as a separate category subject to extra review, on the view that they carry national-security-relevant risks such as cyberattack or weapons development."
    },
    "firstSeen": "2026-09-03",
    "count": 4
  },
  {
    "id": "uptime",
    "term": {
      "ko": "가동률 / Uptime"
    },
    "definition": {
      "ko": "일정 기간 서비스가 정상 작동한 시간의 비율이다. 99.4%는 90일 중 약 13시간이 정상이 아니었다는 뜻으로, 소수점 한 자리 차이가 실제로는 몇 시간의 차이가 된다. 클라우드 서비스가 신뢰성을 공개하는 표준 지표다."
    },
    "firstSeen": "2026-09-04",
    "count": 1
  },
  {
    "id": "key-value-store",
    "term": {
      "ko": "키-값 저장소"
    },
    "definition": {
      "ko": "이름표(키) 하나로 값을 넣고 꺼내는 가장 단순한 형태의 데이터베이스다. 표와 관계를 다루는 관계형 데이터베이스보다 기능은 적지만 그만큼 빠르고, 여러 대에 나눠 담기 쉬워 대규모 서비스의 설정값·카운터·메타데이터 보관에 널리 쓰인다."
    },
    "firstSeen": "2026-09-04",
    "count": 1
  },
  {
    "id": "reverse-proxy",
    "term": {
      "ko": "리버스 프록시"
    },
    "definition": {
      "ko": "여러 클라이언트와 실제 서버 사이에 놓여 요청을 대신 받아 뒤로 전달하는 중간 계층이다. 클라이언트는 서버 대신 이 계층에만 연결하므로, 서버가 감당할 연결 수와 부하를 운영자가 직접 통제할 수 있다. 요청을 묶거나 캐시하는 등 개별 클라이언트가 할 수 없는 일도 이 자리에서 가능해진다."
    },
    "firstSeen": "2026-09-04",
    "count": 1
  },
  {
    "id": "numerical-weather-prediction",
    "term": {
      "ko": "수치예보 / Numerical weather prediction"
    },
    "definition": {
      "ko": "대기의 물리 법칙을 방정식으로 풀어 미래 날씨를 계산하는 전통적 예보 방식이다. 슈퍼컴퓨터로 대규모 시뮬레이션을 돌려야 해서 결과가 나오기까지 몇 시간이 걸리며, 그 지연 때문에 비나 지표 기온처럼 빠르게 변하는 값에서 오차가 생긴다."
    },
    "firstSeen": "2026-09-04",
    "count": 1
  },
  {
    "id": "rag",
    "term": {
      "ko": "검색증강생성 / RAG"
    },
    "definition": {
      "ko": "언어 모델이 답을 만들기 전에 외부 데이터베이스나 문서를 먼저 찾아보고, 거기서 얻은 내용을 근거로 답하게 하는 방식이다. 모델이 학습하지 않은 최신 정보나 사내 자료를 다룰 수 있게 해 주지만, 질의마다 대규모 데이터를 실시간으로 읽어야 해서 저장장치와 메모리에 부담이 크다."
    },
    "firstSeen": "2026-09-05",
    "count": 1
  }
];
