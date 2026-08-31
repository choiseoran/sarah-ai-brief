# Sarah's AI Brief

매일 오전 8시(KST) AI 뉴스 10건을 한국어와 영어로 요약하고, 기사마다 시사점과 하루를 관통하는 인사이트를 붙이는 무료 브리핑 사이트.

제품 규격은 [SPEC.md](SPEC.md)에 있습니다. **코드를 고치기 전에 SPEC을 먼저 읽으세요.** 특히 7절(데이터 계약)과 8절(제약)이 이 저장소의 구조를 결정합니다.

---

## 실행

빌드 도구가 없습니다. 두 가지 방법 모두 됩니다.

```bash
# 1. 그냥 열기 — index.html 을 브라우저로 드래그하거나 더블클릭
# 2. 로컬 서버 (권장, 상대 경로가 실제 배포와 같아짐)
npm run serve          # = python -m http.server 8000
# → http://localhost:8000
```

**사이트 코드에는 라이브러리가 0개입니다** (SPEC 8절). 서버 쪽 의존성은 요약 생성에 쓰는 `@anthropic-ai/sdk` 하나뿐이고, 수집기는 여전히 0개입니다. 사이트만 볼 거라면 `npm install` 없이 그냥 열어도 됩니다.

`file://` 로 열어도 동작하도록 데이터를 JSON이 아니라 `.js` 전역 객체로 둡니다. `fetch()`는 `file://` 에서 CORS로 차단됩니다.

---

## 구조

```
index.html        오늘의 브리핑 (최신 날짜 렌더)
brief.html        날짜별 브리핑  ?d=2026-08-29
archive.html      지난 브리핑 목록
topics.html       주제별          ?t=models
data.html         수집→발행 퍼널, 매체·주제 분포, 용어 누적
glossary.html     용어사전
about.html        소개 (본문은 [data-lang] 로 한/영 모두 들어 있음)
feed.xml          RSS

assets/css/style.css   토큰 → 리셋 → 컴포넌트 순. 차트도 여기서 만든다
assets/js/app.js       언어·테마 상태, 헤더/푸터, 포맷터, 데이터 조회
assets/js/pages.js     페이지별 렌더러 (SAB.pages.*)

data/meta.js      사이트 정보, 12개 피드, 12개 주제, 출처 가중치
data/briefs.js    브리핑 (최신순)
data/glossary.js  용어

scripts/healthcheck.mjs   12개 피드를 두드려 죽은 피드를 드러낸다 (수집 0단계)
scripts/collect.mjs       수집 파이프라인 오케스트레이터 (1~9단계). LLM 없음
scripts/summarize.mjs     요약 생성 오케스트레이터 (Phase 3). 여기서만 LLM 을 쓴다
scripts/lib/*.mjs         단계별 모듈. 파일 이름이 SPEC 6.3 의 단계 이름이다
  ├ claude.mjs            Anthropic SDK 래퍼. 호출 1개, 비용 집계, 에러 분류
  ├ prompt.mjs            시스템 프롬프트와 출력 스키마. 편집 지침이 여기 글로 있다
  ├ validate.mjs          생성 결과 검사. 사람 검토가 없으므로 여기가 유일한 게이트다
  └ publish.mjs           data/briefs.js · glossary.js 쓰기
scripts/data/*.json       엔티티 사전(한↔영 별칭), 어휘(AI 키워드·불용어)
scripts/test/*.test.mjs   검증 스위트. SPEC 이 약속한 규칙을 검사한다
runs/<date>/              수집·생성 산출물. git 제외 — 기사 원문이 들어 있다
```

수집기는 사이트와 완전히 분리돼 있다. `data/meta.js` 를 단일 출처로 읽을 뿐,
사이트 코드를 고치지 않는다. 여기까지는 의존성이 0개이고 LLM 도 없다 —
같은 입력 XML 이면 언제나 같은 후보가 나온다.

```bash
npm run healthcheck                   # 피드 12개 생사 확인. fail 있으면 종료 코드 1
npm run collect                       # 이미 지나간 마지막 발행분을 겨냥해 수집
node scripts/collect.mjs --date 2026-09-01
node scripts/collect.mjs --dry-run    # 원문 확보 생략, 후보 목록만
node scripts/collect.mjs --save-raw   # 원본 XML·HTML 보존
node scripts/collect.mjs --from runs/2026-09-01/raw   # 네트워크 없이 재실행
```

`--save-raw` 로 받아 두고 `--from` 으로 다시 돌리는 것이 개발의 기본 흐름이다.
같은 입력에서 같은 후보가 나오므로(Phase 2에 LLM이 없다) 클러스터·점수 로직을
남의 서버를 두드리지 않고 몇 번이든 고쳐 볼 수 있다.

결과를 볼 곳은 `runs/<date>/report.txt` 다. 퍼널, 확정 후보, 매체별 추출
성공률, 무엇이 왜 묶였는지, 무엇이 왜 제외됐는지가 사람이 읽는 형태로 들어 있다.

---

## 요약 생성 (Phase 3)

후보에서 한/영 요약·시사점·인사이트를 만들어 `data/briefs.js` 를 생성합니다.
기사 1건당 호출 1회 + 인사이트 1회입니다.

```bash
npm run summarize                                     # 이미 지나간 마지막 발행분
node scripts/summarize.mjs --date 2026-09-01
node scripts/summarize.mjs --dry-run                  # 호출 없이 프롬프트·스키마만
node scripts/summarize.mjs --limit 1                  # 앞의 1건만 (확인용)
node scripts/summarize.mjs --drop-samples             # 샘플 4일치를 지우고 실데이터만
npm run brief                                         # 수집 → 요약을 한 번에
```

### 두 가지 경로

| | 경로 | 인증 | 언제 |
|---|---|---|---|
| **기본** | `claude -p` (Claude Code CLI) | `claude auth login` 으로 이미 로그인된 구독 | **API 크레딧을 쓰지 않습니다.** 별도 준비가 없습니다 |
| 선택 | Anthropic API | `ANTHROPIC_API_KEY` (환경변수 또는 `.env`) | `--provider api`. JSON 스키마를 API가 강제해 형식 오류가 덜 납니다 |

```bash
node scripts/summarize.mjs --provider api             # API 키로
node scripts/summarize.mjs --model sonnet             # cli 경로의 모델 별칭
```

기본 모델은 `opus`(cli) / `claude-opus-5`(api) 입니다. cli 경로는 구독으로 돌기 때문에
출력에 찍히는 금액은 **청구액이 아니라 API 정가 환산값**입니다.

두 경로의 결과 형식은 같고, 아래 검증도 똑같이 통과해야 발행됩니다.
경로를 바꾸는 것이 규격을 바꾸지 않습니다.

**발행 전 사람 검토를 두지 않습니다.** 대신 `lib/validate.mjs` 가 규격을 검사하고,
어긴 기사는 무엇이 틀렸는지 붙여 다시 만듭니다(최대 두 번). 그래도 어기면 **그 기사를 빼고**
발행하고 그 사실을 브리핑 상단(`note`)과 `runs/<date>/report.txt` 에 남깁니다.
인사이트가 끝내 실패하면 그날은 발행하지 않습니다.

생성 결과는 발행 여부와 관계없이 `runs/<date>/brief.json` 에 남습니다.

---

## 검증

```bash
npm test        # 125개 · 오프라인 · 몇 초
```

검사하는 것은 구현 세부가 아니라 **SPEC 이 약속한 규칙**입니다.

| 스위트 | 지키는 것 |
|---|---|
| `score.test.mjs` | 6.2 점수식과 기준시각. 기대값을 숫자로 못박습니다 |
| `robots.test.mjs` | 8절 수집 예절. 와일드카드·`$` 앵커·UA 그룹 우선순위 |
| `cluster.test.mjs` | 6.3 4단계. 한↔영 교차 보도, 대표 선정, 교차 보도 집계 |
| `select.test.mjs` | P4 출처 상한과 공식 2자리 보장, P3 미달 시 그대로 발행 |
| `candidates.test.mjs` | 산출물이 P3·P4·P5·퍼널 규칙을 지키는지. 픽스처 + 실제 최신 결과 |
| `summarize.test.mjs` | 5절 콘텐츠 규격과 7절 데이터 계약. **막아야 할 것을 실제로 막는지**를 본다 |

**SPEC 의 숫자는 테스트에 그대로 적혀 있고 `lib/` 에서 가져오지 않습니다.** 상수를 import 하면
상수를 바꾸는 순간 테스트도 따라 움직여 명세 위반을 못 잡습니다. 이 값들을 바꾸려면
SPEC 을 먼저 고치고 테스트를 함께 고치는 것이 맞습니다.

네트워크를 쓰는 검사는 넣지 않았습니다 — 상대 서버 사정으로 실패하는 테스트는
아무도 믿지 않게 됩니다. 실제 피드 상태는 `npm run healthcheck` 로 따로 봅니다.

각 HTML은 마지막 줄에서 `SAB.page = SAB.pages.<이름>` 을 지정합니다. 그게 그 페이지가 하는 일의 전부입니다.

---

## 샘플 데이터

저장소에 처음부터 들어 있던 `2026-08-28` ~ `2026-08-31` 네 건은 **구조 확인용 예시이며 실제 보도된 내용이 아닙니다.** 화면 상단에 그 사실을 알리는 배너가 뜹니다. 출처 링크는 가짜 기사 URL 대신 각 매체 홈으로 연결됩니다.

`node scripts/summarize.mjs --drop-samples` 로 한 번에 지울 수 있습니다. 배너까지 없애려면 `assets/js/app.js` 의 `renderBanner` 호출부와 각 HTML의 `<div id="demo-banner">` 를 지웁니다 — 사이트 코드를 건드리는 유일한 지점입니다.

`data/meta.js` 의 12개 피드 주소는 실제 주소입니다(2026-08-31 기준 응답 확인).

---

## 데이터 형식

`data/briefs.js` 와 `data/glossary.js` 는 `scripts/summarize.mjs` 가 생성합니다. **손으로 고치지 마세요** — 다음 실행에서 덮어씁니다. 형식만 알아 두면 됩니다.

지켜야 할 것 (SPEC 7절, `lib/validate.mjs` 가 발행 직전에 전부 검사합니다):

- `date` 는 브리핑의 고유 키. 한 날짜에 두 개는 없습니다.
- `articles[].id` 는 `<date>-<rank 2자리>`. 발행 후 바꾸지 않습니다.
- 사용자에게 보이는 모든 문자열은 `{ko, en}` 쌍을 갖습니다. 한쪽만 있으면 안 됩니다.
- `topic` 은 `data/meta.js` 의 `topics[].id` 중 하나여야 합니다.
- `terms` 는 `data/glossary.js` 의 `id` 를 가리켜야 합니다.
- `score` = `round((0.40×weight + 0.35×cross + 0.25×fresh) × 100)`

매체별·주제별 집계와 통계는 저장하지 않고 화면에서 계산합니다. 따로 갱신할 것이 없습니다.

---

## 한/영 전환

페이지를 복제하지 않습니다. 하나의 데이터에서 두 언어를 렌더합니다.

- UI 문자열: `assets/js/app.js` 의 `I18N`
- 콘텐츠: 데이터의 `{ko, en}` 쌍
- 소개 페이지 본문처럼 HTML에 직접 쓴 글: `data-lang="ko"` / `data-lang="en"` 을 붙이면 현재 언어일 때만 보입니다.

`?lang=en` 으로 영어판 고유 주소가 생깁니다. 선택은 `localStorage` 에 저장하되, 저장이 막힌 브라우저에서도 동작합니다.

---

## 배포 (GitHub Pages)

저장소 Settings → Pages → Source 를 `main` 브랜치 루트로 지정하면 끝입니다. 빌드 단계가 없습니다.

배포 전에 `feed.xml` 의 도메인을 실제 주소로 바꾸세요.

---

## 다음 단계

SPEC 10절 로드맵 기준으로 Phase 1(사이트)·2(수집)·3(요약)이 끝난 상태입니다.

| Phase | 할 일 |
|---|---|
| ~~2~~ | ~~Node 수집 스크립트~~ — 완료. `runs/<date>/candidates.json` 생성 |
| ~~3~~ | ~~Claude API 로 한/영 요약·시사점·인사이트 생성~~ — 완료. `data/briefs.js` 생성 |
| 4 | 스케줄러가 매일 07:40 KST 실행, 08:00 배포 |
| 5 | 구독 접수 API + 이메일 발송 (구독 폼의 `TODO(Phase 5)` 주석 참조) |

### 아직 남은 문제

전부 실측에서 드러난 것이고 SPEC 6.1·6.5 에 기록돼 있습니다.

- **하루 10건이 안 채워집니다.** 전자신문을 AI 섹션 피드(`rss.etnews.com/04.xml`)로 바꿔 후보 풀은 15건 → 32건이 됐지만, 확정은 6건에 머뭅니다. 창 안에 후보를 내는 매체가 국내 두 곳뿐이고 **한 출처 최대 3건**(P4)이 걸리기 때문입니다. 건수가 아니라 매체 다양성이 병목입니다.
- **수집 시각이 해외 매체를 결정합니다.** 오후에 수집하면 미국 매체의 그날치가 아직 없습니다. Phase 4 에서 07:40 KST(=22:40Z)에 돌리면 달라집니다.
- **ZDNet Korea 는 섹션 피드가 없습니다.** feedburner 전체 피드 하나뿐이고 보존 폭이 4.1시간입니다.
- **봇 차단** — OpenAI(Cloudflare 403)와 VentureBeat(Vercel 429)는 원문을 받을 수 없습니다. 우회하지 않고 P3 대로 건수 감소로 처리합니다.

10건을 실제로 채우려면 수집을 하루 여러 번 돌려 항목을 누적하는 방식(SPEC 6.1 옵션 1)이 필요합니다. 아직 하지 않았습니다.

수집·요약은 **하루 한 번 미리** 도는 작업입니다. 방문자 요청 때마다 돌리지 않습니다. 이유는 SPEC 8절 '아키텍처 경계'에 있습니다.
