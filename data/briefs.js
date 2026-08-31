/**
 * Sarah's AI Brief — 브리핑 데이터 (최신순)
 * SPEC.md 7절 데이터 계약 참조.
 *
 * ⚠ 이 파일의 내용은 구조 확인용 샘플이다. 실제 보도된 기사가 아니며,
 *   출처 링크는 가짜 기사 URL 대신 각 매체 홈으로 연결한다.
 *   Phase 3에서 수집·요약 파이프라인이 같은 형식으로 이 파일을 생성한다.
 *
 * 점수 규칙 (SPEC 6.2)
 *   weight = 출처 유형 가중치, cross = min(교차보도 매체 수, 4) / 4,
 *   fresh  = 24시간 창 안에서의 선형 감쇠 (창 끝 = 발행 전날 23:00Z)
 *   score  = round((0.40×weight + 0.35×cross + 0.25×fresh) × 100)
 *   기사는 score 내림차순으로 정렬되며 rank 와 id 는 발행 후 바뀌지 않는다.
 */
window.SAB = window.SAB || {};

SAB.briefs = [
  {
    "date": "2026-08-31",
    "weekday": {
      "ko": "월요일",
      "en": "Monday"
    },
    "type": "daily",
    "note": null,
    "funnel": {
      "collected": 347,
      "window24h": 121,
      "excluded": 16,
      "deduped": 71,
      "fetchFailed": 5,
      "scored": 66,
      "published": 10
    },
    "insight": {
      "title": {
        "ko": "규제는 미뤄지고, 청구서는 앞당겨진다",
        "en": "The rules slip six months. The bill arrives early."
      },
      "body": {
        "ko": [
          "EU가 AI법 고위험 조항의 시행을 6개월 미루기로 한 날, 미국의 한 주에서는 데이터센터 전력 수요가 가정용 전기요금 인상 근거로 인용됐다(3번, 6번). 규제의 시계는 늦춰졌지만 물리적 비용의 시계는 그렇지 않다. 지연된 것은 문서의 마감일이고, 앞당겨진 것은 전력망과 예산의 부담이다.",
          "같은 날 국내에서는 통신 3사가 소버린 AI 클라우드를 공동 구축한다고 발표했다(7번). 규제 유예가 사업자에게 준 여유와, 인프라를 자국 안에 두려는 압력이 정반대 방향으로 작동한다. 유예는 \"천천히 해도 된다\"는 신호가 아니라 \"어디에 지을지 지금 정하라\"는 신호에 가깝다.",
          "한편 오늘 상위 두 건은 모두 에이전트에 관한 것이지만, 어느 쪽도 새로운 능력을 말하지 않는다(1번, 2번). 컨텍스트를 어떻게 관리할지, 권한과 감사 로그를 어떻게 나눌지가 주제다. 에이전트가 기능 경쟁에서 운영 문제로 넘어가는 중이다."
        ],
        "en": [
          "On the same day the EU pushed back its high-risk AI provisions by six months, a US state cited data-center demand as grounds for a residential rate increase (items 3 and 6). The regulatory clock slowed; the physical one did not. What got delayed is a paperwork deadline. What got pulled forward is pressure on the grid and on budgets.",
          "In Korea, the three major carriers announced a jointly built sovereign AI cloud (item 7). The breathing room the delay hands operators and the pressure to keep infrastructure onshore pull in opposite directions. A delay is less a signal to slow down than a signal to decide where to build, now.",
          "Meanwhile the top two stories are both about agents, and neither is about new capability (items 1 and 2). They are about managing context, and about splitting permissions and audit logs. Agents are moving from a capability race to an operations problem."
        ]
      }
    },
    "articles": [
      {
        "id": "2026-08-31-01",
        "rank": 1,
        "title": {
          "ko": "Anthropic, 장시간 도는 에이전트의 컨텍스트 관리 방식 공개",
          "en": "Anthropic details how long-running agents manage context"
        },
        "source": "Anthropic News",
        "sourceType": "primary",
        "url": "https://www.anthropic.com/news",
        "publishedAt": "2026-08-30T20:36:00Z",
        "topic": "models",
        "score": 98,
        "scoreParts": {
          "weight": 1,
          "cross": 1,
          "fresh": 0.9
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          },
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          },
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          }
        ],
        "summary": {
          "ko": [
            "Anthropic이 여러 시간 이어지는 작업에서 에이전트가 컨텍스트 창(모델이 한 번에 볼 수 있는 입력 한도)을 다루는 방법을 문서로 정리해 공개했다. 작업 중간 산출물을 요약해 다시 넣는 대신, 파일 시스템과 외부 메모리에 남기고 필요할 때만 불러오는 구조를 권장한다.",
            "문서는 컨텍스트를 \"쌓아 올리는 것\"이 아니라 \"예산\"으로 다루라고 명시한다. 하위 작업을 별도 컨텍스트에서 실행하고 결과만 상위로 올리는 분할 방식, 도구 호출 결과 중 재사용되지 않는 부분을 명시적으로 버리는 회수 규칙이 함께 제시됐다."
          ],
          "en": [
            "Anthropic published guidance on how agents should handle the context window — the amount of input a model can hold at once — during tasks that run for hours. Rather than repeatedly re-summarizing intermediate output back into the prompt, it recommends writing to a file system or external memory and pulling pieces back only when needed.",
            "The document frames context as a budget to spend rather than a buffer to fill. It describes running sub-tasks in their own contexts and returning only results, plus explicit reclamation rules for tool output that will not be reused."
          ]
        },
        "implication": {
          "ko": "컨텍스트 창을 늘리는 경쟁이 한계에 닿았다는 신호로 읽힌다. 창이 커져도 모델이 긴 입력의 중간 부분을 놓치는 문제는 그대로이고, 토큰 비용은 선형으로 증가한다. 앞으로 에이전트 제품의 차이는 모델 성능보다 \"무엇을 컨텍스트에 넣지 않을지\" 결정하는 설계에서 갈릴 가능성이 크다.",
          "en": "Read this as a sign the context-window race has hit diminishing returns. A bigger window does not fix a model losing track of the middle of a long input, and token costs scale linearly. The difference between agent products is likely to come from deciding what to keep out of context rather than from raw model quality."
        },
        "terms": [
          "agent",
          "context-window",
          "tokens"
        ]
      },
      {
        "id": "2026-08-31-02",
        "rank": 2,
        "title": {
          "ko": "OpenAI, 기업용 에이전트에 권한 분리와 감사 로그 도입",
          "en": "OpenAI adds scoped permissions and audit logs to enterprise agents"
        },
        "source": "OpenAI Blog",
        "sourceType": "primary",
        "url": "https://openai.com/news/",
        "publishedAt": "2026-08-30T19:38:00Z",
        "topic": "enterprise",
        "score": 88,
        "scoreParts": {
          "weight": 1,
          "cross": 0.75,
          "fresh": 0.86
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          }
        ],
        "summary": {
          "ko": [
            "OpenAI가 기업용 에이전트 플랫폼에 도구별 권한 분리와 전체 행동 감사 로그를 추가했다. 관리자는 에이전트가 호출할 수 있는 도구를 개별로 지정하고, 승인이 필요한 동작을 따로 지정할 수 있다.",
            "감사 로그에는 에이전트가 호출한 도구, 전달한 인자, 반환값 요약, 사람이 승인한 시점이 기록된다. 로그는 기업의 기존 보안 정보·이벤트 관리 시스템으로 내보낼 수 있다."
          ],
          "en": [
            "OpenAI added per-tool permission scoping and full action audit logging to its enterprise agent platform. Administrators can enumerate which tools an agent may call and mark specific actions as requiring human approval.",
            "Audit entries record the tool invoked, the arguments passed, a summary of what was returned, and when a human approved it. Logs can be exported into an organization’s existing security information and event management system."
          ]
        },
        "implication": {
          "ko": "기업이 에이전트 도입에서 막히는 지점이 성능이 아니라 감사 추적이라는 것을 공급자가 인정한 셈이다. 규제 산업에서는 \"무엇을 했는지 나중에 증명할 수 있는가\"가 도입 여부를 가르는데, 지금까지 에이전트는 이 질문에 답하지 못했다. 이 기능이 표준이 되면 에이전트 평가 기준에 감사 가능성이 들어오게 된다.",
          "en": "The vendor is conceding that what blocks enterprise adoption is auditability, not capability. In regulated industries the deciding question is whether you can later prove what happened, and agents have not been able to answer it. If this becomes standard, auditability joins the list of things agents get evaluated on."
        },
        "terms": [
          "agent",
          "guardrails"
        ]
      },
      {
        "id": "2026-08-31-03",
        "rank": 3,
        "title": {
          "ko": "EU, AI법 고위험 조항 시행 6개월 유예 합의",
          "en": "EU agrees to a six-month delay on high-risk AI Act provisions"
        },
        "source": "The Verge",
        "sourceType": "industry",
        "url": "https://www.theverge.com/ai-artificial-intelligence",
        "publishedAt": "2026-08-30T17:43:00Z",
        "topic": "policy",
        "score": 87,
        "scoreParts": {
          "weight": 0.8,
          "cross": 1,
          "fresh": 0.78
        },
        "crossRefs": [
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          },
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          },
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          },
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          }
        ],
        "summary": {
          "ko": [
            "EU 회원국들이 AI법의 고위험 시스템 관련 의무 시행을 6개월 미루는 데 합의했다. 적합성 평가 기관 지정과 조화 표준 제정이 예정보다 늦어진 것이 이유로 제시됐다.",
            "유예 대상은 고위험 분류에 해당하는 시스템의 문서화·시험·등록 의무다. 금지 관행 조항과 범용 AI 모델에 대한 투명성 의무는 기존 일정대로 시행된다."
          ],
          "en": [
            "EU member states agreed to postpone obligations for high-risk systems under the AI Act by six months, citing delays in designating conformity assessment bodies and finalizing harmonized standards.",
            "The delay covers documentation, testing, and registration duties for systems in the high-risk category. Prohibited-practice provisions and transparency obligations for general-purpose models remain on the original schedule."
          ]
        },
        "implication": {
          "ko": "유예는 규제 완화가 아니라 집행 인프라가 준비되지 않았다는 고백이다. 조화 표준이 없으면 기업은 무엇을 지켜야 하는지 모르고, 감독 기관은 무엇을 근거로 판단할지 모른다. 6개월은 기업에 시간을 준 것이 아니라 표준 제정에 시간을 준 것이며, 그 사이 준비를 미룬 기업은 같은 자리에서 다시 막히게 된다.",
          "en": "The delay is not deregulation; it is an admission that the enforcement machinery is not ready. Without harmonized standards, companies do not know what compliance looks like and regulators do not know what to measure against. The six months buy time for standards work, not for companies — anyone who treats it as a reprieve will hit the same wall later."
        },
        "terms": []
      },
      {
        "id": "2026-08-31-04",
        "rank": 4,
        "title": {
          "ko": "추론 전용 칩 스타트업, 20억 달러 유치",
          "en": "Inference-only chip startup raises $2B"
        },
        "source": "TechCrunch",
        "sourceType": "industry",
        "url": "https://techcrunch.com/category/artificial-intelligence/",
        "publishedAt": "2026-08-30T15:48:00Z",
        "topic": "funding",
        "score": 85,
        "scoreParts": {
          "weight": 0.8,
          "cross": 1,
          "fresh": 0.7
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          },
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          }
        ],
        "summary": {
          "ko": [
            "학습이 아닌 추론(학습이 끝난 모델을 실행해 답을 만드는 단계)에만 쓰이는 가속기를 만드는 스타트업이 20억 달러 규모의 투자를 유치했다. 회사는 메모리 대역폭에 집중한 설계로 동일 전력에서 처리량을 높였다고 밝혔다.",
            "투자에는 기존 투자사와 함께 두 곳의 클라우드 사업자가 참여했다. 회사는 조달 자금을 고대역폭 메모리 확보와 생산 물량 선점에 쓴다고 설명했다."
          ],
          "en": [
            "A startup building accelerators used only for inference — running a finished model, not training one — raised $2B. The company says a memory-bandwidth-first design raises throughput at the same power draw.",
            "Two cloud providers joined existing investors in the round. The company said proceeds go toward securing high-bandwidth memory supply and locking in manufacturing capacity."
          ]
        },
        "implication": {
          "ko": "학습용 칩 시장은 사실상 정리됐고, 남은 싸움은 추론이라는 판단이 자금으로 확인됐다. 추론은 사용자가 부를 때마다 발생하므로 총량이 학습을 넘어선 지 오래고, 여기서 전력당 처리량을 개선하면 그대로 서비스 마진이 된다. 다만 이 회사가 조달 자금을 쓰겠다고 밝힌 곳이 설계가 아니라 메모리 확보라는 점은, 병목이 이미 아키텍처가 아니라 공급망에 있다는 뜻이다.",
          "en": "Capital is confirming the read that the training-chip market is settled and the remaining fight is inference. Inference happens on every request, so its aggregate volume passed training long ago, and any gain in throughput per watt converts directly into service margin. Notably the company is spending the money on memory supply rather than on design — the bottleneck has already moved from architecture to the supply chain."
        },
        "terms": [
          "inference",
          "hbm"
        ]
      },
      {
        "id": "2026-08-31-05",
        "rank": 5,
        "title": {
          "ko": "딥마인드, 단백질 설계 모델 후속 버전의 실험 검증률 공개",
          "en": "DeepMind publishes wet-lab validation rates for its protein design model"
        },
        "source": "Google DeepMind Blog",
        "sourceType": "primary",
        "url": "https://deepmind.google/discover/blog/",
        "publishedAt": "2026-08-30T18:12:00Z",
        "topic": "models",
        "score": 78,
        "scoreParts": {
          "weight": 1,
          "cross": 0.5,
          "fresh": 0.8
        },
        "crossRefs": [
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          },
          {
            "source": "MIT Technology Review",
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/"
          }
        ],
        "summary": {
          "ko": [
            "구글 딥마인드가 단백질 설계 모델의 후속 버전을 공개하면서, 모델이 설계한 후보를 실제 실험실에서 합성해 검증한 비율을 함께 발표했다. 계산 결과만이 아니라 습식 실험 결과를 같이 낸 것이 이전 발표와 다른 점이다.",
            "발표에는 실패 사례의 분류도 포함됐다. 모델이 안정적인 구조를 예측했으나 발현 단계에서 실패한 경우와, 결합은 성립했으나 목표 특이성이 낮았던 경우가 나뉘어 보고됐다."
          ],
          "en": [
            "Google DeepMind released a successor to its protein design model along with the share of its designs that were synthesized and validated in a wet lab. Reporting bench results next to computational ones is the departure from earlier announcements.",
            "The release also categorizes failures, separating designs that folded as predicted but failed to express from those that bound successfully but lacked target specificity."
          ]
        },
        "implication": {
          "ko": "실패 분류를 함께 낸 것이 이 발표의 실질이다. 생성 모델의 과학 분야 성과는 그동안 성공 사례만 골라 보여준다는 비판을 받아왔고, 실험 검증률과 실패 유형은 그 비판에 대한 직접적인 답이다. 이 형식이 관행이 되면 분야 전체의 주장 검증 비용이 내려간다.",
          "en": "The failure taxonomy is the substance here. Scientific claims from generative models have drawn criticism for showcasing only successes; validation rates and failure types answer that directly. If this reporting format becomes the norm, it lowers the cost of checking claims across the field."
        },
        "terms": [
          "eval"
        ]
      },
      {
        "id": "2026-08-31-06",
        "rank": 6,
        "title": {
          "ko": "데이터센터 전력 수요, 가정용 전기요금 인상 근거로 인용",
          "en": "Data-center demand cited in a residential rate increase"
        },
        "source": "Ars Technica",
        "sourceType": "tech",
        "url": "https://arstechnica.com/ai/",
        "publishedAt": "2026-08-30T20:07:00Z",
        "topic": "compute",
        "score": 74,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.5,
          "fresh": 0.88
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          }
        ],
        "summary": {
          "ko": [
            "미국의 한 주 규제 당국이 승인한 전기요금 인상안에서, 데이터센터 신규 접속 수요에 따른 송전 설비 증설 비용이 인상 근거 중 하나로 제시됐다. 인상분은 산업용과 가정용에 나뉘어 부과된다.",
            "해당 지역에는 최근 3년간 대형 데이터센터 접속 신청이 집중됐고, 계통 운영자는 신규 접속 대기 물량이 기존 계통 용량을 넘어선다고 보고했다."
          ],
          "en": [
            "In a rate increase approved by a US state regulator, transmission build-out driven by new data-center interconnection requests was listed among the justifications. The increase is allocated across industrial and residential customers.",
            "The region has absorbed a concentration of large data-center interconnection applications over three years, and the grid operator reported that the queue exceeds existing system capacity."
          ]
        },
        "implication": {
          "ko": "AI 인프라 비용이 사업자 손익계산서를 넘어 일반 가구의 고지서에 나타나기 시작했다. 이 지점부터 데이터센터 입지는 기술·부지 문제가 아니라 지역 정치 문제가 된다. 전력사용효율 같은 지표를 자발적으로 공개하는 사업자와 그렇지 않은 사업자의 인허가 속도가 갈릴 가능성이 크다.",
          "en": "The cost of AI infrastructure has moved off operator income statements and onto household bills. From here, siting a data center is local politics rather than a technical or real-estate problem. Operators who volunteer figures like power usage effectiveness are likely to clear permitting faster than those who do not."
        },
        "terms": [
          "pue"
        ]
      },
      {
        "id": "2026-08-31-07",
        "rank": 7,
        "title": {
          "ko": "통신 3사, 소버린 AI 클라우드 공동 구축",
          "en": "Korea’s three carriers to jointly build a sovereign AI cloud"
        },
        "source": "전자신문",
        "sourceType": "domestic",
        "url": "https://www.etnews.com/",
        "publishedAt": "2026-08-30T18:12:00Z",
        "topic": "compute",
        "score": 68,
        "scoreParts": {
          "weight": 0.75,
          "cross": 0.5,
          "fresh": 0.8
        },
        "crossRefs": [
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          },
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          }
        ],
        "summary": {
          "ko": [
            "국내 통신 3사가 공공·금융 부문을 대상으로 하는 소버린 AI 클라우드를 공동 구축한다고 발표했다. 데이터와 모델 가중치를 국내 데이터센터 안에 두는 것이 요건이다.",
            "3사는 가속기 조달과 운영 인력을 분담하고 과금 체계를 통일한다고 밝혔다. 초기 대상은 국내 규정상 해외 리전 사용이 제한되는 기관이다."
          ],
          "en": [
            "Korea’s three telecom carriers announced a jointly built sovereign AI cloud aimed at public-sector and financial customers, with data and model weights required to stay inside domestic data centers.",
            "The carriers said they will split accelerator procurement and operations staffing and offer unified billing. The initial target is institutions barred by domestic rules from using overseas regions."
          ]
        },
        "implication": {
          "ko": "경쟁사끼리 인프라를 공동 구축한다는 것은 단독으로는 가속기 조달 물량을 확보하기 어렵다는 뜻이다. 소버린 AI가 정책 구호에서 조달 계약으로 내려온 사례이지만, 관건은 발표가 아니라 가격이다. 해외 리전 대비 단가 격차가 좁혀지지 않으면 규정상 쓸 수밖에 없는 기관 외에는 수요가 생기지 않는다.",
          "en": "Competitors pooling infrastructure means none of them can secure accelerator volume alone. This is sovereign AI descending from policy slogan to procurement contract — but the deciding factor is price, not the announcement. Unless the gap against overseas regions narrows, demand will not extend past institutions that have no legal alternative."
        },
        "terms": [
          "sovereign-ai"
        ]
      },
      {
        "id": "2026-08-31-08",
        "rank": 8,
        "title": {
          "ko": "AI 코딩 도구 도입 1년, 팀별 생산성 편차가 컸다",
          "en": "A year in, AI coding tools show wide variance between teams"
        },
        "source": "MIT Technology Review",
        "sourceType": "tech",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
        "publishedAt": "2026-08-30T14:50:00Z",
        "topic": "society",
        "score": 59,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.25,
          "fresh": 0.66
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          }
        ],
        "summary": {
          "ko": [
            "AI 코딩 도구를 1년 이상 사용한 기업들을 조사한 보고서에서, 팀 사이의 생산성 변화 폭이 도구 도입 여부보다 컸다는 결과가 나왔다. 같은 도구를 쓰고도 배포 빈도가 늘어난 팀과 줄어든 팀이 함께 관찰됐다.",
            "보고서는 코드 리뷰 부담과 결함 재작업 시간을 함께 측정했다. 생성량이 늘어난 팀 중 일부는 리뷰 대기 시간이 늘어 전체 리드타임이 오히려 길어졌다."
          ],
          "en": [
            "A study of companies using AI coding tools for over a year found the spread between teams larger than the effect of adopting the tools at all. Teams on the same tooling showed both increased and decreased deployment frequency.",
            "The report measured review load and rework time alongside output. In some teams where generated volume rose, review queues lengthened and total lead time got worse."
          ]
        },
        "implication": {
          "ko": "도구가 생산량을 늘리는 것은 확인됐지만, 생산량은 병목이 아니었던 팀이 많았다는 이야기다. 병목이 리뷰나 배포에 있는 조직에서는 앞단의 산출량 증가가 대기열만 키운다. 도입 성과를 코드 작성 속도로 측정하는 관행 자체가 잘못된 지표를 보고 있을 수 있다.",
          "en": "The tools do increase output; the finding is that output was not the bottleneck for many teams. Where the constraint sits in review or deployment, more upstream volume just lengthens the queue. Measuring adoption by authoring speed may be tracking the wrong number entirely."
        },
        "terms": []
      },
      {
        "id": "2026-08-31-09",
        "rank": 9,
        "title": {
          "ko": "개인정보위, 생성형 AI 학습 데이터 가이드라인 초안 공개",
          "en": "Korea’s privacy commission drafts guidance on generative AI training data"
        },
        "source": "ZDNet Korea",
        "sourceType": "domestic",
        "url": "https://zdnet.co.kr/news/?lstcode=0050",
        "publishedAt": "2026-08-30T16:45:00Z",
        "topic": "policy",
        "score": 57,
        "scoreParts": {
          "weight": 0.75,
          "cross": 0.25,
          "fresh": 0.74
        },
        "crossRefs": [
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          }
        ],
        "summary": {
          "ko": [
            "개인정보보호위원회가 생성형 AI 학습 데이터 처리에 관한 가이드라인 초안을 공개하고 의견 수렴에 들어갔다. 공개된 웹 데이터에 포함된 개인정보의 처리 근거와 가명처리 기준이 주요 내용이다.",
            "초안은 학습 단계와 서비스 제공 단계를 나누어 요구사항을 제시했다. 정보주체의 삭제 요구에 대해서는 재학습이 아닌 출력 차단으로 대응할 수 있는 조건도 함께 제시됐다."
          ],
          "en": [
            "Korea’s Personal Information Protection Commission published draft guidance on handling training data for generative AI and opened it for comment. It centers on the legal basis for personal data found in public web data and on pseudonymization standards.",
            "The draft separates requirements for the training stage from those for service operation. It also sets out conditions under which a deletion request may be met by blocking output rather than retraining."
          ]
        },
        "implication": {
          "ko": "삭제 요구를 출력 차단으로 갈음할 수 있게 한 대목이 실질적인 쟁점이다. 학습된 모델에서 특정 데이터만 지우는 것은 기술적으로 어렵고, 재학습을 요구하면 사실상 서비스 중단에 해당한다. 규제 당국이 기술적 실행 가능성을 반영하기 시작했다는 신호이지만, 차단이 삭제와 같은 보호 수준인지는 논쟁이 남는다.",
          "en": "The provision letting output blocking stand in for deletion is the real issue. Removing specific data from a trained model is hard, and requiring retraining amounts to shutting the service down. It signals regulators are starting to account for technical feasibility — though whether blocking offers protection equivalent to deletion remains contested."
        },
        "terms": [
          "fine-tuning"
        ]
      },
      {
        "id": "2026-08-31-10",
        "rank": 10,
        "title": {
          "ko": "소비자용 GPU에서 장문 컨텍스트를 처리하는 오픈소스 추론 엔진",
          "en": "Open-source engine runs long contexts on consumer GPUs"
        },
        "source": "Hacker News",
        "sourceType": "community",
        "url": "https://news.ycombinator.com/",
        "publishedAt": "2026-08-30T21:04:00Z",
        "topic": "opensource",
        "score": 56,
        "scoreParts": {
          "weight": 0.6,
          "cross": 0.25,
          "fresh": 0.92
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          }
        ],
        "summary": {
          "ko": [
            "오픈소스 추론 엔진의 새 릴리스가 커뮤니티 상위에 올랐다. 어텐션 캐시를 디스크로 넘기는 방식으로 소비자용 GPU에서도 장문 컨텍스트 처리를 가능하게 했다는 것이 요지다.",
            "벤치마크에 따르면 처리 속도는 서버용 가속기 대비 크게 느리지만, 메모리 한계로 실행 자체가 불가능하던 길이의 입력이 동작한다. 토론에서는 디스크 입출력이 새로운 병목이 된다는 지적이 이어졌다."
          ],
          "en": [
            "A new release of an open-source inference engine reached the top of the community feed. It offloads the attention cache to disk, making long-context work possible on consumer GPUs.",
            "Benchmarks show it is far slower than server accelerators, but inputs that previously failed outright on memory limits now run. Discussion focused on disk I/O becoming the new bottleneck."
          ]
        },
        "implication": {
          "ko": "개인이 장문 컨텍스트를 돌릴 수 있게 되는 것은 성능 문제가 아니라 접근성 문제다. 느려도 실행이 되면 검증과 실험을 각자 할 수 있고, 이는 공개 가중치 모델의 실질적 효용을 끌어올린다. 다만 병목이 메모리에서 디스크로 옮겨간 것뿐이라는 지적도 타당하다.",
          "en": "Individuals being able to run long contexts is a question of access, not speed. Slow but working means people can verify and experiment on their own, which raises the practical value of open-weight models. The counterpoint stands too: the bottleneck moved from memory to disk rather than disappearing."
        },
        "terms": [
          "context-window",
          "open-weights",
          "inference"
        ]
      }
    ]
  },
  {
    "date": "2026-08-30",
    "weekday": {
      "ko": "일요일",
      "en": "Sunday"
    },
    "type": "weekly",
    "note": null,
    "funnel": {
      "collected": 2183,
      "window24h": 0,
      "excluded": 0,
      "deduped": 0,
      "fetchFailed": 0,
      "scored": 0,
      "published": 0
    },
    "insight": {
      "title": {
        "ko": "이번 주: 능력에서 운영으로",
        "en": "This week: from capability to operations"
      },
      "body": {
        "ko": [
          "8월 24일부터 29일까지 여섯 번의 브리핑에 56건이 실렸다. 주 초반에는 새 모델과 벤치마크 기사가 많았지만, 후반으로 갈수록 권한·감사·전력·조달처럼 \"돌리는 일\"에 관한 기사가 상위를 차지했다.",
          "한 주를 관통한 질문은 하나로 모인다. 무엇을 더 잘하게 만들 것인가가 아니라, 이미 만든 것을 어떻게 책임지고 돌릴 것인가."
        ],
        "en": [
          "Fifty-six items ran across six briefings from August 24 to 29. Early in the week new models and benchmarks dominated; by the end, the top slots belonged to permissions, audits, power, and procurement — the work of running things.",
          "The week converged on a single question. Not how to make it more capable, but how to operate what already exists and answer for it."
        ]
      }
    },
    "weekly": {
      "sections": [
        {
          "title": {
            "ko": "1. 규제의 시계가 느려졌다",
            "en": "1. The regulatory clock slowed"
          },
          "body": {
            "ko": "EU의 고위험 조항 유예와 국내 AI 기본법 시행령 입법예고가 같은 주에 나왔다. 방향은 반대처럼 보이지만 원인은 같다. 어느 쪽도 집행에 필요한 세부 기준이 아직 없다. 기업이 이 시기에 할 수 있는 유일하게 안전한 선택은 문서화를 미리 해두는 것이다.",
            "en": "The EU’s high-risk delay and Korea’s AI framework enforcement decree landed in the same week. The directions look opposite but the cause is the same: neither has the detailed criteria enforcement requires. The only safe move for companies right now is to document ahead of the deadline."
          },
          "refs": [
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-03"
            },
            {
              "date": "2026-08-28",
              "articleId": "2026-08-28-07"
            }
          ]
        },
        {
          "title": {
            "ko": "2. 병목은 모델이 아니라 전력이다",
            "en": "2. The bottleneck is power, not models"
          },
          "body": {
            "ko": "데이터센터 전력 수요가 가정용 요금 인상 근거로 인용됐고, 냉각 효율 개선 기사와 고대역폭 메모리 공급 계약 기사가 뒤따랐다. 세 건 모두 모델 성능과 무관하며, 셋 다 같은 제약을 다른 각도에서 말한다. 지금 확장을 막는 것은 알고리즘이 아니다.",
            "en": "Data-center demand was cited in a residential rate increase, followed by stories on cooling efficiency and on high-bandwidth memory supply deals. None of the three is about model quality, and all three describe the same constraint from different angles. What limits scaling right now is not the algorithm."
          },
          "refs": [
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-06"
            },
            {
              "date": "2026-08-28",
              "articleId": "2026-08-28-05"
            },
            {
              "date": "2026-08-28",
              "articleId": "2026-08-28-08"
            }
          ]
        },
        {
          "title": {
            "ko": "3. 에이전트가 운영 문제가 됐다",
            "en": "3. Agents became an operations problem"
          },
          "body": {
            "ko": "주간 상위 기사 중 에이전트를 다룬 네 건은 모두 새 능력이 아니라 컨텍스트 관리, 권한 분리, 감사 로그, 프롬프트 인젝션 대응을 다뤘다. 데모가 되는 것과 조직에서 돌릴 수 있는 것 사이의 거리가 이번 주 기사들의 실제 주제였다.",
            "en": "All four agent stories in the week’s top slots were about context management, permission scoping, audit logging, and prompt injection — not new capability. The distance between what demos and what an organization can actually run was the week’s real subject."
          },
          "refs": [
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-01"
            },
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-02"
            },
            {
              "date": "2026-08-29",
              "articleId": "2026-08-29-04"
            }
          ]
        },
        {
          "title": {
            "ko": "4. 평가가 흔들린다",
            "en": "4. Evaluation is wobbling"
          },
          "body": {
            "ko": "딥마인드가 실험 검증률과 실패 유형을 함께 공개했고, 국내 연구진은 한국어 평가셋을 공개했으며, AI 코딩 도구 조사에서는 생산성 지표 자체가 잘못됐을 수 있다는 결과가 나왔다. 세 건이 같은 방향을 가리킨다. 무엇을 재고 있는지 다시 정의하는 중이다.",
            "en": "DeepMind published validation rates alongside failure types, Korean researchers released a Korean-language evaluation set, and a study of AI coding tools suggested the productivity metric itself may be wrong. Three items pointing the same way: the field is redefining what it measures."
          },
          "refs": [
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-05"
            },
            {
              "date": "2026-08-31",
              "articleId": "2026-08-31-08"
            },
            {
              "date": "2026-08-29",
              "articleId": "2026-08-29-06"
            }
          ]
        }
      ]
    },
    "articles": []
  },
  {
    "date": "2026-08-29",
    "weekday": {
      "ko": "토요일",
      "en": "Saturday"
    },
    "type": "daily",
    "note": {
      "ko": "오늘은 8건입니다. 후보 3건의 원문 본문을 끝내 확보하지 못했고, 예비 후보로도 채우지 못했습니다. RSS 요약만 보고 쓰지 않기로 했기 때문에 자리를 비운 채로 발행합니다.",
      "en": "Eight items today. We could not retrieve the full text for three candidates and could not backfill them. Since we do not write from RSS summaries alone, we publish short rather than fill the slots."
    },
    "funnel": {
      "collected": 298,
      "window24h": 94,
      "excluded": 11,
      "deduped": 58,
      "fetchFailed": 9,
      "scored": 49,
      "published": 8
    },
    "insight": {
      "title": {
        "ko": "공개하는 쪽과 잠그는 쪽이 같은 날 움직였다",
        "en": "Opening up and locking down, on the same day"
      },
      "body": {
        "ko": [
          "Meta가 공개 가중치 모델의 라이선스를 상업적 사용에 더 열린 방향으로 바꾼 날, 학습 데이터 라이선싱 시장이 형성되고 있다는 기사가 함께 올라왔다(2번, 7번). 모델은 열리고 데이터는 값이 매겨진다.",
          "두 흐름은 모순이 아니라 같은 계산의 앞뒤다. 가중치를 공개해도 그 가중치를 만든 데이터를 재현할 수 없으면 경쟁 우위는 유지된다. 개방의 경계선이 모델에서 데이터로 옮겨가는 중이다."
        ],
        "en": [
          "On the day Meta loosened the license on its open-weight model for commercial use, a separate story described a forming market for licensed training data (items 2 and 7). Models open up; data gets priced.",
          "These are not contradictory — they are two sides of one calculation. Releasing weights costs little if the data behind them cannot be reproduced. The boundary of openness is moving from the model to the data."
        ]
      }
    },
    "articles": [
      {
        "id": "2026-08-29-01",
        "rank": 1,
        "title": {
          "ko": "OpenAI, 음성 인터페이스 응답 지연 대폭 단축",
          "en": "OpenAI cuts latency in its voice interface"
        },
        "source": "OpenAI Blog",
        "sourceType": "primary",
        "url": "https://openai.com/news/",
        "publishedAt": "2026-08-28T16:16:00Z",
        "topic": "products",
        "score": 84,
        "scoreParts": {
          "weight": 1,
          "cross": 0.75,
          "fresh": 0.72
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          },
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          }
        ],
        "summary": {
          "ko": [
            "OpenAI가 음성 대화 인터페이스의 첫 응답까지 걸리는 시간을 절반 이하로 줄였다고 발표했다. 음성 인식과 응답 생성을 순차 처리하지 않고 겹쳐 실행하는 방식이 적용됐다.",
            "발표에는 사용자가 말을 끊고 들어올 때의 처리 방식 변경도 포함됐다. 기존에는 응답 생성을 중단하고 다시 시작했으나, 이제 진행 중인 생성을 유지한 채 입력을 반영한다."
          ],
          "en": [
            "OpenAI said it cut time-to-first-response in its voice interface by more than half by overlapping speech recognition with response generation instead of running them in sequence.",
            "The release also changes barge-in handling: where the system previously aborted and restarted generation when a user interrupted, it now folds the new input into the response already in flight."
          ]
        },
        "implication": {
          "ko": "음성 인터페이스에서 지연은 기능이 아니라 대화 성립 여부를 가르는 조건이다. 사람은 200밀리초 남짓의 침묵을 어색함으로 인식하기 때문에, 지연 단축은 곧 사용 맥락의 확장을 뜻한다. 운전 중이나 조리 중처럼 화면을 볼 수 없는 상황이 실제 시장이 된다.",
          "en": "In a voice interface, latency is not a feature but the condition for conversation to happen at all. People read a pause of roughly 200 milliseconds as awkward, so cutting delay expands where the product can be used. Contexts with no screen — driving, cooking — become the actual market."
        },
        "terms": [
          "inference"
        ]
      },
      {
        "id": "2026-08-29-02",
        "rank": 2,
        "title": {
          "ko": "Meta, 공개 가중치 모델 라이선스 상업 조건 완화",
          "en": "Meta loosens commercial terms on its open-weight model"
        },
        "source": "Meta Engineering",
        "sourceType": "primary",
        "url": "https://engineering.fb.com/",
        "publishedAt": "2026-08-28T14:50:00Z",
        "topic": "opensource",
        "score": 83,
        "scoreParts": {
          "weight": 1,
          "cross": 0.75,
          "fresh": 0.66
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          },
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          }
        ],
        "summary": {
          "ko": [
            "Meta가 공개 가중치 모델의 라이선스에서 월간 활성 사용자 수 기준 제한 조항을 삭제했다. 대신 모델 출처 표기 의무와 안전 정책 준수 조항이 유지된다.",
            "개정된 라이선스는 파생 모델의 재배포 조건도 명확히 했다. 미세조정한 모델을 배포할 때 원 모델을 명시하면 별도 승인 없이 상업적 이용이 가능하다."
          ],
          "en": [
            "Meta removed the monthly-active-user threshold from the license on its open-weight model, while keeping attribution requirements and safety policy terms in place.",
            "The revised license also clarifies redistribution of derivatives: fine-tuned models may be used commercially without separate approval as long as the base model is named."
          ]
        },
        "implication": {
          "ko": "사용자 수 제한 조항은 대형 경쟁사만 겨냥한 장치였고, 실제로는 중견 기업이 도입을 망설이는 이유로 더 자주 작동했다. 이 조항을 없앤 것은 공개 가중치 진영의 경쟁 상대가 다른 오픈 모델이 아니라 폐쇄형 API라는 판단을 반영한다. 다만 안전 정책 준수 조항이 남아 있는 한 이 라이선스를 오픈소스라고 부르기는 어렵다.",
          "en": "The user threshold was aimed at large rivals but in practice more often deterred mid-sized adopters. Dropping it reflects a read that the open-weight camp competes with closed APIs, not with other open models. As long as the safety policy clause remains, though, this license is not open source in the usual sense."
        },
        "terms": [
          "open-weights",
          "fine-tuning"
        ]
      },
      {
        "id": "2026-08-29-03",
        "rank": 3,
        "title": {
          "ko": "금융권 AI 도입 조사: 도입률은 높고 운영 전환율은 낮다",
          "en": "Finance-sector survey: high adoption, low production rate"
        },
        "source": "VentureBeat",
        "sourceType": "industry",
        "url": "https://venturebeat.com/category/ai/",
        "publishedAt": "2026-08-28T15:48:00Z",
        "topic": "enterprise",
        "score": 67,
        "scoreParts": {
          "weight": 0.8,
          "cross": 0.5,
          "fresh": 0.7
        },
        "crossRefs": [
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          },
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          }
        ],
        "summary": {
          "ko": [
            "금융기관을 대상으로 한 조사에서 AI 파일럿을 진행한 비율은 높았으나 실제 운영 환경으로 전환한 비율은 그보다 크게 낮았다. 응답 기관들은 모델 성능보다 감사 대응과 설명 의무를 주된 장애로 꼽았다.",
            "운영 전환에 성공한 기관들은 공통적으로 사람의 승인 단계를 워크플로에 명시적으로 남겨두었다고 답했다."
          ],
          "en": [
            "A survey of financial institutions found a high rate of AI pilots but a much lower rate of moves into production. Respondents named audit response and explainability duties, not model quality, as the main obstacles.",
            "Institutions that did reach production consistently reported keeping an explicit human approval step in the workflow."
          ]
        },
        "implication": {
          "ko": "파일럿과 운영 사이의 격차는 기술 격차가 아니라 책임 소재의 격차다. 사람 승인 단계를 남긴 곳이 성공했다는 결과는 자동화율을 낮춘 쪽이 오히려 더 멀리 갔다는 뜻이며, 도입 초기에 완전 자동화를 목표로 잡는 설계가 역효과를 낸다는 근거가 된다.",
          "en": "The gap between pilot and production is a gap in accountability, not in technology. That the successful institutions kept a human approval step means the ones who automated less got further — evidence that aiming for full automation early works against you."
        },
        "terms": [
          "guardrails"
        ]
      },
      {
        "id": "2026-08-29-04",
        "rank": 4,
        "title": {
          "ko": "실제 서비스에서 프롬프트 인젝션이 성공한 사례 분석",
          "en": "Analysis of successful prompt injection in live services"
        },
        "source": "Ars Technica",
        "sourceType": "tech",
        "url": "https://arstechnica.com/ai/",
        "publishedAt": "2026-08-28T21:04:00Z",
        "topic": "safety",
        "score": 66,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.25,
          "fresh": 0.92
        },
        "crossRefs": [
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          }
        ],
        "summary": {
          "ko": [
            "보안 연구진이 실제 운영 중인 여러 AI 서비스를 대상으로 프롬프트 인젝션 공격을 시험한 결과를 공개했다. 웹 페이지나 문서에 숨긴 지시문이 에이전트의 도구 호출을 유도한 사례가 보고됐다.",
            "연구는 입력 필터만으로는 차단이 어렵다는 점을 지적했다. 공격 문자열이 사용자 입력이 아니라 에이전트가 읽어들인 외부 문서에 들어 있었기 때문이다."
          ],
          "en": [
            "Security researchers published results from testing prompt injection against several live AI services, reporting cases where instructions hidden in web pages or documents induced an agent to call tools.",
            "The work notes input filtering alone does not stop this, since the attack string arrived not as user input but inside external documents the agent had retrieved."
          ]
        },
        "implication": {
          "ko": "에이전트에게 외부 문서를 읽히는 순간 그 문서는 신뢰할 수 없는 입력이 된다. 사용자 입력만 검사하는 기존 보안 모델은 이 구조에서 작동하지 않으며, 도구 호출 권한을 미리 좁혀두는 것 외에 확실한 방어가 아직 없다. 오늘 상위에 오른 권한 분리 기사들과 같은 문제의 반대편이다.",
          "en": "The moment an agent reads an external document, that document is untrusted input. A security model that inspects only user input does not hold here, and no reliable defense exists beyond narrowing tool permissions in advance. This is the other side of the permission-scoping stories running near the top this week."
        },
        "terms": [
          "agent",
          "guardrails",
          "red-teaming"
        ]
      },
      {
        "id": "2026-08-29-05",
        "rank": 5,
        "title": {
          "ko": "창고 로봇 스타트업, 물류 대기업에 인수",
          "en": "Warehouse robotics startup acquired by logistics group"
        },
        "source": "TechCrunch",
        "sourceType": "industry",
        "url": "https://techcrunch.com/category/artificial-intelligence/",
        "publishedAt": "2026-08-28T13:24:00Z",
        "topic": "robotics",
        "score": 65,
        "scoreParts": {
          "weight": 0.8,
          "cross": 0.5,
          "fresh": 0.6
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          }
        ],
        "summary": {
          "ko": [
            "비정형 물체 집품을 다루는 창고 로봇 스타트업이 물류 대기업에 인수됐다. 인수 기업은 자사 물류센터에 이미 시범 도입해 운영 중이었다.",
            "인수 금액은 공개되지 않았으며, 스타트업의 기술팀은 인수 기업의 자동화 부문으로 편입된다."
          ],
          "en": [
            "A warehouse robotics startup working on picking irregular items was acquired by a logistics group that had already been running it in pilot at its own facilities.",
            "Terms were not disclosed. The startup’s engineering team moves into the acquirer’s automation division."
          ]
        },
        "implication": {
          "ko": "로보틱스에서 고객이 인수자가 되는 패턴이 반복되고 있다. 실사용 데이터를 가진 쪽이 기술을 사들이는 구조인데, 이는 로봇 성능이 범용 모델보다 현장 데이터에 더 의존한다는 사실을 보여준다. 독립 로보틱스 스타트업이 규모를 키우기 어려운 이유이기도 하다.",
          "en": "The pattern of the customer becoming the acquirer keeps repeating in robotics. The side holding real deployment data buys the technology, which reflects how much more robot performance depends on field data than on a general model. It is also why independent robotics startups struggle to scale alone."
        },
        "terms": []
      },
      {
        "id": "2026-08-29-06",
        "rank": 6,
        "title": {
          "ko": "국내 연구진, 한국어 평가 데이터셋 공개",
          "en": "Korean researchers release a Korean-language evaluation set"
        },
        "source": "전자신문",
        "sourceType": "domestic",
        "url": "https://www.etnews.com/",
        "publishedAt": "2026-08-28T11:57:00Z",
        "topic": "models",
        "score": 61,
        "scoreParts": {
          "weight": 0.75,
          "cross": 0.5,
          "fresh": 0.54
        },
        "crossRefs": [
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          },
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          }
        ],
        "summary": {
          "ko": [
            "국내 연구진이 한국어 능력을 측정하는 평가 벤치마크를 공개했다. 영어 벤치마크를 번역한 것이 아니라 한국의 법령·행정 문서·생활 맥락에서 문항을 구성한 것이 특징이다.",
            "연구진은 문항 절반을 비공개로 유지해 학습 데이터 오염을 막는다고 밝혔다. 공개된 문항으로는 재현 검증만 가능하다."
          ],
          "en": [
            "Korean researchers released a benchmark for Korean-language ability, built from Korean statutes, administrative documents, and everyday contexts rather than translated from English sets.",
            "Half the items are held back to prevent contamination of training data; the public half supports reproduction checks only."
          ]
        },
        "implication": {
          "ko": "문항 절반을 비공개로 두는 설계가 핵심이다. 공개된 벤치마크는 결국 학습 데이터에 섞여 점수를 부풀리고, 그 시점부터 지표로서 죽는다. 번역이 아닌 자체 문항이라는 점도 중요한데, 번역 벤치마크는 언어 능력이 아니라 번역 품질을 재는 경우가 많기 때문이다.",
          "en": "Holding half the items back is the key design choice. A fully public benchmark eventually leaks into training data, inflates scores, and dies as a metric. Building original items rather than translating matters too: translated benchmarks often measure translation quality instead of language ability."
        },
        "terms": [
          "eval"
        ]
      },
      {
        "id": "2026-08-29-07",
        "rank": 7,
        "title": {
          "ko": "학습 데이터 라이선싱 시장이 형성되고 있다",
          "en": "A market for licensed training data is taking shape"
        },
        "source": "MIT Technology Review",
        "sourceType": "tech",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
        "publishedAt": "2026-08-28T15:19:00Z",
        "topic": "data",
        "score": 60,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.25,
          "fresh": 0.68
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          }
        ],
        "summary": {
          "ko": [
            "출판사와 미디어 기업이 AI 학습용 데이터를 직접 라이선싱하는 계약이 늘고 있다는 분석이 나왔다. 소송 결과를 기다리는 대신 가격을 매기는 쪽으로 이동하고 있다는 것이다.",
            "분석은 계약 구조가 일회성 매절에서 사용량 연동으로 옮겨가는 경향도 함께 지적했다."
          ],
          "en": [
            "An analysis reports a rise in publishers and media companies licensing data directly for AI training, moving to price their archives rather than wait on litigation outcomes.",
            "It also notes deal structures shifting from one-time buyouts toward usage-linked terms."
          ]
        },
        "implication": {
          "ko": "라이선싱 시장이 생기면 무단 수집의 법적 방어 논리가 약해진다. \"달리 구할 방법이 없었다\"는 항변은 시장 가격이 존재하는 순간 성립하기 어려워지기 때문이다. 데이터 확보 비용이 신규 진입자에게 실질적인 장벽으로 작동하기 시작한다.",
          "en": "Once a licensing market exists, the legal defense for unlicensed scraping weakens — \"there was no other way to obtain it\" is hard to argue when a market price exists. Data acquisition cost starts functioning as a real barrier to new entrants."
        },
        "terms": []
      },
      {
        "id": "2026-08-29-08",
        "rank": 8,
        "title": {
          "ko": "벡터 검색 라이브러리, 메모리 사용량 절반으로",
          "en": "Vector search library halves memory use"
        },
        "source": "Hacker News",
        "sourceType": "community",
        "url": "https://news.ycombinator.com/",
        "publishedAt": "2026-08-28T20:07:00Z",
        "topic": "opensource",
        "score": 55,
        "scoreParts": {
          "weight": 0.6,
          "cross": 0.25,
          "fresh": 0.88
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          }
        ],
        "summary": {
          "ko": [
            "오픈소스 벡터 검색 라이브러리의 새 버전이 인덱스 양자화 방식을 바꿔 메모리 사용량을 절반 수준으로 줄였다고 발표했다. 검색 정확도 손실은 벤치마크 기준 1퍼센트포인트 내외로 보고됐다.",
            "토론에서는 실제 검색 증강 생성 파이프라인에서 병목이 벡터 검색이 아니라 문서 재순위화 단계라는 지적이 나왔다."
          ],
          "en": [
            "A new release of an open-source vector search library changed its index quantization to cut memory use roughly in half, with reported recall loss of about one percentage point on benchmarks.",
            "Commenters argued that in real retrieval-augmented generation pipelines the bottleneck is the reranking step, not vector search."
          ]
        },
        "implication": {
          "ko": "검색 인프라 비용이 내려가는 것은 자체 구축의 손익분기점을 낮춘다는 뜻이다. 다만 병목이 재순위화에 있다는 지적이 맞다면, 이 개선은 총 지연시간보다 운영 비용에서 체감된다.",
          "en": "Cheaper retrieval infrastructure lowers the break-even point for building in-house. If the reranking critique is right, though, the gain shows up in operating cost rather than in end-to-end latency."
        },
        "terms": [
          "rag"
        ]
      }
    ]
  },
  {
    "date": "2026-08-28",
    "weekday": {
      "ko": "금요일",
      "en": "Friday"
    },
    "type": "daily",
    "note": null,
    "funnel": {
      "collected": 361,
      "window24h": 133,
      "excluded": 19,
      "deduped": 78,
      "fetchFailed": 4,
      "scored": 74,
      "published": 10
    },
    "insight": {
      "title": {
        "ko": "증명하는 쪽으로 무게가 옮겨갔다",
        "en": "The weight shifted toward proving things"
      },
      "body": {
        "ko": [
          "오늘 상위 두 건은 성능 발표가 아니라 검증에 관한 것이다. 딥마인드는 수학 증명을 형식 검증기로 확인한 결과를 냈고, Anthropic은 모델 자율성 평가 프레임워크를 공개했다(1번, 2번). 둘 다 \"잘한다\"가 아니라 \"잘하는지 어떻게 아느냐\"에 답하려는 시도다.",
          "반대편에는 검증되지 않은 것들의 비용이 있다. 검색 증강 생성 도입 실패 분석과 AI 기본법 시행령 입법예고가 같은 날 올라왔다(6번, 7번). 무엇이 작동하는지 모르는 상태에서 규칙을 만들어야 하는 상황이 반복되고 있다."
        ],
        "en": [
          "The top two items today are about verification, not performance. DeepMind reported results checked by a formal proof verifier, and Anthropic published a framework for evaluating model autonomy (items 1 and 2). Both answer \"how would you know\" rather than \"how good is it.\"",
          "On the other side is the cost of what has not been verified. An analysis of failed retrieval-augmented generation deployments and a notice of Korea’s AI framework decree landed the same day (items 6 and 7). Rules keep having to be written before anyone knows what works."
        ]
      }
    },
    "articles": [
      {
        "id": "2026-08-28-01",
        "rank": 1,
        "title": {
          "ko": "딥마인드, 형식 검증기로 확인한 수학 증명 결과 공개",
          "en": "DeepMind reports formally verified mathematical proofs"
        },
        "source": "Google DeepMind Blog",
        "sourceType": "primary",
        "url": "https://deepmind.google/discover/blog/",
        "publishedAt": "2026-08-27T15:19:00Z",
        "topic": "models",
        "score": 92,
        "scoreParts": {
          "weight": 1,
          "cross": 1,
          "fresh": 0.68
        },
        "crossRefs": [
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          },
          {
            "source": "MIT Technology Review",
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/"
          },
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          }
        ],
        "summary": {
          "ko": [
            "구글 딥마인드가 모델이 생성한 수학 증명을 형식 검증기로 확인한 결과를 공개했다. 사람이 채점하는 대신 기계가 증명의 각 단계를 검사했다는 점이 이전 발표와 다르다.",
            "공개된 결과에는 검증에 실패한 증명의 비율과 실패 지점 분포도 포함됐다. 대부분의 실패는 최종 결론이 아니라 중간 보조정리에서 발생했다."
          ],
          "en": [
            "Google DeepMind published results in which model-generated mathematical proofs were checked by a formal verifier — machine-checked step by step rather than graded by humans.",
            "The release includes the share of proofs that failed verification and where they failed. Most failures occurred in intermediate lemmas rather than in final conclusions."
          ]
        },
        "implication": {
          "ko": "형식 검증은 채점자의 관대함이 개입할 여지를 없앤다. 모델의 수학 능력 주장은 그동안 평가 방식 논란에서 자유롭지 못했는데, 기계 검증은 그 논란을 통째로 우회한다. 실패가 보조정리에 몰렸다는 것은 모델이 큰 그림은 잡되 세부를 건너뛴다는 기존 관찰과 일치한다.",
          "en": "Formal verification removes any room for a lenient grader. Claims about mathematical ability have never escaped disputes over how they were scored; machine checking sidesteps the dispute entirely. That failures cluster in lemmas matches the standing observation that these models sketch the arc and skip the details."
        },
        "terms": [
          "eval"
        ]
      },
      {
        "id": "2026-08-28-02",
        "rank": 2,
        "title": {
          "ko": "Anthropic, 모델 자율성 평가 프레임워크 공개",
          "en": "Anthropic publishes a model autonomy evaluation framework"
        },
        "source": "Anthropic News",
        "sourceType": "primary",
        "url": "https://www.anthropic.com/news",
        "publishedAt": "2026-08-27T17:43:00Z",
        "topic": "safety",
        "score": 86,
        "scoreParts": {
          "weight": 1,
          "cross": 0.75,
          "fresh": 0.78
        },
        "crossRefs": [
          {
            "source": "MIT Technology Review",
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/"
          },
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          }
        ],
        "summary": {
          "ko": [
            "Anthropic이 모델이 사람의 감독 없이 수행할 수 있는 작업의 범위를 측정하는 평가 프레임워크를 공개했다. 작업 지속 시간, 도구 사용 폭, 실패 시 복구 능력을 축으로 삼는다.",
            "프레임워크에는 평가 자체를 모델이 인지하고 다르게 행동하는 경우를 걸러내기 위한 절차도 포함됐다."
          ],
          "en": [
            "Anthropic published a framework for measuring the range of tasks a model can perform without human oversight, organized around task duration, breadth of tool use, and recovery from failure.",
            "It includes procedures for detecting cases where a model recognizes it is being evaluated and behaves differently as a result."
          ]
        },
        "implication": {
          "ko": "평가 인지 여부를 걸러내는 절차를 포함한 것이 눈에 띈다. 모델이 시험 중임을 알아채고 다르게 행동한다면 안전 평가 전체의 근거가 흔들리는데, 이를 방법론에 명시적으로 넣은 것은 이 문제가 이론적 우려에서 실무 항목으로 넘어왔다는 뜻이다.",
          "en": "The inclusion of evaluation-awareness checks is the notable part. If a model can tell it is being tested and behaves differently, the basis for safety evaluation erodes — writing that into the methodology means the concern has moved from theoretical to operational."
        },
        "terms": [
          "alignment",
          "eval",
          "agent"
        ]
      },
      {
        "id": "2026-08-28-03",
        "rank": 3,
        "title": {
          "ko": "브라우저에 에이전트 기능 기본 탑재",
          "en": "Agent features ship built into the browser"
        },
        "source": "The Verge",
        "sourceType": "industry",
        "url": "https://www.theverge.com/ai-artificial-intelligence",
        "publishedAt": "2026-08-27T18:40:00Z",
        "topic": "products",
        "score": 79,
        "scoreParts": {
          "weight": 0.8,
          "cross": 0.75,
          "fresh": 0.82
        },
        "crossRefs": [
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          },
          {
            "source": "Ars Technica",
            "url": "https://arstechnica.com/ai/"
          },
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          }
        ],
        "summary": {
          "ko": [
            "주요 브라우저가 확장 설치 없이 쓸 수 있는 에이전트 기능을 기본 탑재했다. 열려 있는 탭의 내용을 읽고 양식 작성이나 예약 같은 작업을 대신 수행한다.",
            "기본값은 각 동작마다 사용자 확인을 받도록 설정돼 있으며, 사이트별로 접근 권한을 끌 수 있다."
          ],
          "en": [
            "A major browser shipped built-in agent features that need no extension, reading open tabs and carrying out tasks such as filling forms or making reservations.",
            "By default each action requires user confirmation, and access can be disabled per site."
          ]
        },
        "implication": {
          "ko": "에이전트가 브라우저에 들어오면 웹사이트는 사람이 아닌 프로그램을 상대하게 된다. 광고 노출과 세션 기반 과금이 전제해온 것이 사람의 방문이었다는 점에서, 이 변화는 웹의 수익 모델을 건드린다. 사이트별 차단 옵션이 기본 제공된 것도 그 마찰을 예상한 조치로 보인다.",
          "en": "Once agents live in the browser, websites are dealing with programs rather than people. Ad impressions and session-based billing assumed human visits, so this touches the web’s revenue model. Shipping per-site blocking by default looks like anticipation of exactly that friction."
        },
        "terms": [
          "agent"
        ]
      },
      {
        "id": "2026-08-28-04",
        "rank": 4,
        "title": {
          "ko": "의료 문서 자동화 스타트업, 시리즈B 3억 달러",
          "en": "Clinical documentation startup raises $300M Series B"
        },
        "source": "TechCrunch",
        "sourceType": "industry",
        "url": "https://techcrunch.com/category/artificial-intelligence/",
        "publishedAt": "2026-08-27T20:36:00Z",
        "topic": "funding",
        "score": 72,
        "scoreParts": {
          "weight": 0.8,
          "cross": 0.5,
          "fresh": 0.9
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          },
          {
            "source": "MIT Technology Review",
            "url": "https://www.technologyreview.com/topic/artificial-intelligence/"
          }
        ],
        "summary": {
          "ko": [
            "진료 기록 작성을 자동화하는 스타트업이 3억 달러 규모의 시리즈B를 유치했다. 회사는 미국 내 다수 병원 네트워크에 도입돼 있다고 밝혔다.",
            "회사는 의사가 최종 서명하기 전 초안을 검토하는 구조를 유지한다고 설명했다."
          ],
          "en": [
            "A startup automating clinical documentation raised a $300M Series B, saying it is deployed across multiple US hospital networks.",
            "The company said it retains a structure in which physicians review the draft before signing off."
          ]
        },
        "implication": {
          "ko": "의료 AI에서 자금이 진단이 아니라 문서 작업으로 몰리는 흐름이 뚜렷하다. 규제 부담이 낮고 절감 효과를 시간으로 바로 환산할 수 있기 때문이다. 임상 판단에 개입하지 않는 영역이 먼저 열린다는 패턴이 반복된다.",
          "en": "Money in medical AI is clearly flowing to paperwork rather than diagnosis — lighter regulatory burden and savings that convert directly into hours. The pattern repeats: the areas that stay out of clinical judgment open first."
        },
        "terms": []
      },
      {
        "id": "2026-08-28-05",
        "rank": 5,
        "title": {
          "ko": "액침 냉각 도입 데이터센터, PUE 개선치 공개",
          "en": "Immersion-cooled data center publishes PUE gains"
        },
        "source": "Ars Technica",
        "sourceType": "tech",
        "url": "https://arstechnica.com/ai/",
        "publishedAt": "2026-08-27T16:45:00Z",
        "topic": "compute",
        "score": 70,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.5,
          "fresh": 0.74
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          },
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          }
        ],
        "summary": {
          "ko": [
            "액침 냉각을 도입한 데이터센터 운영사가 1년간의 전력사용효율 측정치를 공개했다. 공랭 대비 냉각 전력이 크게 줄었다고 보고했다.",
            "보고서는 초기 설비 투자 회수 기간과 유지보수 절차 변경에 따른 인력 비용도 함께 제시했다."
          ],
          "en": [
            "A data-center operator using immersion cooling published a year of power usage effectiveness measurements, reporting a large drop in cooling power versus air cooling.",
            "The report also gives payback periods on the capital investment and staffing costs from changed maintenance procedures."
          ]
        },
        "implication": {
          "ko": "냉각 효율은 그동안 제조사 주장에 의존해왔는데, 운영사가 1년치 실측을 낸 것은 다른 무게를 갖는다. 전력 요금이 지역 정치 이슈가 된 상황에서 이런 수치는 마케팅이 아니라 인허가 자료가 된다.",
          "en": "Cooling efficiency claims have mostly come from vendors; a year of operator-measured data carries different weight. With power bills now a local political issue, numbers like these function as permitting material rather than marketing."
        },
        "terms": [
          "pue"
        ]
      },
      {
        "id": "2026-08-28-06",
        "rank": 6,
        "title": {
          "ko": "검색 증강 생성 도입 실패 사례 분석",
          "en": "What goes wrong in RAG deployments"
        },
        "source": "VentureBeat",
        "sourceType": "industry",
        "url": "https://venturebeat.com/category/ai/",
        "publishedAt": "2026-08-27T22:16:00Z",
        "topic": "enterprise",
        "score": 65,
        "scoreParts": {
          "weight": 0.8,
          "cross": 0.25,
          "fresh": 0.97
        },
        "crossRefs": [
          {
            "source": "Hacker News",
            "url": "https://news.ycombinator.com/"
          }
        ],
        "summary": {
          "ko": [
            "사내 문서 기반 질의응답 시스템 도입에 실패한 기업들의 공통 원인을 정리한 분석이 나왔다. 모델이나 검색 성능보다 문서 자체의 상태가 주된 원인으로 지목됐다.",
            "오래된 문서와 최신 문서가 함께 검색되면서 상충하는 답변이 나오는 경우, 문서에 접근 권한 구분이 없어 도입 자체가 막힌 경우가 사례로 제시됐다."
          ],
          "en": [
            "An analysis of failed internal document Q&A deployments identifies the state of the documents themselves — not model or retrieval quality — as the dominant cause.",
            "Examples include stale and current documents surfacing together and producing contradictory answers, and deployments blocked outright because documents carried no access-control distinctions."
          ]
        },
        "implication": {
          "ko": "검색 증강 생성은 사내 문서의 상태를 그대로 드러내는 거울이다. 문서 정리가 안 된 조직에서는 도입 프로젝트가 사실상 문서 정리 프로젝트가 되고, 그 비용을 예산에 넣지 않은 곳이 실패한다. 실패 원인이 기술 밖에 있다는 점이 이 분석의 핵심이다.",
          "en": "Retrieval-augmented generation is a mirror held up to the state of a company’s documents. Where they were never organized, the deployment becomes a documentation cleanup project, and the teams that failed are the ones who did not budget for that. The point of the analysis is that the cause sits outside the technology."
        },
        "terms": [
          "rag"
        ]
      },
      {
        "id": "2026-08-28-07",
        "rank": 7,
        "title": {
          "ko": "AI 기본법 시행령 입법예고",
          "en": "Korea posts its AI framework act enforcement decree"
        },
        "source": "ZDNet Korea",
        "sourceType": "domestic",
        "url": "https://zdnet.co.kr/news/?lstcode=0050",
        "publishedAt": "2026-08-27T13:52:00Z",
        "topic": "policy",
        "score": 63,
        "scoreParts": {
          "weight": 0.75,
          "cross": 0.5,
          "fresh": 0.62
        },
        "crossRefs": [
          {
            "source": "전자신문",
            "url": "https://www.etnews.com/"
          },
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          }
        ],
        "summary": {
          "ko": [
            "정부가 AI 기본법 시행령 제정안을 입법예고했다. 고영향 AI의 판단 기준과 사업자의 사전 고지 의무 범위가 주요 내용이다.",
            "제정안은 일정 규모 이하 사업자에 대한 의무 완화 조항도 포함했다. 의견 제출 기간은 40일이다."
          ],
          "en": [
            "The government posted the enforcement decree for Korea’s AI framework act for public comment, centering on criteria for high-impact AI and the scope of advance disclosure duties.",
            "The draft includes relief for operators below a size threshold. The comment period runs 40 days."
          ]
        },
        "implication": {
          "ko": "법이 아니라 시행령에서 실제 적용 범위가 정해진다. 고영향 판단 기준이 넓게 잡히면 규모 완화 조항이 있어도 중소 사업자의 문서화 부담이 커진다. 의견 제출 40일이 실질적으로 영향을 미칠 수 있는 유일한 구간이다.",
          "en": "The decree, not the act, is where the real scope gets set. If the high-impact criteria are drawn broadly, documentation burden lands on smaller operators regardless of the size relief. The 40-day comment window is the only stretch where input actually changes anything."
        },
        "terms": []
      },
      {
        "id": "2026-08-28-08",
        "rank": 8,
        "title": {
          "ko": "국내 반도체사, 고대역폭 메모리 장기 공급 계약",
          "en": "Korean chipmaker signs long-term HBM supply deal"
        },
        "source": "전자신문",
        "sourceType": "domestic",
        "url": "https://www.etnews.com/",
        "publishedAt": "2026-08-27T12:55:00Z",
        "topic": "compute",
        "score": 62,
        "scoreParts": {
          "weight": 0.75,
          "cross": 0.5,
          "fresh": 0.58
        },
        "crossRefs": [
          {
            "source": "ZDNet Korea",
            "url": "https://zdnet.co.kr/news/?lstcode=0050"
          },
          {
            "source": "TechCrunch",
            "url": "https://techcrunch.com/category/artificial-intelligence/"
          }
        ],
        "summary": {
          "ko": [
            "국내 반도체 기업이 해외 가속기 제조사와 고대역폭 메모리 장기 공급 계약을 체결했다. 계약 기간은 복수 연도이며 물량이 사전 확정된 형태다.",
            "회사는 해당 물량에 대응하기 위한 증설 계획도 함께 밝혔다."
          ],
          "en": [
            "A Korean chipmaker signed a multi-year, volume-committed supply agreement for high-bandwidth memory with an overseas accelerator manufacturer.",
            "The company also announced capacity expansion to serve the committed volume."
          ]
        },
        "implication": {
          "ko": "가속기 제조사가 물량을 미리 묶는다는 것은 메모리가 병목이라는 사실을 계약으로 인정한 것이다. 장기 계약은 공급 안정을 주는 대신 가격 협상력을 넘기는 거래이기도 하다. 오늘 추론 칩 스타트업이 자금을 메모리 확보에 쓰겠다고 한 것과 같은 그림이다.",
          "en": "An accelerator maker locking volume in advance is a contractual admission that memory is the bottleneck. Long-term deals buy supply stability at the price of negotiating leverage. It is the same picture as the inference-chip startup spending its round on memory supply."
        },
        "terms": [
          "hbm"
        ]
      },
      {
        "id": "2026-08-28-09",
        "rank": 9,
        "title": {
          "ko": "대학 과제 평가 방식 변경 확산",
          "en": "Universities keep rewriting how they grade"
        },
        "source": "MIT Technology Review",
        "sourceType": "tech",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
        "publishedAt": "2026-08-27T13:24:00Z",
        "topic": "society",
        "score": 58,
        "scoreParts": {
          "weight": 0.85,
          "cross": 0.25,
          "fresh": 0.6
        },
        "crossRefs": [
          {
            "source": "The Verge",
            "url": "https://www.theverge.com/ai-artificial-intelligence"
          }
        ],
        "summary": {
          "ko": [
            "여러 대학이 제출물 중심 평가에서 구술 발표와 과정 기록 중심 평가로 전환하고 있다는 조사가 나왔다. AI 사용 탐지 도구의 신뢰도가 낮다는 판단이 배경으로 제시됐다.",
            "조사는 전환에 따른 교원 업무량 증가도 함께 보고했다."
          ],
          "en": [
            "A survey finds universities shifting from submission-based grading toward oral defenses and process records, citing low confidence in AI detection tools.",
            "The survey also reports the added faculty workload the shift creates."
          ]
        },
        "implication": {
          "ko": "탐지를 포기하고 평가 방식을 바꾸는 쪽이 현실적인 대응으로 자리잡고 있다. 탐지 도구는 오탐이 학생에게 치명적이라는 점에서 애초에 성립하기 어려운 접근이었다. 다만 구술 평가는 교원 시간을 직접 소모하므로, 대형 강의에서는 같은 방식이 통하지 않는다.",
          "en": "Giving up on detection and changing the assessment is settling in as the practical response. Detection was always shaky given how damaging a false positive is to a student. But oral assessment consumes faculty time directly, so the same approach does not transfer to large lecture courses."
        },
        "terms": []
      },
      {
        "id": "2026-08-28-10",
        "rank": 10,
        "title": {
          "ko": "단일 GPU 미세조정 도구, 커뮤니티 상위 진입",
          "en": "Single-GPU fine-tuning tool tops the community feed"
        },
        "source": "Hacker News",
        "sourceType": "community",
        "url": "https://news.ycombinator.com/",
        "publishedAt": "2026-08-27T19:09:00Z",
        "topic": "opensource",
        "score": 54,
        "scoreParts": {
          "weight": 0.6,
          "cross": 0.25,
          "fresh": 0.84
        },
        "crossRefs": [
          {
            "source": "VentureBeat",
            "url": "https://venturebeat.com/category/ai/"
          }
        ],
        "summary": {
          "ko": [
            "단일 GPU에서 중형 모델을 미세조정할 수 있게 하는 오픈소스 도구가 커뮤니티 상위에 올랐다. 메모리 사용량을 줄이는 여러 기법을 기본값으로 묶어 설정 부담을 줄인 것이 특징이다.",
            "토론에서는 미세조정보다 프롬프트 조정이나 검색 연결로 충분한 경우가 많다는 반론이 함께 나왔다."
          ],
          "en": [
            "An open-source tool for fine-tuning mid-sized models on a single GPU reached the top of the community feed, bundling several memory-reduction techniques as defaults to cut configuration work.",
            "Commenters countered that prompting or retrieval is often sufficient without fine-tuning at all."
          ]
        },
        "implication": {
          "ko": "미세조정의 진입 장벽이 낮아지는 것과 미세조정이 필요한 경우가 늘어나는 것은 다른 문제다. 토론의 반론이 타당한 지점이 있는데, 대부분의 실무 과제는 모델을 바꾸기보다 맥락을 제대로 넣는 것으로 해결된다. 다만 도구가 쉬워지면 판단 없이 먼저 시도하는 경우도 함께 늘어난다.",
          "en": "Lowering the barrier to fine-tuning is not the same as more cases needing it. The counterargument has merit: most practical tasks are solved by supplying the right context rather than changing the model. Easier tooling does tend to increase the number of people who try it before asking whether they should."
        },
        "terms": [
          "fine-tuning",
          "rag"
        ]
      }
    ]
  }
];
