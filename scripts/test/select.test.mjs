/**
 * 7·9단계 상한과 확정 — SPEC 6.3, 원칙 P3/P4
 *
 * 공식 2자리 보장은 점수 순서를 거스르는 유일한 개입이다.
 * 실제 수집에서는 후보 풀에 공식 발표가 한 건도 없어 이 경로가 돌지 않았다.
 * 합성 데이터로 확인한다.
 *
 * 네트워크를 쓰지 않는다.
 */
import { select } from '../lib/select.mjs';

export const name = '선정 규칙 (출처 상한 · 공식 2자리)';

let n = 0;
const mk = (source, sourceType, score) => ({
  source, sourceType, score,
  url: 'https://example.com/' + ++n,
  publishedAt: new Date(Date.UTC(2026, 7, 30, 12, 0, 0) - n * 60000).toISOString(),
  scoreParts: { weight: 1, cross: 0, fresh: 0 }
});

const countBySource = (chosen) => {
  const c = {};
  for (const x of chosen) c[x.source] = (c[x.source] ?? 0) + 1;
  return c;
};

export function run(t) {
  n = 0;

  /* 한 출처 3건 상한 — P4 */
  {
    const pool = [
      ...Array.from({ length: 12 }, (_, i) => mk('TechCrunch', 'industry', 90 - i)),
      ...Array.from({ length: 12 }, (_, i) => mk('The Verge', 'industry', 80 - i))
    ];
    const r = select(pool);
    const counts = countBySource(r.chosen);
    t('한 출처 최대 3건', Object.values(counts).every((v) => v <= 3), JSON.stringify(counts));
    t('상한 때문에 10건을 못 채우면 그대로 낸다', r.chosen.length === 6, r.chosen.length + '건');
  }

  /* 공식 2자리 보장 — 점수가 낮아도 끌어올린다 */
  {
    const pool = [
      ...Array.from({ length: 3 }, (_, i) => mk('TechCrunch', 'industry', 95 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('The Verge', 'industry', 90 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('VentureBeat', 'industry', 85 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('Ars Technica', 'tech', 80 - i)),
      mk('OpenAI Blog', 'primary', 40),
      mk('Anthropic News', 'primary', 38)
    ];
    const r = select(pool);
    t('공식 2자리 확보', r.primaryCount === 2, '공식 ' + r.primaryCount + '건');
    t('교체가 기록에 남는다 (점수를 거스른 개입이므로)', r.swaps.length === 2,
      r.swaps.map((s) => s.outScore + '→' + s.inScore).join(', '));
    t('총 10건 유지', r.chosen.length === 10, r.chosen.length + '건');
    t('교체 후에도 출처 상한 유지',
      Object.values(countBySource(r.chosen)).every((v) => v <= 3),
      JSON.stringify(countBySource(r.chosen)));
  }

  /* 풀에 공식이 1건뿐이면 보장할 수 없다 — 없는 것을 만들어 내지 않는다 */
  {
    const pool = [
      ...Array.from({ length: 3 }, (_, i) => mk('TechCrunch', 'industry', 95 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('The Verge', 'industry', 90 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('VentureBeat', 'industry', 85 - i)),
      ...Array.from({ length: 3 }, (_, i) => mk('Ars Technica', 'tech', 80 - i)),
      mk('OpenAI Blog', 'primary', 30)
    ];
    const r = select(pool);
    t('공식이 1건뿐이면 1건만', r.primaryCount === 1, '풀에 ' + r.primaryAvailable + '건');
    t('그 사실이 기록에 남는다', r.primaryAvailable === 1);
  }

  /* 후보 부족 — 모자란 채로 확정한다 (P3) */
  {
    const r = select([mk('OpenAI Blog', 'primary', 90), mk('Anthropic News', 'primary', 80)]);
    t('2건이면 2건, 억지로 채우지 않는다', r.chosen.length === 2);
    t('미달 건수를 보고한다', r.shortfall === 8, r.shortfall + '건 미달');
  }

  /* 결정적 정렬 — 같은 입력이면 순서가 흔들리지 않는다 */
  {
    const pool = [mk('A', 'tech', 70), mk('B', 'tech', 70), mk('C', 'tech', 70)];
    const a = select(pool.slice()).chosen.map((c) => c.url).join(',');
    const b = select(pool.slice().reverse()).chosen.map((c) => c.url).join(',');
    t('입력 순서가 달라도 결과가 같다', a === b, a);
  }
}
