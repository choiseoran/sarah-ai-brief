/**
 * Phase 5a · SMTP 전송 — 메일을 실제로 내보내는 유일한 자리
 *
 * 사이트 코드에는 라이브러리가 0개지만 이 제약은 서버 코드에 적용되지 않는다(SPEC 8절).
 * SMTP 대화(EHLO·AUTH·DATA·dot stuffing·MIME 인코딩)를 직접 짤 이유가 없다.
 *
 * letter.mjs 는 이 파일을 모른다. 본문(무엇을 말할까)과 전송(어떻게 보낼까)을 가른 것은
 * Phase 3 의 prompt.mjs / claude.mjs 와 같은 구조이고, 덕분에 렌더 테스트가
 * 네트워크도 의존성도 없이 돈다.
 */
import nodemailer from 'nodemailer';
import { envValue } from './env.mjs';

export const CONFIG_HELP = [
  '메일 설정이 없어 보내지 않았습니다.',
  '저장소 루트 .env 에 세 줄을 넣으세요:',
  '  MAIL_USER=보내는사람@gmail.com',
  '  MAIL_PASS=앱비밀번호16자',
  '  MAIL_TO=받는사람@example.com',
  "설정 절차는 README 의 '브리핑 메일 받기' 를 보세요."
].join('\n');

/**
 * .env 에서 설정을 모은다. 셋 중 하나라도 없으면 null 을 돌려준다 —
 * 설정하지 않은 것은 실패가 아니라 "이 기능을 아직 안 켰다" 이다.
 *
 * 앱 비밀번호의 내부 공백만 지운다. 구글이 `abcd efgh ijkl mnop` 처럼 보여주므로
 * 그대로 붙여넣는 경우가 대부분인데, 공백이 남으면 인증만 조용히 실패한다.
 * 이 손질을 env.mjs 가 아니라 여기서 하는 이유는 **다른 키의 값에서 공백을 지우면
 * 안 되기 때문**이다.
 */
export function mailConfig(toOverride = null) {
  const user = envValue('MAIL_USER');
  const pass = envValue('MAIL_PASS');
  const to = toOverride ?? envValue('MAIL_TO');
  if (!user || !pass || !to) return null;

  const name = envValue('MAIL_FROM');
  return {
    host: envValue('MAIL_HOST', 'smtp.gmail.com'),
    port: Number(envValue('MAIL_PORT', '465')),
    user,
    pass: pass.replace(/\s+/g, ''),
    to,
    /* Gmail 은 인증 계정이 아닌 From 주소를 인증 계정으로 바꿔 쓴다.
       그러니 여기서 정하는 것은 표시 이름뿐이고, 주소는 항상 MAIL_USER 다. */
    from: name ? `${name} <${user}>` : user,
    /* 오류 제보를 받는 곳은 사이트가 알리는 주소다(data/meta.js 의 site.email). */
    replyTo: envValue('MAIL_REPLY_TO')
  };
}

export async function sendLetter(cfg, letter) {
  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    /* 작업 스케줄러의 ExecutionTimeLimit 이 30분이다. SMTP 가 매달리면 그날 실행이
       통째로 죽으므로 여기서 먼저 포기한다. */
    connectionTimeout: 20000,
    greetingTimeout: 10000,
    socketTimeout: 30000
  });

  const info = await transport.sendMail({
    from: cfg.from,
    to: cfg.to,
    replyTo: cfg.replyTo || undefined,
    subject: letter.subject,
    text: letter.text,
    html: letter.html,
    /* 한글은 quoted-printable 로 3배(3바이트 → =XX ×3), base64 로 4/3 배 부푼다.
       nodemailer 가 짧은 쪽을 고르긴 하지만 자동 판정에 기대지 않는다 —
       한 번 어긋나면 Gmail 이 본문을 잘라내고(102KB) 그 사실이 메일에는 안 보인다. */
    textEncoding: 'base64',
    /* 제목이 비슷한 메일이 매일 오면 Gmail 이 한 스레드로 접는다. 날짜마다 다른 값을 준다
       (헤더는 ASCII 로 둔다 — 한국어 제목을 헤더에 넣으면 인코딩을 거쳐 값이 길어진다). */
    headers: { 'X-Entity-Ref-ID': letter.refId ?? letter.subject }
  });

  transport.close();
  return { messageId: info.messageId, accepted: info.accepted ?? [] };
}

/** 사람이 읽을 한 줄로. claude.mjs 의 describeError() 와 같은 역할이다. */
export function describeMailError(err) {
  const code = err?.responseCode;
  if (code === 535 || err?.code === 'EAUTH') {
    return '앱 비밀번호가 거부됐습니다 (535). 2단계 인증이 켜져 있는지, 앱 비밀번호를 공백 없이 넣었는지 확인하세요';
  }
  if (err?.code === 'ECONNECTION' || err?.code === 'ETIMEDOUT' || err?.code === 'ESOCKET') {
    return 'SMTP 서버에 연결하지 못했습니다 — 방화벽이 ' + (err?.port ?? '465') + ' 포트를 막았을 수 있습니다: ' + err.message;
  }
  if (err?.code === 'EENVELOPE') return '주소가 거부됐습니다: ' + err.message;
  if (code === 550) return '메일이 거부됐습니다 (550): ' + err.message;
  if (code) return 'SMTP 오류 ' + code + ': ' + err.message;
  return err?.message ?? String(err);
}
