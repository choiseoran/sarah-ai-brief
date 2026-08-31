/**
 * robots.txt 규칙 해석 — SPEC 8절 '수집 예절'
 *
 * 이 테스트가 있는 이유: 처음 구현에서 와일드카드 규칙 하나가
 * 'Disallow: * /trackback/' 의 '*' 앞을 잘라 빈 접두사로 만들었고,
 * 빈 접두사는 모든 경로에 매칭되면서 패턴이 길다는 이유로 최장 일치까지 이겼다.
 * 그 버그가 TechCrunch·Ars Technica·MIT Technology Review 를 통째로 차단했고,
 * 원문 추출 성공률이 56% 로 찍혔다. 고친 뒤 83%.
 *
 * 네트워크를 쓰지 않는다. 문자열을 파싱해 판정만 본다.
 */
import { parseRobots, isAllowed } from '../lib/robots.mjs';

export const name = 'robots 규칙 해석';

export function run(t) {
  /* TechCrunch — 기사 경로는 열려 있고 관리자·검색만 막힌다 */
  const tc = parseRobots(`
User-agent: *
Disallow: /wp-admin/
Disallow: /wp-json/
Allow: /wp-admin/admin-ajax.php
Disallow: /search/
Disallow: /?s=
Disallow: /*?customize_changeset_uuid=*
`);
  t('TechCrunch 기사 경로 허용', isAllowed(tc, '/2026/08/30/caterpillar-ai-deployment') === true);
  t('TechCrunch /wp-admin/ 차단', isAllowed(tc, '/wp-admin/') === false);
  t('TechCrunch admin-ajax 는 Allow 가 이김', isAllowed(tc, '/wp-admin/admin-ajax.php') === true);
  t('TechCrunch /search/ 차단', isAllowed(tc, '/search/') === false);

  /* Ars Technica — 앞에 * 가 붙은 규칙이 전부를 막으면 안 된다 */
  const ars = parseRobots(`
User-agent: *
Disallow: /category/*/*
Disallow: */trackback/
Disallow: */comments/
Disallow: /search
Disallow: /services/*
`);
  t('Ars 기사 경로 허용', isAllowed(ars, '/ai/2026/08/inside-metas-push-to-put-robots-to-work') === true);
  t('Ars */trackback/ 차단', isAllowed(ars, '/ai/2026/08/some-post/trackback/') === false);
  t('Ars /category/a/b 차단', isAllowed(ars, '/category/ai/news') === false);

  /* MIT Technology Review — $ 앵커 */
  const mit = parseRobots(`
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /*.pdf$
`);
  t('MITTR 기사 경로 허용', isAllowed(mit, '/2026/08/28/1143113/the-download-antiaging-drug') === true);
  t('MITTR .pdf 차단 ($ 앵커)', isAllowed(mit, '/files/report.pdf') === false);
  t('MITTR .pdf.html 은 허용 ($ 앵커라서)', isAllowed(mit, '/files/report.pdf.html') === true);

  t('빈 Disallow 는 전부 허용',
    isAllowed(parseRobots('User-agent: *\nDisallow:'), '/anything') === true);
  t('Disallow: / 는 전부 차단',
    isAllowed(parseRobots('User-agent: *\nDisallow: /'), '/anything') === false);

  /* 우리 UA 전용 그룹이 * 보다 우선한다 */
  const own = parseRobots('User-agent: *\nDisallow: /\n\nUser-agent: SarahsAIBrief\nDisallow: /private/');
  t('우리 UA 전용 그룹이 * 를 이김', isAllowed(own, '/news/story') === true);
  t('우리 UA 전용 그룹의 차단은 지킨다', isAllowed(own, '/private/x') === false);
}
