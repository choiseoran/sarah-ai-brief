/**
 * .env 해석 — Phase 3(ANTHROPIC_API_KEY)과 Phase 5a(MAIL_*)가 같이 쓰는 파서
 *
 * 이 파일이 조용히 틀리면 증상이 "API 키가 없다" 또는 "메일 설정이 없다" 로만 나타난다.
 * 원인이 파일 형식이라는 것을 알 방법이 없으므로, 형식 쪽을 여기서 못박는다.
 *
 * BOM 과 CRLF 를 특히 본다. 둘 다 Windows 에서 메모장으로 .env 를 만들면 바로 생기고,
 * 눈으로는 아무 차이도 보이지 않는다.
 *
 * 파일을 읽지 않는다 — 문자열만 넣고 결과를 본다.
 */
import { parseEnvFile } from '../lib/env.mjs';

export const name = '.env 해석';

const BOM = String.fromCharCode(0xFEFF);

export function run(t) {
  const basic = parseEnvFile('A=1\nB=two\n');
  t('KEY=VALUE 를 읽는다', basic.get('A') === '1' && basic.get('B') === 'two');

  t('export 접두사를 허용한다', parseEnvFile('export A=1\n').get('A') === '1');
  t('키·값 주변 공백을 턴다', parseEnvFile('  A = 1  \n').get('A') === '1');

  t('양쪽 따옴표를 벗긴다',
    parseEnvFile('A="1"\nB=\'2\'\n').get('A') === '1' && parseEnvFile('B=\'2\'\n').get('B') === '2');
  t('한쪽만 있는 따옴표는 값의 일부다', parseEnvFile('A="1\n').get('A') === '"1');

  /* 메모장이 UTF-8 BOM 으로 저장하면 첫 줄 키 앞에 보이지 않는 문자가 붙는다.
     걷어내지 않으면 첫 번째 키만 사라진다. */
  t('BOM 이 붙은 첫 줄을 읽는다', parseEnvFile(BOM + 'A=1\n').get('A') === '1');

  /* CRLF 는 값 끝에 \r 를 남긴다. 앱 비밀번호 끝에 붙으면 인증만 조용히 실패한다. */
  t('CRLF 줄바꿈에서 값 끝이 깨끗하다', parseEnvFile('A=1\r\nB=2\r\n').get('A') === '1');

  t('# 주석 줄을 무시한다', parseEnvFile('# A=1\nA=2\n').get('A') === '2');
  t('빈 줄을 무시한다', parseEnvFile('\n\nA=1\n\n').size === 1);
  t('= 가 없는 줄을 무시한다', parseEnvFile('쓰레기\nA=1\n').size === 1);

  /* 값 안의 = 를 보존해야 한다 — base64 패딩이나 URL 쿼리가 들어올 수 있다. */
  t('값 안의 = 를 자르지 않는다', parseEnvFile('A=x=y=z\n').get('A') === 'x=y=z');
  t('따옴표 안의 = 도 보존한다', parseEnvFile('A="x=y"\n').get('A') === 'x=y');

  t('빈 값도 키로는 존재한다', parseEnvFile('A=\n').get('A') === '');
  t('키가 비면 버린다', parseEnvFile('=1\n').size === 0);
}
