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
    "count": 76,
    "plain": {
      "ko": "목표를 주면 필요한 도구를 쓰며 여러 단계의 일을 수행하는 AI입니다."
    }
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
    "count": 18,
    "plain": {
      "ko": "AI가 글을 읽고 만들 때 나눠 처리하는 작은 글 조각입니다."
    }
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
    "count": 11,
    "plain": {
      "ko": "학습을 마친 AI의 핵심 설정값을 내려받아 직접 실행할 수 있도록 공개한 것입니다."
    }
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
    "count": 19,
    "plain": {
      "ko": "정해진 문제로 AI의 실력을 비교하는 시험입니다."
    }
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
    "count": 15,
    "plain": {
      "ko": "AI가 사람의 의도와 가치에 맞게 행동하도록 만드는 일입니다."
    }
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
    "count": 9,
    "plain": {
      "ko": "문제를 미리 찾으려고 AI를 일부러 공격하거나 곤란한 질문을 하는 점검입니다."
    }
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
    "count": 24,
    "plain": {
      "ko": "AI가 위험한 요청에 응하거나 부적절한 답을 내놓지 못하도록 두는 안전장치입니다."
    }
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
    "count": 3,
    "plain": {
      "ko": "소송에서 사라질 수 있는 증거 등을 평소 일정보다 빨리 확보하게 해 달라는 절차입니다."
    }
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
    "count": 2,
    "plain": {
      "ko": "AI 서비스가 요청을 처리한 뒤 입력과 답변을 저장하지 않는 운영 방식입니다."
    }
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
    "count": 34,
    "plain": {
      "ko": "현재 가장 앞선 수준의 성능을 가진 AI를 가리키는 말입니다."
    }
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
    "count": 1,
    "plain": {
      "ko": "전체 시간 중 서비스가 정상적으로 작동한 시간의 비율입니다."
    }
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
    "count": 3,
    "plain": {
      "ko": "이름표 하나로 필요한 값을 저장하고 찾아오는 데이터 보관 방식입니다."
    }
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
    "count": 1,
    "plain": {
      "ko": "이용자의 요청을 먼저 받아 실제 서버에 전달하는 중간 안내소 같은 프로그램입니다."
    }
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
    "count": 2,
    "plain": {
      "ko": "대기의 움직임을 컴퓨터로 계산해 앞으로의 날씨를 예측하는 방식입니다."
    }
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
    "count": 3,
    "plain": {
      "ko": "AI가 답하기 전에 관련 문서를 찾아보고 그 내용을 바탕으로 답하는 방식입니다."
    }
  },
  {
    "id": "embodied-intelligence",
    "term": {
      "ko": "체화된 지능"
    },
    "definition": {
      "ko": "AI가 화면 속 대화나 텍스트에 머물지 않고 로봇처럼 물리적 몸을 갖고 현실 세계에서 물건을 다루며 배우는 것을 뜻한다. 카메라와 센서로 주변을 인식하고 팔·바퀴 같은 실제 동작으로 반응해야 하므로, 예측이 빗나갔을 때 곧바로 물리적 결과가 뒤따른다는 점이 순수 소프트웨어 AI와 다르다."
    },
    "firstSeen": "2026-09-06",
    "count": 8,
    "plain": {
      "ko": "로봇처럼 몸을 가진 AI가 실제 세상을 보고 움직이며 배우는 능력입니다."
    }
  },
  {
    "id": "proof-of-concept",
    "term": {
      "ko": "개념검증 / PoC"
    },
    "definition": {
      "ko": "새 기술을 본격 도입하기 전에 작은 범위에서 실제로 작동하는지 시험해 보는 단계다. 성공해도 전사 확산으로 이어지지 않고 시범사업에 머무는 경우가 많아, 이 지점에 갇히는 현상을 '파일럿의 벽'이라 부른다."
    },
    "firstSeen": "2026-09-06",
    "count": 6,
    "plain": {
      "ko": "새 기술을 본격적으로 도입하기 전에 작은 규모로 가능한지 시험하는 단계입니다."
    }
  },
  {
    "id": "zero-trust",
    "term": {
      "ko": "제로트러스트"
    },
    "definition": {
      "ko": "네트워크 내부에 있다는 이유만으로 사용자나 기기를 신뢰하지 않고, 접근 요청마다 신원과 권한을 다시 확인하는 보안 모델이다. 경계 방어가 뚫리면 내부가 무방비가 되는 기존 방식의 약점을 보완하기 위해 나왔다."
    },
    "firstSeen": "2026-09-07",
    "count": 1,
    "plain": {
      "ko": "회사 내부의 사용자나 기기라도 접근할 때마다 신원과 권한을 확인하는 보안 방식입니다."
    }
  },
  {
    "id": "k-rmf",
    "term": {
      "ko": "한국형 위험관리프레임워크"
    },
    "definition": {
      "ko": "정보체계를 도입하고 운영하는 전 과정에서 보안 위험을 식별하고 통제 수준을 정하는 국방 분야의 관리 체계다. 미국 국방부의 RMF를 한국 환경에 맞게 조정한 것으로, 체계별로 위험을 평가해 운영 승인 여부를 판단한다."
    },
    "firstSeen": "2026-09-07",
    "count": 1,
    "plain": {
      "ko": "국방 정보시스템의 보안 위험을 평가하고 운영해도 되는지 판단하는 한국형 관리 체계입니다."
    }
  },
  {
    "id": "recursive-self-improvement",
    "term": {
      "ko": "재귀적 자기 개선"
    },
    "definition": {
      "ko": "AI가 사람의 개입 없이 스스로 자신의 성능을 높이고, 그렇게 개선된 능력으로 다시 자신을 개선하는 과정을 뜻한다. 한 번 시작되면 개선 속도가 점점 빨라질 수 있어 통제 시점을 놓칠 위험이 안전 논의의 핵심 쟁점으로 꼽힌다."
    },
    "firstSeen": "2026-09-08",
    "count": 7,
    "plain": {
      "ko": "AI가 자신의 성능을 높이고, 개선된 능력으로 다시 자신을 개선하는 과정입니다."
    }
  },
  {
    "id": "warrant",
    "term": {
      "ko": "신주인수권 / Warrant"
    },
    "definition": {
      "ko": "정해진 가격에 특정 회사의 주식을 나중에 살 수 있는 권리를 담은 증권이다. 권리를 행사하기 전까지는 실제 주주가 아니어서 지분 보유나 경영 참여로 공시할 의무가 없다는 해석이 나오고, 이 때문에 실질적 영향력이 장부에 드러나지 않는 문제가 생긴다."
    },
    "firstSeen": "2026-09-08",
    "count": 1,
    "plain": {
      "ko": "정해진 가격으로 회사 주식을 나중에 살 수 있는 권리입니다."
    }
  },
  {
    "id": "single-nucleotide-variant",
    "term": {
      "ko": "단일 염기 변이"
    },
    "definition": {
      "ko": "DNA를 이루는 네 종류의 염기 중 한 자리가 다른 것으로 바뀐 유전적 차이를 말한다. 인간 유전체에서 이런 변화가 가능한 경우의 수는 약 90억 가지이며, 대부분은 무해하지만 일부는 질병의 직접적 원인이 된다."
    },
    "firstSeen": "2026-09-09",
    "count": 1,
    "plain": {
      "ko": "DNA를 이루는 글자 중 한 자리가 다른 글자로 바뀐 유전적 차이입니다."
    }
  },
  {
    "id": "non-coding-region",
    "term": {
      "ko": "비암호화 영역"
    },
    "definition": {
      "ko": "유전체에서 단백질을 직접 만들어 내지 않는 부분으로, 인간 유전체의 약 98%를 차지한다. 단백질을 만들지는 않지만 어떤 유전자를 언제 얼마나 켤지 조절하며, 형질과 연관된 변이 대부분이 이 영역에 있다."
    },
    "firstSeen": "2026-09-09",
    "count": 2,
    "plain": {
      "ko": "DNA 중 단백질을 직접 만들지 않는 부분으로, 유전자 작동 조절 등의 역할을 합니다."
    }
  },
  {
    "id": "gwas",
    "term": {
      "ko": "전장 유전체 연관 분석 / GWAS"
    },
    "definition": {
      "ko": "많은 사람의 유전체 전체를 훑어 특정 형질이나 질병을 가진 집단에서 더 자주 나타나는 유전 변이를 찾는 방법이다. 변이가 있는 '위치'만 알려주기 때문에, 그 근처에 어떤 유전자가 있고 어떤 경로에 영향을 주는지는 따로 해석해야 한다."
    },
    "firstSeen": "2026-09-10",
    "count": 1,
    "plain": {
      "ko": "많은 사람의 유전정보를 비교해 특정 질병이나 특징과 관련된 차이를 찾는 연구 방법입니다."
    }
  },
  {
    "id": "ai-fluency",
    "term": {
      "ko": "AI 플루언시 / AI Fluency"
    },
    "definition": {
      "ko": "AI 도구를 단순히 다루는 것을 넘어 언제, 어떻게, 왜 써야 하는지 판단하며 책임 있게 협업하는 능력을 말한다. 결과물을 비판적으로 검토하고 자신의 사고력을 유지하는 태도까지 포함한다."
    },
    "firstSeen": "2026-09-11",
    "count": 1,
    "plain": {
      "ko": "AI를 언제 어떻게 써야 하는지 판단하고 결과를 검토하며 활용하는 능력입니다."
    }
  },
  {
    "id": "existential-risk",
    "term": {
      "ko": "실존 위험 / Existential risk"
    },
    "definition": {
      "ko": "인류 문명을 영구히 파괴하거나 회복 불가능하게 축소시킬 수 있는 위험을 가리키는 말이다. AI 분야에서는 인간의 통제를 벗어난 고도화된 AI가 인류 전체에 돌이킬 수 없는 피해를 줄 가능성을 논할 때 쓰인다."
    },
    "firstSeen": "2026-09-12",
    "count": 16,
    "plain": {
      "ko": "인류 문명이 회복하기 어려울 정도로 파괴되거나 사라질 위험입니다."
    }
  },
  {
    "id": "hallucination",
    "term": {
      "ko": "환각 / Hallucination"
    },
    "definition": {
      "ko": "AI 언어 모델이 실제로는 존재하지 않는 사실, 인용, 출처를 그럴듯하게 만들어 내는 현상이다. 모델은 정답을 찾는 것이 아니라 확률적으로 자연스러운 문장을 생성하기 때문에, 자신 있게 틀린 내용을 내놓을 수 있다. 법률·의료처럼 정확성이 중요한 분야에서는 사람이 원자료와 대조해 검증해야 한다."
    },
    "firstSeen": "2026-09-12",
    "count": 3,
    "plain": {
      "ko": "AI가 사실이 아닌 내용이나 없는 출처를 그럴듯하게 만들어 답하는 현상입니다."
    }
  },
  {
    "id": "manufacturing-ax",
    "term": {
      "ko": "제조 AI 전환 / M.AX"
    },
    "definition": {
      "ko": "제조업의 설계·생산·품질 관리 등 공정 전반에 AI를 적용해 산업 구조를 바꾸는 것을 말한다. 산업통상부가 Manufacturing AI Transformation의 약자로 M.AX라 부르며, 산업단지 단위로 실증 사업을 지정해 추진하고 있다."
    },
    "firstSeen": "2026-09-13",
    "count": 1,
    "plain": {
      "ko": "설계부터 생산과 품질 관리까지 제조 과정 전반에 AI를 적용하는 변화입니다."
    }
  },
  {
    "id": "regulatory-capture",
    "term": {
      "ko": "규제 포획"
    },
    "definition": {
      "ko": "규제 대상인 기업이 규제 기관이나 입법 과정에 영향을 미쳐 규제를 자신에게 유리한 방향으로 만드는 현상이다. 이미 시장을 선점한 기업이 강한 규제를 요구해 후발 주자의 진입을 막는 경우가 대표적 사례로 꼽힌다."
    },
    "firstSeen": "2026-09-14",
    "count": 5,
    "plain": {
      "ko": "규제받는 기업이 규칙을 만드는 기관에 영향을 줘 자신에게 유리하게 바꾸는 현상입니다."
    }
  },
  {
    "id": "signals-intelligence",
    "term": {
      "ko": "신호정보 / SIGINT"
    },
    "definition": {
      "ko": "통신, 전자 신호, 레이더 등 전자적 수단으로 오가는 정보를 가로채 분석하는 첩보 활동이다. 사람을 통해 얻는 인간정보(HUMINT)와 대비되는 개념으로, 미국 NSA 가 이 분야를 총괄하는 대표적 기관이다."
    },
    "firstSeen": "2026-09-14",
    "count": 2,
    "plain": {
      "ko": "통신이나 레이더 같은 전자 신호를 수집하고 분석해 정보를 얻는 활동입니다."
    }
  },
  {
    "id": "reward-hacking",
    "term": {
      "ko": "보상 해킹 / Reward hacking"
    },
    "definition": {
      "ko": "AI 가 주어진 과제를 실제로 해결하는 대신, 평가 방식의 허점을 이용해 성공한 것처럼 점수를 얻는 행동을 말한다. 채점이 형식만 확인하면 문제 정의를 바꿔 제출하는 식으로 나타나며, 에이전트가 자율적으로 움직일수록 발견하기 어려워진다."
    },
    "firstSeen": "2026-09-15",
    "count": 2,
    "plain": {
      "ko": "AI가 일을 제대로 해결하는 대신 채점의 허점을 이용해 높은 점수를 얻는 행동입니다."
    }
  },
  {
    "id": "ai-slop",
    "term": {
      "ko": "AI 슬롭 / AI slop"
    },
    "definition": {
      "ko": "AI 가 대량으로 생성해 인터넷에 뿌리는 저품질 콘텐츠를 가리키는 속어다. 사람이 검토하지 않고 자동으로 만들어져 정보 가치가 낮고 양만 많다는 뜻에서 '찌꺼기'라는 이름이 붙었다. 검색 결과, 소셜미디어, 이메일을 채워 진짜 정보를 찾기 어렵게 만드는 문제로 지적된다."
    },
    "firstSeen": "2026-09-15",
    "count": 4,
    "plain": {
      "ko": "AI로 대량 생산한, 정보 가치가 낮은 글이나 이미지 같은 콘텐츠를 뜻합니다."
    }
  },
  {
    "id": "cognitive-surrender",
    "term": {
      "ko": "인지적 항복"
    },
    "definition": {
      "ko": "어려운 문제를 만났을 때 스스로 생각하는 과정을 건너뛰고 곧바로 AI에 답을 맡기는 태도를 가리키는 말이다. 답은 얻지만 문제를 풀며 생기는 깊은 이해와 기억이 남지 않아, 배웠다고 느끼면서도 실제 능력은 늘지 않는 상태로 이어질 수 있다."
    },
    "firstSeen": "2026-09-16",
    "count": 1,
    "plain": {
      "ko": "스스로 생각하는 과정을 건너뛰고 AI의 답에 판단을 맡기는 태도입니다."
    }
  },
  {
    "id": "ai-accelerationism",
    "term": {
      "ko": "AI 가속주의"
    },
    "definition": {
      "ko": "AI 개발 속도를 늦추지 말고 오히려 규제를 최소화해 최대한 빨리 밀어붙여야 한다는 입장이다. 이에 맞서 개발 속도를 늦추고 안전장치를 먼저 갖추자는 쪽을 감속론이라 부르며, 두 진영의 대립이 미국 AI 정책 논쟁의 핵심 축이다."
    },
    "firstSeen": "2026-09-16",
    "count": 3,
    "plain": {
      "ko": "규제를 줄이고 AI 개발을 더 빠르게 추진해야 한다는 입장입니다."
    }
  },
  {
    "id": "unified-memory",
    "term": {
      "ko": "통합 메모리 / Unified memory"
    },
    "definition": {
      "ko": "CPU 와 GPU 가 하나의 메모리 풀을 함께 쓰는 구조다. 애플 M시리즈 칩이 채택해 그래픽카드 메모리 용량 제한 없이 큰 AI 모델을 한 기기에서 올릴 수 있어 AI 개발자들이 맥을 찾는 이유가 된다."
    },
    "firstSeen": "2026-09-17",
    "count": 1,
    "plain": {
      "ko": "컴퓨터의 중앙 처리장치와 그래픽 처리장치가 같은 메모리를 함께 쓰는 구조입니다."
    }
  },
  {
    "id": "basel-convention",
    "term": {
      "ko": "바젤협약 / Basel Convention"
    },
    "definition": {
      "ko": "유해 폐기물의 국가 간 이동과 처리를 규제하기 위해 1989년 채택된 국제 협약이다. 선진국이 유해 폐기물을 개발도상국에 떠넘기는 것을 막는 것이 목적이며, 미국은 서명은 했지만 아직 비준하지 않았다."
    },
    "firstSeen": "2026-09-17",
    "count": 1,
    "plain": {
      "ko": "유해 폐기물이 국경을 넘어 이동하고 처리되는 방식을 규제하는 국제 협약입니다."
    }
  },
  {
    "id": "federated-learning",
    "term": {
      "ko": "연합학습 / Federated learning"
    },
    "definition": {
      "ko": "여러 기기가 각자 가진 데이터로 AI 모델을 학습한 뒤 원본 데이터 대신 학습 결과(모델 갱신분)만 중앙에 모아 합치는 방식이다. 민감한 원본 데이터를 밖으로 내보내지 않으면서도 여러 곳의 경험을 하나의 모델에 반영할 수 있어 의료·국방처럼 데이터 반출이 어려운 분야에서 쓰인다."
    },
    "firstSeen": "2026-09-18",
    "count": 1,
    "plain": {
      "ko": "원본 데이터를 한곳에 모으지 않고 각 기기에서 배운 AI의 학습 결과를 합치는 방식입니다."
    }
  },
  {
    "id": "google-zero",
    "term": {
      "ko": "구글 제로 / Google Zero"
    },
    "definition": {
      "ko": "검색 엔진이나 AI 챗봇이 답을 직접 보여 주면서 언론사 사이트로 넘어오는 검색 유입이 사실상 0에 가까워지는 상황을 가리키는 말이다. 이용자가 요약만 읽고 원문 링크를 누르지 않게 되어 콘텐츠 제작자의 광고·구독 수익 기반이 무너지는 현상을 뜻한다."
    },
    "firstSeen": "2026-09-19",
    "count": 1,
    "plain": {
      "ko": "검색이나 AI가 답을 직접 보여줘 원래 사이트로 들어오는 방문자가 거의 사라지는 상황입니다."
    }
  },
  {
    "id": "campus-network",
    "term": {
      "ko": "캠퍼스 네트워크"
    },
    "definition": {
      "ko": "기업 본사, 공장, 대학처럼 한 장소 안의 건물들을 묶는 내부 네트워크를 말한다. 유무선 접속, 보안, 장비 관리가 한 단위로 운영되며, 인터넷이나 데이터센터로 나가는 망과는 구분된다."
    },
    "firstSeen": "2026-09-21",
    "count": 1,
    "plain": {
      "ko": "회사·공장·학교처럼 한 장소 안의 여러 건물과 기기를 연결하는 내부 통신망입니다."
    }
  },
  {
    "id": "zero-day",
    "term": {
      "ko": "제로데이 / Zero-day"
    },
    "definition": {
      "ko": "소프트웨어 제작사가 아직 알지 못하거나 패치를 내놓지 않은 보안 취약점을 가리킨다. 방어할 시간이 '0일'이라는 뜻으로, 공개되거나 악용되는 시점에 사용자를 보호할 수단이 없어 특히 위험하게 취급된다."
    },
    "firstSeen": "2026-09-22",
    "count": 1,
    "plain": {
      "ko": "제작사가 아직 모르거나 수정하지 못한 프로그램의 보안 결함입니다."
    }
  },
  {
    "id": "secure-enclave",
    "term": {
      "ko": "보안 엔클레이브"
    },
    "definition": {
      "ko": "보안 엔클레이브는 프로세서 하드웨어가 나머지 시스템과 격리해 둔 보호 구역이다. 이 안에서 처리되는 데이터는 운영체제나 서버 관리자도 들여다볼 수 없다. 클라우드에서 개인 데이터를 다룰 때 외부 접근을 막는 데 쓰인다."
    },
    "plain": {
      "ko": "칩 안에 따로 떼어 놓은 잠긴 방으로, 그 안의 데이터는 바깥에서 아무도 볼 수 없다."
    },
    "firstSeen": "2026-09-24",
    "count": 2
  },
  {
    "id": "software-stack",
    "term": {
      "ko": "소프트웨어 스택"
    },
    "definition": {
      "ko": "프로그램을 만들고 실행하는 데 필요한 여러 소프트웨어를 층층이 쌓아 한 묶음으로 쓰는 구성을 말한다. AI에서는 프로그래밍 언어, 모델을 만들고 돌리는 도구, 서버 운영 도구 등이 한 스택을 이룬다. 칩 회사마다 스택이 다르면 개발자는 칩을 바꿀 때마다 코드를 다시 짜야 한다."
    },
    "plain": {
      "ko": "프로그램을 만들고 돌리는 데 필요한 여러 소프트웨어를 층층이 쌓은 묶음이다."
    },
    "firstSeen": "2026-09-25",
    "count": 1
  },
  {
    "id": "dividend-recap",
    "term": {
      "ko": "배당 리캡"
    },
    "definition": {
      "ko": "회사가 새로 돈을 빌려 그 돈을 기존 주주에게 배당으로 나눠 주는 자금 조달 방식이다. 회사에 새 사업 자금을 넣기보다 주주가 보유 지분을 팔지 않고도 현금을 손에 쥘 수 있게 하는 데 목적이 있다. 대신 회사가 갚아야 할 빚은 늘어난다."
    },
    "plain": {
      "ko": "회사가 돈을 빌려 그 돈을 주주에게 나눠 주는 방식이다."
    },
    "firstSeen": "2026-09-25",
    "count": 1
  }
];
