# Sarah's AI Brief — 매일 한 번 도는 자동 발행 (SPEC 10절 Phase 4·5a)
#
# 수집 → 요약 → 커밋 → 푸시 → 메일. 사람이 개입하지 않는다.
# Windows 작업 스케줄러가 이 파일을 부른다. 등록·해제 명령은 README 에 있다.
#
# 시각에 대하여 — 날짜 T 의 브리핑은 T 08:00 KST 기준시각 직전 24시간을 본다(SPEC 6.2).
# 수집기는 이미 닫힌 창만 겨냥하므로 08:00 **이후**에 시작해야 그날 창을 볼 수 있다.
# 그래서 08:00 에 시작하고 생성에 걸리는 몇 분만큼 늦게 반영된다.
#
# 실패해도 사이트는 살아 있다. 그날 브리핑이 늦어질 뿐이다(SPEC 8절 아키텍처 경계).
#
# PowerShell 5.1 의 함정 세 가지를 피해 간다. 전부 실측으로 걸렸다.
#   1. 이 파일은 **UTF-8 BOM** 으로 저장해야 한다. BOM 이 없으면 시스템 코드페이지로
#      읽혀 한글이 깨지고 구문 오류가 난다.
#   2. 네이티브 실행 파일에 `2>&1` 을 쓰면 stderr 한 줄마다 ErrorRecord 가 만들어지고,
#      ErrorActionPreference 가 Stop 이면 거기서 스크립트가 죽는다. collect.mjs 는
#      진행 상황을 전부 stderr 로 내므로 첫 줄에서 끝났다. 그래서 리다이렉션은
#      cmd 에 맡기고, 성공 여부는 종료 코드로만 판단한다.
#   3. **함수의 반환값을 쓰지 않는다.** Say 가 Write-Output 을 쓰므로 로그 한 줄이
#      반환값 스트림에 딸려 나온다. Run 을 $true/$false 로 바꾸면 호출자가 로그 문자열까지
#      배열로 받는다. 상태는 전부 $script: 변수로만 주고받는다.
#
# 종료 지점을 한 곳으로 모은 이유 — 성공이든 실패든 메일 한 통을 보내야 하는데 exit 가
# 여섯 군데에 흩어져 있으면 그 자리마다 발송을 복사하게 된다. 발행 본체는 return 으로만
# 빠져나오고, 메일과 exit 는 파일 끝에서 한 번만 한다.

$ErrorActionPreference = 'Continue'

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$logDir = Join-Path $repo 'runs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$log = Join-Path $logDir 'daily.log'

# 발행 결과를 미리 담아 둔다. 뒤에 오는 메일 발송이 $LASTEXITCODE 를 덮어써도
# 스케줄러가 보는 결과는 여기 담긴 값 그대로여야 한다.
$script:exitCode = 0
$script:failStep = $null   # ASCII 토큰. 한국어 라벨은 mail.mjs 가 붙인다
$script:failCode = 0

# 자격 증명 프롬프트가 뜨면 push 가 매달리고 메일까지 못 나간다. 빨리 실패하게 둔다.
$env:GIT_TERMINAL_PROMPT = '0'

function Say($msg) {
  $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Write-Output $line
  Add-Content -Path $log -Value $line -Encoding utf8
}

# 네이티브 명령은 cmd 를 거쳐 부른다. 리다이렉션을 OS 가 처리하므로
# stderr 가 PowerShell 의 에러 스트림으로 올라오지 않는다.
function Run($label, $step, $cmdline) {
  Say "$label 시작"
  & cmd /c "$cmdline >> ""$log"" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    $script:failStep = $step
    $script:failCode = $LASTEXITCODE
    Say "$label 실패 (종료 코드 $LASTEXITCODE). 발행하지 않는다"
    return
  }
  Say "$label 완료"
}

function Invoke-Publish {
  # 1~9단계 수집. 여기까지는 LLM 이 없고 같은 입력이면 같은 후보가 나온다.
  Run '수집' 'collect' 'node scripts\collect.mjs'
  if ($script:failStep) { $script:exitCode = 1; return }

  # 요약 생성. 규격을 어긴 기사는 여기서 빠지고, 인사이트가 끝내 실패하면 발행하지 않는다.
  Run '요약 생성' 'summarize' 'node scripts\summarize.mjs'
  if ($script:failStep) { $script:exitCode = 1; return }

  # 발행 — data/*.js 가 바뀌었을 때만 커밋한다.
  $changed = & git status --porcelain -- data
  if (-not $changed) {
    # 실패가 아니다. 같은 날 다시 돈 것이므로 그대로 메일 단계로 넘어간다.
    # 그날 메일을 이미 보냈다면 runs/<date>/mail.json 마커가 두 번째 발송을 막는다.
    Say '바뀐 데이터가 없다. 커밋하지 않는다'
    return
  }

  $today = Get-Date -Format 'yyyy-MM-dd'
  & git add data
  & git commit -q -m "브리핑 $today"
  if ($LASTEXITCODE -ne 0) {
    $script:failStep = 'commit'
    $script:failCode = $LASTEXITCODE
    Say '커밋 실패'
    $script:exitCode = 1
    return
  }
  Say "커밋 완료 · 브리핑 $today"

  # 원격이 없으면 로컬 커밋으로 끝낸다. 배포는 원격이 붙은 뒤부터다.
  $remote = & git remote
  if (-not $remote) {
    Say '원격이 없어 푸시를 건너뛴다 (로컬 커밋까지 완료)'
    return
  }

  & git push -q
  if ($LASTEXITCODE -ne 0) {
    $script:failStep = 'push'
    $script:failCode = $LASTEXITCODE
    Say '푸시 실패 — 커밋은 남아 있으니 다음 실행에서 함께 올라간다'
    $script:exitCode = 1
    return
  }
  Say '푸시 완료 · 배포는 GitHub Pages 가 이어서 한다'
}

Say '───────────────────────────────────────────────'
Say "시작 · $repo"

Invoke-Publish

# 메일 — 성공이든 실패든 한 통 보낸다. 브리핑 전문이냐 실패 알림이냐는 플래그가 아니라
# mail.mjs 가 data/briefs.js 를 보고 정한다. 커밋·푸시 실패는 브리핑이 만들어진 뒤의
# 일이므로 그런 날에도 전문이 가고, 위에 경고 한 줄만 붙는다.
#
# --date 를 넘기지 않는다. mail.mjs 는 collect·summarize 와 같은 defaultDate() 를 쓰므로
# 여기서 Get-Date 로 따로 계산하면 08시 전에 밀려 도는 날 하루가 어긋난다.
$mailArgs = ''
if ($script:failStep) {
  $mailArgs = "--status fail --step $($script:failStep) --code $($script:failCode)"
}

Say '메일 발송 시작'
& cmd /c "node scripts\mail.mjs $mailArgs >> ""$log"" 2>&1"
if ($LASTEXITCODE -ne 0) {
  # 메일 실패가 발행의 성패를 뒤엎지 않는다. 사이트에는 이미 올라가 있다.
  Say "메일 발송 실패 (종료 코드 $LASTEXITCODE) — 발행 결과는 그대로 둔다"
}

exit $script:exitCode
