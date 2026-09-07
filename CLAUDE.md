# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 먼저 읽을 것

`SPEC.md` 가 이 저장소의 단일 출처다. **코드를 고치기 전에 SPEC 을 읽는다.** 특히 6.2(점수식)·7절(데이터 계약)·8절(제약)이 구조를 결정한다.

SPEC 에 적힌 숫자를 코드에서 바꾸려면 **SPEC 을 먼저 고치고 테스트를 함께 고친다.** 반대 순서는 명세와 구현이 조용히 갈라지는 길이다.

문서·주석·커밋 메시지는 한국어로 쓴다. 코드 주석은 "무엇을"이 아니라 **"왜 이렇게 했는가"**를 적는다 — 기존 주석 대부분이 실측에서 드러난 함정의 기록이다.

## 명령

```bash
npm test                              # 검증 스위트 · 오프라인 · 몇 초
npm run healthcheck                   # 12개 피드 생사 확인. fail 있으면 종료 코드 1
npm run collect                       # Phase 2 수집 (LLM 없음)
npm run summarize                     # Phase 3 요약 생성 (LLM 사용)
npm run brief                         # collect → summarize
npm run mail                          # Phase 5a 브리핑 전문을 메일로 (.env 필요)
npm run mail:dry                      # 보내지 않고 runs/<date>/mail.html 로 렌더만
npm run serve                         # python -m http.server 8000
```

개발 흐름은 **`--save-raw` 로 받아 두고 `--from` 으로 재실행**하는 것이다. Phase 2 에 LLM 이 없어 같은 입력이면 같은 후보가 나오므로, 남의 서버를 두드리지 않고 클러스터·점수 로직을 몇 번이든 고쳐 볼 수 있다.

```bash
node scripts/collect.mjs --date 2026-09-01
node scripts/collect.mjs --save-raw                    # 원본 XML·HTML 보존
node scripts/collect.mjs --from runs/2026-09-01/raw    # 네트워크 없이 재실행
node scripts/collect.mjs --dry-run                     # 5단계(원문 확보) 생략
node scripts/summarize.mjs --dry-run                   # 호출 없이 프롬프트·스키마만
node scripts/summarize.mjs --limit 1                   # 앞 1건만 (비용 확인)
node scripts/summarize.mjs --provider api              # 기본은 cli(구독)
```

결과를 볼 곳은 `runs/<date>/report.txt` 다. 퍼널, 확정 후보, 매체별 추출 성공률, 무엇이 왜 묶였고 왜 빠졌는지가 사람이 읽는 형태로 들어 있다.

### 테스트 한 개만 돌리기

`scripts/test/run.mjs` 에 스위트 선택 플래그가 없다. 각 스위트는 `name` 과 `run(t)` 를 export 하므로 직접 부른다 — `t(label, cond, detail)` 시그니처다.

```bash
node -e "import('./scripts/test/score.test.mjs').then(m=>{console.log(m.name);m.run((l,c,d)=>console.log(c?'o':'X',l,d||''))})"
```

## 아키텍처

### 세 구간과 그 경계

```
Phase 2  scripts/collect.mjs      12개 피드 → 후보 10건 + 퍼널
         의존성 0개 · LLM 없음 · 결정적
              ↓ runs/<date>/candidates.json   (git 제외 — 기사 원문 포함)
Phase 3  scripts/summarize.mjs    후보 → 한/영 요약·시사점·인사이트
         여기서만 LLM 을 쓴다
              ↓ data/briefs.js · data/glossary.js
사이트    *.html + assets/js/*.js  100% 정적 · 라이브러리 0개
Phase 5a scripts/mail.mjs         같은 briefs.js 를 읽어 한국어 전문 메일 한 통
         lib/letter.mjs(렌더) + lib/smtp.mjs(전송) 로 갈린다
```

**이 경계가 이 저장소의 설계 그 자체다.** Phase 2 에 LLM 이 없기 때문에 "잘못 골랐다"와 "잘못 요약했다"를 따로 디버깅할 수 있다. 경계를 넘나드는 변경(예: 수집 단계에서 LLM 으로 관련성 판정)은 이 성질을 깬다.

`scripts/lib/*.mjs` 의 파일 이름이 곧 SPEC 6.3 파이프라인의 단계 이름이다. 단계 로직은 해당 파일에만 둔다.

### `data/*.js` 가 계약면이다

JSON 이 아니라 `window.SAB` 에 대입하는 `.js` 인 이유는 `file://` 에서 열려야 하기 때문이다 — `fetch()` 는 `file://` 에서 CORS 로 막힌다.

사이트와 파이프라인이 **같은 파일을 읽는다.** Node 쪽은 `scripts/lib/meta.mjs` 가 `node:vm` 으로 `window = 자기 자신`인 컨텍스트를 만들어 그대로 실행한다(`loadMeta` / `loadBriefs` / `loadGlossary`). 그래서 형식이 어긋날 수 없다.

`data/briefs.js` 와 `data/glossary.js` 는 **생성물이다. 손으로 고치지 않는다** — 다음 실행에서 덮어쓴다. `data/meta.js` 는 손으로 고치는 유일한 데이터 파일이며, 피드·주제·출처 가중치의 단일 출처다(`healthcheck.mjs` 도 이걸 읽는다).

### 발행 언어는 `site.languages` 하나로 갈린다

`data/meta.js` 의 `site.languages` 가 발행 언어다. **사이트와 파이프라인이 같은 값을 읽는다** — SPEC 5절.

**지금은 `['ko']` 다** (2026-09-03, 토큰 절약). 영어를 되살리려면 `'en'` 을 다시 넣으면 되고, 주석 처리해 둔 코드는 없다.

이 값 하나가 네 곳을 함께 지나간다. **한 곳만 고치면 조용히 갈라진다.**

- `lib/prompt.mjs` — 영어 지시문과 `en` 스키마가 빠진다. 절약은 **만들지 않는 것**이지 만들고 버리는 것이 아니다
- `lib/validate.mjs` — `ctx.langs` 로 받는다. **넘기지 않으면 한/영 둘 다를 요구한다** — 게이트의 기본값은 엄한 쪽이어야 한다
- `lib/publish.mjs` 의 `keepLangs` — cli 경로는 스키마를 강제할 수 없어 영어가 딸려 오는 날이 있다. 발행 직전에 잘라 낸다
- `assets/js/app.js` — EN 버튼은 **지우지 않는다.** 눌리게 두고 토스트로 이유를 말하며, `?lang=en` 으로 들어와도 한국어판을 준다

이미 발행된 영어는 지우지 않는다. 스위치는 앞으로 만들 것만 정한다.

### 시각은 `lib/time.mjs` 한 곳에서만 나온다

날짜 T 의 브리핑은 **T 08:00 KST** 를 기준시각(anchor)으로 삼고 그 직전 24시간을 본다. `anchorFor('2026-08-31')` → `2026-08-30T23:00:00Z`.

시간 필터가 쓰는 창과 점수식이 쓰는 신선도가 **반드시 같은 anchor 에서 나와야 한다.** 이 둘이 어긋나 샘플 데이터 9건의 점수가 틀린 적이 있다. 어느 쪽이든 시각을 따로 계산하지 않는다.

`defaultDate()` 는 **이미 닫힌 창만** 겨냥한다(08시 전이면 어제치). 그래서 같은 날 몇 번을 돌려도 결과가 같다. 자동 발행이 07:40 이 아니라 08:00 에 도는 이유가 이것이다.

### 점수는 재현되어야 한다 (P2)

```
score = round((0.40 × weight + 0.35 × cross + 0.25 × fresh) × 100)
```

`scoreParts` 를 그대로 실어 보내므로 데이터 페이지가 점수를 재계산할 수 있다. 저장값에서 다시 계산해 같은 수가 나와야 하므로 **`fresh` 를 먼저 소수 둘째 자리로 반올림한 뒤** 점수를 낸다. `lib/score.mjs` 의 `EPS` 는 `0.774999…` 가 78 이 아니라 77 로 떨어지는 것을 막는 보정이다 — 지우지 않는다.

`collect.mjs` 는 마지막에 `verify()` 로 대조하고 불일치가 있으면 종료 코드 1 을 낸다.

### 발행 게이트 — 프롬프트는 부탁이고 검증기가 규칙이다

발행 전 사람 검토가 없다(자동 발행 + 사후 정정). 그래서 `lib/validate.mjs` 가 유일한 게이트다.

- `lib/prompt.mjs` — 편집 지침과 출력 스키마. 여기 적힌 **글이 곧 편집 지침**이다
- `lib/validate.mjs` — SPEC 5·7절의 숫자를 그대로 적어 둔 검사기

규격을 어긴 기사는 무엇이 틀렸는지 붙여 다시 만들고(최대 `MAX_ATTEMPTS = 3`), 그래도 어기면 **그 기사를 빼고** 발행하며 사유를 `note` 와 `report.txt` 에 남긴다. 자리를 채우려 규격을 낮추지 않는다. **인사이트가 끝내 실패하면 그날은 발행하지 않는다.**

`sentenceCount()` 는 영어 약어(`Aug.`, `U.S.`, `Co.`)를 문장 끝으로 세지 않는다. 세는 방식이 틀리면 규격이 아니라 검사기가 문제다 — 실제로 이것 때문에 멀쩡한 기사 3건이 빠진 적이 있다.

### LLM 경로 두 가지 — 같은 모양, 같은 게이트

| | 파일 | 인증 | 비고 |
|---|---|---|---|
| **기본** | `lib/claude-code.mjs` | `claude -p` · 로그인된 구독 | API 크레딧을 쓰지 않는다. 출력 금액은 **청구액이 아니라 API 정가 환산값** |
| 선택 | `lib/claude.mjs` | `ANTHROPIC_API_KEY` (env 또는 `.env`) | `--provider api`. JSON 스키마를 API 가 강제 |

두 경로는 `askJson` 과 같은 모양으로 답하므로 `summarize.mjs` 는 어느 쪽인지 몰라도 된다. **경로를 바꾸는 것이 규격을 바꾸지 않는다** — 검증 게이트는 양쪽 모두 같다.

cli 경로는 스키마를 강제할 수 없어 형식 규칙을 글로 넣는데, 그 규칙은 **입력의 맨 끝**에 온다(마지막에 읽는 말이 이긴다). 프롬프트는 전부 stdin 으로 넣는다 — Windows 에서 `claude` 는 `.cmd` 라 `shell:true` 로 띄워야 하고, 그러면 긴 인자가 이스케이프 없이 이어붙기 때문이다.

### 사이트 — 전역 하나, 페이지당 한 줄

라이브러리 0개, 빌드 도구 0개, 트랜스파일 없음. IIFE + `var` 로 쓰는 기존 스타일을 따른다.

- `assets/js/app.js` — 공통 셸. 언어·테마 상태, `I18N` UI 문자열, 헤더/푸터, 포맷터, 데이터 조회. 공개 API 는 `SAB.app`
- `assets/js/pages.js` — 페이지별 렌더러. `SAB.pages.*`
- 각 HTML 은 **마지막 줄에서 `SAB.page = SAB.pages.<이름>` 을 지정한다.** 그게 그 페이지가 하는 일의 전부다

한/영은 페이지를 복제하지 않는다. UI 문자열은 `app.js` 의 `I18N`, 콘텐츠는 데이터의 `{ko, en}` 쌍, HTML 에 직접 쓴 글은 `data-lang="ko|en"` 속성으로 갈린다. `?lang=en` 이 영어판 고유 주소다.

매체별·주제별 집계는 저장하지 않고 화면에서 계산한다. 따로 갱신할 것이 없다.

## 어기면 안 되는 것

### 데이터 계약 (SPEC 7절)

- `date` 는 브리핑의 고유 키. 한 날짜에 두 개는 없다
- `articles[].id` 는 `<date>-<rank 2자리>`. **발행 후 바꾸지 않는다**
- 발행된 브리핑은 **삭제하지 않는다.** 오류는 그 날짜를 고치고 수정 사실을 남긴다
- 사용자에게 보이는 **모든** 문자열은 `{ko, en}` 쌍을 갖는다. 한쪽만 있으면 안 된다
- `topic` 은 `data/meta.js` 의 `topics[].id` 중 하나, `terms` 는 `data/glossary.js` 의 `id` 를 가리킨다

### 선정 원칙 (SPEC 3절)

- **P1** 요약(사실)과 시사점(판단)을 다른 필드로 받는다. 요약에 추측 표현이 들어가면 검증기가 잡는다
- **P2** 선정 과정을 숫자로 공개한다 — 퍼널과 `scoreParts`
- **P3** 원문을 못 읽은 기사는 싣지 않는다. **자리를 채우려 RSS 요약만 보고 쓰지 않는다**
- **P4** 한 출처 최대 3건, 공식 발표 최소 2자리 (`lib/select.mjs`)
- **P5** 같은 링크를 두 번 싣지 않는다 (`lib/normalize.mjs` 의 URL 정규화가 판정 기준)

### 수집 예절 (SPEC 8절)

- UA 로 자신을 밝힌다 (`SarahsAIBrief/1.0`)
- `robots.txt` 를 지킨다 — 최장 일치, 와일드카드 `*` 와 `$` 앵커, 우리 UA 그룹이 `*` 보다 우선
- 호스트당 최소 1.5초, 전체 동시 4건
- **4xx 는 재시도하지 않는다.** 5xx 와 연결 예외만 백오프를 두고 3회까지
- **403·429 를 우회하지 않는다.** 막아 둔 것을 뚫는 것은 이 사이트가 할 일이 아니다. P3 대로 건수 감소로 처리한다
- 받아 온 본문은 커밋하지 않는다 (`runs/` 는 gitignore)

`robots.txt` 해석은 대충 하면 안 된다. 초기 구현이 `Disallow: */trackback/` 의 `*` 앞을 잘라 빈 접두사로 써서 세 매체가 통째로 차단됐고, 추출 성공률이 56% 로 찍혔다. 고친 뒤 83%.

### 기술 제약 (SPEC 8절)

- 빌드 도구 없음, 사이트 코드에 **라이브러리 0개**(차트 포함 전부 자체 구현). 이 제약은 서버 코드에는 적용되지 않는다 — Phase 3 은 `@anthropic-ai/sdk` 하나를 쓴다
- `file://` 에서 동작해야 한다
- 추적 스크립트·광고 픽셀·제휴 링크를 넣지 않는다
- 서버는 페이지를 렌더링하지 않고, 방문자 요청마다 아무것도 하지 않는다. 수집·요약은 **하루 한 번 미리** 도는 작업이다

## 테스트

`scripts/test/` 가 검사하는 것은 구현 세부가 아니라 **SPEC 이 약속한 규칙**이다.

| 스위트 | 지키는 것 |
|---|---|
| `score.test.mjs` | 6.2 점수식과 기준시각 |
| `robots.test.mjs` | 8절 수집 예절 |
| `cluster.test.mjs` | 6.3 4단계 — 한↔영 교차 보도, 대표 선정 |
| `select.test.mjs` | P4 출처 상한·공식 2자리, P3 미달 시 그대로 발행 |
| `candidates.test.mjs` | 산출물의 P3·P4·P5·퍼널 규칙 |
| `summarize.test.mjs` | 5절 콘텐츠 규격과 7절 데이터 계약 — **막아야 할 것을 실제로 막는지** |
| 〃 (같은 파일) | 5절 언어 스위치 — 끈 언어는 보지 않되 켠 언어 규격은 그대로, `langs` 를 빼면 한/영 둘 다 요구 |
| `env.test.mjs` | `.env` 해석 — BOM·CRLF·주석·값 안의 `=` |
| `mail.test.mjs` | 5절 발송 규격 — 한국어만·전문 포함·Gmail 이 지우는 것 금지·크기 상한 |

두 가지 규율이 있다.

- **SPEC 의 숫자를 테스트에 그대로 적고 `lib/` 에서 import 하지 않는다.** 상수를 import 하면 상수를 바꾸는 순간 테스트가 따라 움직여 명세 위반을 못 잡는다
- **네트워크를 쓰는 검사를 넣지 않는다.** 상대 서버 사정으로 실패하는 테스트는 아무도 믿지 않게 된다. 실제 피드 상태는 `npm run healthcheck` 로 따로 본다

## 함정

**`scripts/daily.ps1` 은 UTF-8 BOM 으로 저장해야 한다.** PowerShell 5.1 은 BOM 이 없으면 시스템 코드페이지로 읽어 한글이 깨지고 구문 오류가 난다.

**PowerShell 에서 네이티브 실행 파일에 `2>&1` 을 쓰지 않는다.** stderr 한 줄마다 ErrorRecord 가 만들어지고 `ErrorActionPreference = Stop` 이면 거기서 죽는다. `collect.mjs` 는 진행 상황을 전부 stderr 로 내므로 첫 줄에서 끝난 적이 있다. 리다이렉션은 `cmd /c` 에 맡기고 성공 여부는 종료 코드로만 판단한다.

**메일 인코딩은 base64 로 못박는다.** 한글은 quoted-printable 로 3배(3바이트 → `=XX`×3), base64 로 4/3 배 부푼다. nodemailer 가 짧은 쪽을 고르긴 하지만 자동 판정에 기대지 않는다 — 한 번 어긋나면 Gmail 이 102KB 에서 본문을 잘라내는데 그 사실이 메일에는 보이지 않는다. 그래서 `mail.mjs` 가 매번 크기를 재어 로그에 남긴다.

**PowerShell 함수의 반환값을 쓰지 않는다.** `Say` 가 `Write-Output` 을 쓰므로 로그 한 줄이 반환값 스트림에 딸려 나온다. `Run` 을 `return $true/$false` 로 바꾸면 호출자가 `@('...수집 완료', $true)` 배열을 받는다. 상태는 전부 `$script:` 변수로 주고받는다.

**`daily.ps1` 의 종료 코드는 발행 결과다.** 메일은 부가 단계이고 그 실패가 발행의 성패를 뒤엎지 않는다. 발행 결과를 `$script:exitCode` 에 미리 담아 두고 맨 끝에서 그 값으로 나간다 — 메일이 `$LASTEXITCODE` 를 덮어쓰기 때문이다.

**`runs/` 는 커밋하지 않는다** — 기사 본문 전문이 들어 있다(SPEC 11 저작권). 퍼널 숫자만 필요하면 `runs/<date>/funnel.json` 을 따로 복사한다.

**샘플 데이터는 더 이상 없다.** `2026-08-28` ~ `2026-08-31` 네 건과 상단 데모 배너는 2026-09-01 첫 실발행과 함께 지웠다. `SAMPLE_DATES`·`dropSamples`·`--drop-samples` 는 코드와 테스트에 남아 있지만 지금은 아무것도 지우지 않는다.

## 알려진 미해결 문제

SPEC 6.1·6.5 에 기록돼 있다. 새로 발견한 것이 아니다.

- **하루 10건이 안 채워진다** (실측 확정 6건). 후보 부족이 아니라 **매체 다양성**이 병목 — 창 안에 후보를 내는 국내 매체가 두 곳뿐인데 한 출처 최대 3건(P4)이 걸린다
- 수집 시각이 해외 매체 포함 여부를 결정한다
- OpenAI(Cloudflare 403)·VentureBeat(Vercel 429)는 원문을 받을 수 없다. 우회하지 않고 P3 대로 처리한다
