/**
 * 6.2 점수식과 시각 기준 — SPEC 6.2
 *
 * 여기서는 기대값을 **숫자로 못박는다.** 산출물 검사는
 * scoreFrom(scoreParts) === score 를 보는데, 그건 같은 함수를 양쪽에 쓰는 것이라
 * 식이 통째로 바뀌어도 통과한다. 실제로 반올림 보정(+1e-9)을 지웠을 때
 * 다른 테스트는 하나도 깨지지 않았다.
 *
 * 네트워크를 쓰지 않는다.
 */
import { scoreFrom, crossScore } from '../lib/score.mjs';
import { anchorFor, windowStart, freshness, inWindow, defaultDate } from '../lib/time.mjs';
import { loadMeta } from '../lib/meta.mjs';

export const name = '점수식과 시각 기준 (6.2)';

export function run(t) {
  /* 부동소수점 함정 — 이 한 줄이 이 테스트의 존재 이유다.
     0.40×1.0 + 0.35×0.5 + 0.25×0.8 은 0.774999… 로 계산된다.
     보정 없이 반올림하면 78이 아니라 77이 나온다. */
  t('0.4×1.0 + 0.35×0.5 + 0.25×0.8 = 78 (77 아님)',
    scoreFrom({ weight: 1.0, cross: 0.5, fresh: 0.8 }) === 78,
    '실제 ' + scoreFrom({ weight: 1.0, cross: 0.5, fresh: 0.8 }));

  t('만점 = 100', scoreFrom({ weight: 1, cross: 1, fresh: 1 }) === 100);
  t('영점 = 0', scoreFrom({ weight: 0, cross: 0, fresh: 0 }) === 0);
  t('공식·교차없음·최신 = 65',
    scoreFrom({ weight: 1.0, cross: 0, fresh: 1 }) === 65,
    '실제 ' + scoreFrom({ weight: 1.0, cross: 0, fresh: 1 }));
  /* 0.40×0.75 + 0.35×0.5 + 0.25×0.5 = 0.30 + 0.175 + 0.125 = 0.60 */
  t('국내·교차2건·신선도0.5 = 60',
    scoreFrom({ weight: 0.75, cross: 0.5, fresh: 0.5 }) === 60,
    '실제 ' + scoreFrom({ weight: 0.75, cross: 0.5, fresh: 0.5 }));

  /* 교차 보도는 4건에서 상한 */
  t('교차 보도 0·1·2·3·4·7건 → 0·0.25·0.5·0.75·1·1',
    [0, 1, 2, 3, 4, 7].map(crossScore).join(',') === '0,0.25,0.5,0.75,1,1',
    [0, 1, 2, 3, 4, 7].map(crossScore).join(','));

  /* 출처 가중치가 SPEC 6.1 표와 같은가 — meta.js 가 진실이지만 명세와 어긋나면 안 된다 */
  {
    const w = Object.fromEntries(loadMeta().sourceTypes.map((s) => [s.id, s.weight]));
    t('출처 가중치 = 공식1.0 / 기술0.85 / 업계0.8 / 국내0.75 / 커뮤니티0.6',
      w.primary === 1.0 && w.tech === 0.85 && w.industry === 0.8 && w.domestic === 0.75 && w.community === 0.6,
      JSON.stringify(w));
  }

  /* 기준시각 — 날짜 T 의 브리핑은 T 08:00 KST 에 나간다 = T-1 23:00Z */
  {
    const a = anchorFor('2026-08-31');
    t("기준시각: '2026-08-31' → 2026-08-30T23:00:00Z",
      a.toISOString() === '2026-08-30T23:00:00.000Z', a.toISOString());
    t('창 시작은 그 24시간 전',
      windowStart(a).toISOString() === '2026-08-29T23:00:00.000Z', windowStart(a).toISOString());
    t('연말 경계도 같은 규칙',
      anchorFor('2026-01-01').toISOString() === '2025-12-31T23:00:00.000Z',
      anchorFor('2026-01-01').toISOString());
  }

  /* 신선도 — 창 안에서 선형, 밖은 0 */
  {
    const a = anchorFor('2026-08-31');
    const s = windowStart(a);
    const mid = new Date(s.getTime() + 12 * 3600 * 1000);
    t('기준시각에 붙은 기사 = 1', freshness(a.toISOString(), a) === 1);
    t('창 시작 = 0', freshness(s.toISOString(), a) === 0);
    t('창 한가운데 = 0.5', freshness(mid.toISOString(), a) === 0.5);
    t('창보다 오래된 기사 = 0',
      freshness(new Date(s.getTime() - 3600 * 1000).toISOString(), a) === 0);
    t('기준시각 이후 기사도 1 로 잘린다',
      freshness(new Date(a.getTime() + 3600 * 1000).toISOString(), a) === 1);
    t('발행 시각을 못 읽으면 0', freshness('not-a-date', a) === 0);

    t('시간 필터: 창 한가운데는 통과', inWindow(mid.toISOString(), a) === true);
    t('시간 필터: 기준시각 이후는 탈락',
      inWindow(new Date(a.getTime() + 60000).toISOString(), a) === false);
    t('시간 필터: 창 시작 이전은 탈락',
      inWindow(new Date(s.getTime() - 60000).toISOString(), a) === false);
  }

  /* 기본 기준일 — 이미 지나간 창만 겨냥한다 (같은 날 두 번 돌려도 결과가 같아야 한다) */
  {
    /* 2026-08-31 17:00 KST = 08:00Z. 오전 8시를 지났으므로 그날치 */
    t('KST 오전 8시 이후면 오늘치',
      defaultDate(new Date('2026-08-31T08:00:00Z')) === '2026-08-31',
      defaultDate(new Date('2026-08-31T08:00:00Z')));
    /* 2026-08-31 07:00 KST = 전날 22:00Z. 아직 8시 전이므로 어제치 */
    t('KST 오전 8시 이전이면 어제치',
      defaultDate(new Date('2026-08-30T22:00:00Z')) === '2026-08-30',
      defaultDate(new Date('2026-08-30T22:00:00Z')));
  }
}
