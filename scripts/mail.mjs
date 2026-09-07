#!/usr/bin/env node
/**
 * Sarah's AI Brief — 브리핑 메일 발송 (SPEC 10절 Phase 5a)
 *
 * data/briefs.js 에서 그날 브리핑을 찾아 한국어 전문 메일 한 통을 보낸다.
 * 구독자 명단도 접수 API 도 없다 — 받는 사람은 .env 의 주소 하나다(Phase 5b 가 그다음).
 *
 * 무엇을 보낼지는 플래그가 아니라 **데이터가** 정한다. briefs.js 에 그날 브리핑이 있으면
 * 전문을, 없으면 실패 알림을 보낸다. --status fail 은 "무엇을 보낼까"가 아니라
 * "위에 경고 한 줄을 붙일까"만 정한다. 커밋·푸시 실패는 브리핑이 만들어진 뒤의 일이므로
 * 그런 날에도 전문이 가야 한다.
 *
 * 사용:
 *   node scripts/mail.mjs                          이미 지나간 마지막 발행분
 *   node scripts/mail.mjs --date 2026-09-01         기준일 고정
 *   node scripts/mail.mjs --dry-run                 발송 없이 runs/<date>/mail.{html,txt}
 *   node scripts/mail.mjs --to a@b.com              수신자 오버라이드
 *   node scripts/mail.mjs --force                   이미 보낸 날도 다시 보낸다
 *   node scripts/mail.mjs --status fail --step summarize --code 1
 */
import { writeFileSync, appendFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT, loadMeta, loadBriefs, loadGlossary } from './lib/meta.mjs';
import { defaultDate } from './lib/time.mjs';
import { envValue } from './lib/env.mjs';
import { renderBrief, renderFailure, STEP_LABEL, LOG_TAIL_MAX } from './lib/letter.mjs';

/* ── 인자 ─────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const value = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const DATE = value('date', defaultDate());
const DRY_RUN = flag('dry-run');
const FORCE = flag('force');
const STATUS = value('status', 'ok');
const STEP = value('step', null);
const CODE = Number(value('code', 0)) || 0;
const TO = value('to', null);

const say = (...a) => console.error(...a);

if (!/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  say('--date 는 YYYY-MM-DD 형식이어야 합니다: ' + DATE);
  process.exit(2);
}
if (STATUS !== 'ok' && STATUS !== 'fail') {
  say('--status 는 ok 또는 fail 입니다: ' + STATUS);
  process.exit(2);
}
if (STEP && !STEP_LABEL[STEP]) {
  /* 막지는 않는다. 모르는 단계 이름도 그대로 실어 보내는 편이, 알림을 아예 못 받는 것보다 낫다. */
  say('모르는 --step 입니다(그대로 싣습니다): ' + STEP + ' · 아는 이름: ' + Object.keys(STEP_LABEL).join(', '));
}

const RUN_DIR = join(ROOT, 'runs', DATE);
const MARKER = join(RUN_DIR, 'mail.json');
const LOG = join(ROOT, 'runs', 'daily.log');

/* ── 무엇을 보낼까 ────────────────────────────────────────────────── */
const failed = STATUS === 'fail';
const meta = loadMeta();
const brief = loadBriefs().find((b) => b.date === DATE) ?? null;

let letter;
if (brief) {
  letter = renderBrief(brief, {
    meta,
    glossary: loadGlossary(),
    siteUrl: envValue('SITE_URL'),
    notice: failed ? { step: STEP, code: CODE } : null
  });
} else if (failed) {
  letter = renderFailure({ date: DATE, step: STEP, code: CODE, logTail: logTail() }, { meta });
} else {
  say(DATE + ' 브리핑이 data/briefs.js 에 없습니다. 보낼 것이 없습니다.');
  say('  먼저 만드세요:  node scripts/collect.mjs --date ' + DATE + '  &&  node scripts/summarize.mjs --date ' + DATE);
  process.exit(1);
}

const bytes = Buffer.byteLength(letter.html, 'utf8') + Buffer.byteLength(letter.text, 'utf8');

/* ── 눈으로 먼저 확인하는 경로 ────────────────────────────────────── */
if (DRY_RUN) {
  mkdirSync(RUN_DIR, { recursive: true });
  writeFileSync(join(RUN_DIR, 'mail.html'), letter.html, 'utf8');
  writeFileSync(join(RUN_DIR, 'mail.txt'), letter.text, 'utf8');
  say('제목  ' + letter.subject);
  say('본문  ' + join('runs', DATE, 'mail.html') + ' · ' + join('runs', DATE, 'mail.txt'));
  say(sizeLine());
  say('발송하지 않았습니다 (--dry-run).');
  process.exit(0);
}

if (existsSync(MARKER) && !FORCE) {
  const sent = JSON.parse(readFileSync(MARKER, 'utf8'));
  say(DATE + ' 은 이미 보냈습니다 (' + sent.sentAt + ' · ' + sent.to + '). 다시 보내려면 --force');
  process.exit(0);
}

/* ── 발송 ─────────────────────────────────────────────────────────── */
/* smtp.mjs 는 여기서만, 그것도 실제로 보낼 때만 불러온다. nodemailer 를 설치하기 전에도
   --dry-run 으로 결과물을 먼저 볼 수 있어야 하기 때문이다. */
const { mailConfig, sendLetter, describeMailError, CONFIG_HELP } = await import('./lib/smtp.mjs');

const cfg = mailConfig(TO);
if (!cfg) {
  /* 설정이 없는 것은 실패가 아니다. 메일은 발행 파이프라인의 부가 기능이고,
     여기서 종료 코드 1 을 내면 daily.ps1 의 스케줄러 기록에 매일 실패가 쌓여
     진짜 발행 실패와 구분이 안 된다(SPEC 8절 아키텍처 경계와 같은 태도). */
  say(CONFIG_HELP);
  process.exit(0);
}

try {
  const info = await sendLetter(cfg, letter);
  mkdirSync(RUN_DIR, { recursive: true });
  writeFileSync(MARKER, JSON.stringify({
    sentAt: new Date().toISOString(),
    to: cfg.to,
    subject: letter.subject,
    bytes,
    messageId: info.messageId
  }, null, 2) + '\n', 'utf8');
  appendReport(cfg, info);
  say('메일 발송 완료 · ' + cfg.to);
  say('제목  ' + letter.subject);
  say(sizeLine());
} catch (err) {
  say('메일 발송 실패 — ' + describeMailError(err));
  /* 서버가 돌려준 원문을 그대로 남긴다. 거기 적힌 주소가 다음에 할 일을 알려 준다.
     여기서 CONFIG_HELP 를 내지 않는 이유 — 설정은 있는데 거절당한 것이므로
     "설정이 없다"는 안내는 사실이 아니고, 엉뚱한 곳을 보게 만든다. */
  if (err?.response) say('  서버 응답 — ' + String(err.response).split('\n').join(' '));
  process.exit(1);
}

/* ── 도구 ─────────────────────────────────────────────────────────── */

/** 실패 알림에 붙일 로그 꼬리. 로그가 없어도 메일은 나가야 한다. */
function logTail() {
  if (!existsSync(LOG)) return [];
  return readFileSync(LOG, 'utf8').split('\n').map((l) => l.trimEnd()).filter(Boolean).slice(-LOG_TAIL_MAX);
}

/**
 * Gmail 은 약 102KB 를 넘는 메시지를 잘라내고 '전체 메시지 보기' 로 바꾼다.
 * 한글은 base64 로도 4/3 배 부푸므로 매번 재어 남긴다 — 기사가 늘면 언젠가 닿는다.
 */
function sizeLine() {
  const encoded = Math.round((bytes * 4) / 3);
  return '크기  ' + bytes + '바이트 · 인코딩 후 약 ' + encoded + '바이트 (상한 95000)'
    + (encoded >= 95000 ? '  ← 상한을 넘었습니다. Gmail 이 잘라낼 수 있습니다' : '');
}

/** 그날 무슨 일이 있었는지는 report.txt 한 곳에 모인다. Phase 3 가 쓰는 방식 그대로. */
function appendReport(cfg, info) {
  const path = join(RUN_DIR, 'report.txt');
  const L = ['', '── Phase 5a 발송 ' + '─'.repeat(51)];
  L.push('발송 ' + new Date().toISOString() + ' · ' + cfg.to);
  L.push('제목 ' + letter.subject);
  L.push(sizeLine().replace(/^크기\s+/, '크기 '));
  if (info.messageId) L.push('messageId ' + info.messageId);
  L.push('');
  if (existsSync(path)) appendFileSync(path, L.join('\n'), 'utf8');
  else writeFileSync(path, L.join('\n'), 'utf8');
}
