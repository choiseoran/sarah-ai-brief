/**
 * 4단계 중복 묶음 — SPEC 6.3, 원칙 P4
 *
 * 교차 보도는 점수의 35% 이고 SPEC 이 "알고리즘의 중심"이라 부른 항목이다.
 * 이 판정이 틀리면 순위 전체가 틀린다. 그런데 산출물 검사만으로는
 * 임계값을 바꿔도 아무것도 깨지지 않는다 — 이미 만들어진 JSON 을 읽기 때문이다.
 * 그래서 합성 기사로 묶음 규칙 자체를 검사한다.
 *
 * 엔티티 사전은 실제 파일을 쓴다. 사전에 nvidia·blackwell 이 없으면
 * 한↔영 교차 보도를 못 잡는다는 사실까지 함께 확인하기 위해서다.
 *
 * 네트워크를 쓰지 않는다.
 */
import { clusterAll, buildEntityIndex, tokenize, jaccard } from '../lib/cluster.mjs';
import { readJson } from '../lib/meta.mjs';

export const name = '중복 묶음 (교차 보도 판정)';

/* SPEC 6.3 에 적힌 값. lib/ 에서 import 하지 않는다 — 명세를 못박는 것이 목적이다. */
const SPEC_JACCARD_MIN = 0.45;
const SPEC_ENTITY_MIN = 2;
const SPEC_ENTITY_HOURS = 12;

const lexicon = readJson('scripts', 'data', 'lexicon.json');
const entities = readJson('scripts', 'data', 'entities.json');
const entityIndex = buildEntityIndex(entities);
const stopset = new Set([...lexicon.stopwords.en, ...lexicon.stopwords.ko]);
const WEIGHT = { primary: 1.0, tech: 0.85, industry: 0.8, domestic: 0.75, community: 0.6 };
const weightOf = (type) => WEIGHT[type] ?? 0;

const BASE = Date.UTC(2026, 7, 30, 12, 0, 0);
const at = (hoursFromBase) => new Date(BASE + hoursFromBase * 3600 * 1000).toISOString();

let seq = 0;
const art = (source, sourceType, title, hours = 0, rawSummary = '') => ({
  feedId: source.toLowerCase().replace(/\s/g, ''),
  source, sourceType, title, rawSummary,
  url: 'https://example.com/a' + ++seq,
  publishedAt: at(hours)
});

const cluster = (items) => clusterAll(items, { entityIndex, stopset, weightOf });
const groupOf = (res, title) =>
  res.clusters.find((c) => c.members.some((m) => m.title === title));

export function run(t) {
  seq = 0;

  /* 한↔영 교차 보도 — 이 사전의 존재 이유 */
  {
    const ko = art('전자신문', 'domestic', '엔비디아, 블랙웰 공급 확대…국내 물량 배정', 0);
    const en = art('The Verge', 'industry', 'Nvidia expands Blackwell supply to meet demand', 3);
    const res = cluster([ko, en]);
    t('한국어·영어 기사가 엔티티로 묶인다 (토큰은 안 겹침)',
      res.clusters.length === 1,
      `묶음 ${res.clusters.length}개 · 토큰 유사도 ${jaccard(tokenize(ko.title, stopset), tokenize(en.title, stopset)).toFixed(2)}`);
    t('대표는 출처 가중치가 높은 쪽 (업계 0.8 > 국내 0.75)',
      res.clusters[0]?.representative.source === 'The Verge');
  }

  /* 공유 엔티티가 1개뿐이면 묶지 않는다 — 과잉 병합 방지 */
  {
    const res = cluster([
      art('TechCrunch', 'industry', 'Nvidia reports record quarterly earnings', 0),
      art('The Verge', 'industry', 'Nvidia partners with Samsung on memory', 1)
    ]);
    t(`공유 엔티티 ${SPEC_ENTITY_MIN}개 미만이면 안 묶인다`, res.clusters.length === 2,
      `묶음 ${res.clusters.length}개`);
  }

  /* 엔티티가 2개여도 시간이 멀면 묶지 않는다 */
  {
    const near = cluster([
      art('TechCrunch', 'industry', 'OpenAI ships GPT update for enterprise', 0),
      art('The Verge', 'industry', 'GPT rollout from OpenAI reaches business tier', SPEC_ENTITY_HOURS - 1)
    ]);
    t(`${SPEC_ENTITY_HOURS}시간 이내면 묶는다`, near.clusters.length === 1);

    const far = cluster([
      art('TechCrunch', 'industry', 'OpenAI ships GPT update for enterprise', 0),
      art('The Verge', 'industry', 'GPT rollout from OpenAI reaches business tier', SPEC_ENTITY_HOURS + 2)
    ]);
    t(`${SPEC_ENTITY_HOURS}시간을 넘으면 안 묶는다`, far.clusters.length === 2,
      `묶음 ${far.clusters.length}개`);
  }

  /* 제목 유사도만으로 묶이는 경로 — 엔티티 사전에 없는 사건도 잡아야 한다 */
  {
    const a = art('Ars Technica', 'tech', 'Federal judge blocks state surveillance camera funding', 0);
    const b = art('TechCrunch', 'industry', 'Judge blocks state funding for surveillance camera program', 2);
    const j = jaccard(tokenize(a.title, stopset), tokenize(b.title, stopset));
    const res = cluster([a, b]);
    t(`제목 유사도 >= ${SPEC_JACCARD_MIN} 이면 엔티티 없이도 묶인다`,
      res.clusters.length === 1, `jaccard ${j.toFixed(2)}`);
  }

  /* 무관한 기사는 묶이지 않는다 */
  {
    const res = cluster([
      art('TechCrunch', 'industry', 'Anthropic releases new safety evaluation suite', 0),
      art('The Verge', 'industry', 'Waymo expands robotaxi service to three cities', 1),
      art('Ars Technica', 'tech', 'Researchers find flaw in open weight license terms', 2)
    ]);
    t('무관한 기사 3건은 3묶음 그대로', res.clusters.length === 3);
  }

  /* P4 — 같은 매체의 같은 사건도 묶는다. 매체를 가리지 않는다 */
  {
    const res = cluster([
      art('ZDNet Korea', 'domestic', '하정우, 국가AI전략위 부위원장 취임', 0),
      art('ZDNet Korea', 'domestic', '하정우 국가AI전략위 부위원장 취임…실행 체제로', 0.3)
    ]);
    t('같은 매체의 같은 사건은 하나로 묶인다 (P4)', res.clusters.length === 1,
      `묶음 ${res.clusters.length}개`);
    t('같은 매체끼리는 교차 보도로 세지 않는다',
      res.clusters[0]?.crossCount === 0, `교차 ${res.clusters[0]?.crossCount}`);
  }

  /* 교차 보도 수 = 독립 매체 수. 한 매체가 두 건을 써도 하나로 센다 */
  {
    const res = cluster([
      art('OpenAI Blog', 'primary', 'Introducing GPT for Anthropic interoperability tests', 0),
      art('TechCrunch', 'industry', 'OpenAI GPT interoperability tests with Anthropic begin', 1),
      art('TechCrunch', 'industry', 'What OpenAI GPT interoperability with Anthropic means', 2),
      art('The Verge', 'industry', 'OpenAI and Anthropic start GPT interoperability tests', 3)
    ]);
    const g = res.clusters[0];
    t('4건이 한 묶음', res.clusters.length === 1 && g.members.length === 4);
    t('대표는 공식 발표 (가중치 1.0)', g?.representative.source === 'OpenAI Blog');
    t('교차 보도는 독립 매체 2곳 (TechCrunch 2건은 1로)', g?.crossCount === 2,
      '교차 ' + g?.crossCount + ' · ' + g?.crossRefs.map((r) => r.source).join(', '));
  }

  /* 동률이면 먼저 보도한 쪽이 대표 */
  {
    const late = art('The Verge', 'industry', 'Mistral open weights release lands for developers', 5);
    const early = art('TechCrunch', 'industry', 'Mistral releases open weights for developers', 1);
    const res = cluster([late, early]);
    t('가중치 동률이면 먼저 보도한 쪽이 대표',
      res.clusters[0]?.representative.source === 'TechCrunch',
      '대표 ' + res.clusters[0]?.representative.source);
  }

  /* 경계 건이 보고된다 — 사전 보강 지점을 드러내기 위한 것.
     엔티티는 2개 겹치지만 12시간을 넘겨 묶이지 않은 쌍이 전형적인 경우다. */
  {
    const res = cluster([
      art('TechCrunch', 'industry', 'OpenAI ships GPT update for enterprise', 0),
      art('The Verge', 'industry', 'GPT rollout from OpenAI reaches business tier', 20)
    ]);
    t('묶이진 않았지만 가까운 쌍은 경계 건으로 보고된다',
      res.clusters.length === 2 && res.borderline.length >= 1,
      `묶음 ${res.clusters.length} · 경계 ${res.borderline.length}` +
      (res.borderline[0] ? ` · 공유 [${res.borderline[0].shared.join(', ')}] ${res.borderline[0].hoursApart}h` : ''));
  }

  /* 토큰화 — 한글 조사를 떼지 않으면 같은 사건이 갈라진다 */
  {
    const a = tokenize('엔비디아가 공급을 확대했다', stopset);
    const b = tokenize('엔비디아의 공급 확대', stopset);
    t('한글 조사를 떼어 같은 토큰이 된다',
      a.has('엔비디아') && b.has('엔비디아') && a.has('공급') && b.has('공급'),
      [...a].join(',') + ' / ' + [...b].join(','));
  }
}
