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
    "count": 6
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
    "count": 1
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
    "count": 2
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
    "firstSeen": "2026-08-28",
    "count": 1
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
    "count": 1
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
    "count": 3
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
    "count": 3
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
  },
  {
    "id": "uam",
    "term": {
      "ko": "도심항공교통(UAM)",
      "en": "Urban air mobility (UAM)"
    },
    "definition": {
      "ko": "도시 안팎의 짧은 구간을 소형 항공기로 오가며 사람이나 화물을 실어 나르는 교통 체계다. 대부분 전기로 수직 이착륙하는 기체를 써서 활주로 대신 건물 옥상 같은 좁은 이착륙장을 이용한다. 여러 나라가 아직 시범 비행 단계에 있어 상용 노선은 드물다.",
      "en": "A transport system in which small aircraft carry people or cargo on short routes within and around cities. Most designs are electric and take off vertically, so they use compact landing pads such as building rooftops rather than runways. In most countries the technology is still at the test-flight stage, with few commercial routes in service."
    },
    "firstSeen": "2026-09-01",
    "count": 1
  },
  {
    "id": "npu",
    "term": {
      "ko": "신경망처리장치(NPU)",
      "en": "Neural processing unit (NPU)"
    },
    "definition": {
      "ko": "인공신경망 연산에 특화된 프로세서로, 스마트폰·자동차·로봇처럼 기기 안에서 직접 AI를 돌려야 하는 제품에 들어간다. 같은 연산을 CPU나 GPU로 처리할 때보다 전력을 훨씬 적게 쓰는 것이 핵심 장점이다.",
      "en": "A processor built specifically for neural network math, used inside devices such as phones, cars, and robots that need to run AI locally. Its main advantage over a CPU or GPU is doing the same work at far lower power, which matters when the device runs on a battery or a tight thermal budget."
    },
    "firstSeen": "2026-09-01",
    "count": 1
  },
  {
    "id": "fabless",
    "term": {
      "ko": "팹리스",
      "en": "Fabless"
    },
    "definition": {
      "ko": "반도체를 설계만 하고 생산 공장(팹)은 갖지 않는 회사를 뜻한다. 설계도를 만든 뒤 삼성 파운드리나 TSMC 같은 위탁생산 업체에 제조를 맡긴다. 공장 건설에 드는 막대한 비용을 피할 수 있어 스타트업이 칩 사업에 뛰어드는 일반적인 방식이다.",
      "en": "A fabless company designs chips but owns no fabrication plant, sending its designs to a contract manufacturer such as Samsung Foundry or TSMC to be built. Avoiding the cost of a fab is what lets small startups compete in silicon at all. In Korea's chip policy the term specifically marks the domestic design firms the government is trying to grow alongside its manufacturing giants."
    },
    "firstSeen": "2026-09-01",
    "count": 1
  },
  {
    "id": "adas",
    "term": {
      "ko": "첨단운전자지원시스템(ADAS)",
      "en": "ADAS"
    },
    "definition": {
      "ko": "차량이 카메라와 센서로 주변을 인식해 운전자를 돕는 기능을 묶어 부르는 말이다. 차선 유지, 자동 긴급제동, 어댑티브 크루즈 컨트롤 등이 여기 속한다. 완전 자율주행 이전 단계이지만 실시간 영상 인식이 필요해 차 안에서 직접 연산하는 AI 칩이 쓰인다.",
      "en": "Advanced driver assistance systems are the camera- and sensor-based features that help a driver rather than replace one, including lane keeping, automatic emergency braking and adaptive cruise control. They fall short of full autonomy but still require real-time perception, which is why they run on dedicated AI chips inside the vehicle instead of in the cloud."
    },
    "firstSeen": "2026-09-01",
    "count": 1
  },
  {
    "id": "physical-ai",
    "term": {
      "ko": "피지컬 AI",
      "en": "Physical AI"
    },
    "definition": {
      "ko": "화면 속 텍스트나 이미지가 아니라 로봇·기계·차량처럼 실제로 움직이는 물체를 제어하는 AI를 가리킨다. 카메라와 센서로 주변 상황을 인식하고 그에 맞춰 동작을 결정한다는 점에서, 대화형 AI와 달리 물리 세계의 제약을 함께 다뤄야 한다.",
      "en": "AI that controls things that move in the real world — robots, machines, vehicles — rather than producing text or images on a screen. It takes in camera and sensor data about its surroundings and decides on physical actions, so unlike a chatbot it has to cope with the constraints of the physical world."
    },
    "firstSeen": "2026-09-01",
    "count": 1
  }
];
