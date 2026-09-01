# Sarah's AI Brief — 매일 한 번 도는 자동 발행 (SPEC 10절 Phase 4)
#
# 수집 → 요약 → 커밋 → 푸시. 사람이 개입하지 않는다.
# Windows 작업 스케줄러가 이 파일을 부른다. 등록·해제 명령은 README 에 있다.
#
# 시각에 대하여 — 날짜 T 의 브리핑은 T 08:00 KST 기준시각 직전 24시간을 본다(SPEC 6.2).
# 수집기는 이미 닫힌 창만 겨냥하므로 08:00 **이후**에 시작해야 그날 창을 볼 수 있다.
# 그래서 08:00 에 시작하고 생성에 걸리는 몇 분만큼 늦게 반영된다.
#
# 실패해도 사이트는 살아 있다. 그날 브리핑이 늦어질 뿐이다(SPEC 8절 아키텍처 경계).
#
# PowerShell 5.1 의 함정 두 가지를 피해 간다. 둘 다 실측으로 걸렸다.
#   1. 이 파일은 **UTF-8 BOM** 으로 저장해야 한다. BOM 이 없으면 시스템 코드페이지로
#      읽혀 한글이 깨지고 구문 오류가 난다.
#   2. 네이티브 실행 파일에 `2>&1` 을 쓰면 stderr 한 줄마다 ErrorRecord 가 만들어지고,
#      ErrorActionPreference 가 Stop 이면 거기서 스크립트가 죽는다. collect.mjs 는
#      진행 상황을 전부 stderr 로 내므로 첫 줄에서 끝났다. 그래서 리다이렉션은
#      cmd 에 맡기고, 성공 여부는 종료 코드로만 판단한다.

$ErrorActionPreference = 'Continue'

$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

$logDir = Join-Path $repo 'runs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$log = Join-Path $logDir 'daily.log'

function Say($msg) {
  $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  Write-Output $line
  Add-Content -Path $log -Value $line -Encoding utf8
}

# 네이티브 명령은 cmd 를 거쳐 부른다. 리다이렉션을 OS 가 처리하므로
# stderr 가 PowerShell 의 에러 스트림으로 올라오지 않는다.
function Run($label, $cmdline) {
  Say "$label 시작"
  & cmd /c "$cmdline >> ""$log"" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Say "$label 실패 (종료 코드 $LASTEXITCODE). 발행하지 않는다"
    exit 1
  }
  Say "$label 완료"
}

Say '───────────────────────────────────────────────'
Say "시작 · $repo"

# 1~9단계 수집. 여기까지는 LLM 이 없고 같은 입력이면 같은 후보가 나온다.
Run '수집' 'node scripts\collect.mjs'

# 요약 생성. 규격을 어긴 기사는 여기서 빠지고, 인사이트가 끝내 실패하면 발행하지 않는다.
Run '요약 생성' 'node scripts\summarize.mjs'

# 발행 — data/*.js 가 바뀌었을 때만 커밋한다.
$changed = & git status --porcelain -- data
if (-not $changed) {
  Say '바뀐 데이터가 없다. 커밋하지 않는다'
  exit 0
}

$today = Get-Date -Format 'yyyy-MM-dd'
& git add data
& git commit -q -m "브리핑 $today"
if ($LASTEXITCODE -ne 0) {
  Say '커밋 실패'
  exit 1
}
Say "커밋 완료 · 브리핑 $today"

# 원격이 없으면 로컬 커밋으로 끝낸다. 배포는 원격이 붙은 뒤부터다.
$remote = & git remote
if (-not $remote) {
  Say '원격이 없어 푸시를 건너뛴다 (로컬 커밋까지 완료)'
  exit 0
}

& git push -q
if ($LASTEXITCODE -ne 0) {
  Say '푸시 실패 — 커밋은 남아 있으니 다음 실행에서 함께 올라간다'
  exit 1
}
Say '푸시 완료 · 배포는 GitHub Pages 가 이어서 한다'
