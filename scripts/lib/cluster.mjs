/**
 * 4단계 · 중복 묶음 — SPEC 6.3
 *
 * 교차 보도는 점수의 35%이고 SPEC이 "알고리즘의 중심"이라 부른 항목이다.
 * 여러 독립 매체가 같은 사건을 동시에 다뤘다는 사실이 한 편집자의 판단보다
 * 나은 중요도 신호라는 전제 위에 서 있다. 그래서 이 판정이 틀리면 순위 전체가 틀린다.
 *
 * 판정은 둘 중 하나:
 *   ① 제목 토큰 Jaccard >= 0.45
 *   ② 공유 엔티티 >= 2  그리고  발행 시각 12시간 이내
 *
 * ②가 한국어–영어 교차 보도를 잡는 장치다. '엔비디아, 블랙웰 공급 확대'와
 * 'Nvidia expands Blackwell supply'는 토큰이 하나도 겹치지 않지만
 * 엔티티는 {nvidia, blackwell} 로 같다.
 */
import { hoursApart } from './time.mjs';

export const JACCARD_MIN = 0.45;
export const ENTITY_MIN = 2;
export const ENTITY_HOURS = 12;
export const BORDERLINE_MIN = 0.30;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* 조사가 붙은 어절을 맨어절로 되돌린다. 형태소 분석기가 아니라
   '엔비디아가'와 '엔비디아를'이 같은 토큰이 되게 하는 정도의 장치다. */
const PARTICLES = [
  '에서는', '에게서', '으로써', '으로서', '이라고', '라고는', '에서도', '까지도',
  '으로는', '에서', '에게', '한테', '으로', '라고', '이라', '보다', '처럼', '까지',
  '부터', '만큼', '조차', '마저', '이나', '든지', '이란', '와의', '과의', '의', '은',
  '는', '이', '가', '을', '를', '에', '로', '와', '과', '도', '만', '요'
];

function stripParticle(word) {
  if (!/[가-힣]$/.test(word) || word.length < 3) return word;
  for (const p of PARTICLES) {
    if (word.length - p.length >= 2 && word.endsWith(p)) return word.slice(0, -p.length);
  }
  return word;
}

export function buildEntityIndex(entitiesJson) {
  const entries = [];
  for (const e of entitiesJson.entities) {
    const ko = [];
    const en = [];
    for (const a of e.aliases) (/[가-힣]/.test(a) ? ko : en).push(a.toLowerCase());
    entries.push({
      canonical: e.canonical,
      ko,
      re: en.length ? new RegExp('(?<![a-z0-9])(?:' + en.map(esc).join('|') + ')(?![a-z0-9])', 'i') : null
    });
  }
  return entries;
}

export function entitiesIn(text, index) {
  const t = (text || '').toLowerCase();
  const found = new Set();
  for (const e of index) {
    if (e.re && e.re.test(t)) { found.add(e.canonical); continue; }
    if (e.ko.some((a) => t.includes(a))) found.add(e.canonical);
  }
  return found;
}

export function tokenize(text, stopset) {
  const words = (text || '')
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/g, ' ')
    .split(' ')
    .filter(Boolean);
  const out = new Set();
  for (const raw of words) {
    const w = stripParticle(raw);
    if (w.length < 2) continue;
    if (stopset.has(w)) continue;
    out.add(w);
  }
  return out;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  for (const v of small) if (big.has(v)) inter++;
  return inter / (a.size + b.size - inter);
}

/* union-find */
function makeDsu(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  return { find, union: (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; } };
}

/**
 * 후보 전체를 묶는다.
 * 반환: { clusters, links, borderline }
 *   clusters[] = { members[], representative, crossRefs[], crossCount, why }
 *   borderline  = 유사도 0.30~0.45 로 묶이지 않은 쌍. 엔티티 사전 보강 지점을 드러낸다.
 */
export function clusterAll(items, opts) {
  const { entityIndex, stopset, weightOf } = opts;

  const feats = items.map((it) => {
    const text = it.title + ' ' + (it.rawSummary || '');
    return { tokens: tokenize(it.title, stopset), entities: entitiesIn(text, entityIndex) };
  });

  const dsu = makeDsu(items.length);
  const links = [];
  const borderline = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      /* 같은 매체의 두 기사도 묶는다. P4 는 '같은 사건을 다룬 기사는 하나만 남긴다'이지
         매체를 가리지 않는다. 한 매체가 같은 사건을 두 각도로 쓴 것을 둘 다 실으면
         그날 10건 중 두 자리가 같은 이야기가 된다.
         교차 보도 '집계'만 다른 매체로 제한하면 되고, 그건 아래 crossRefs 에서 한다. */
      const jac = jaccard(feats[i].tokens, feats[j].tokens);
      const shared = [...feats[i].entities].filter((e) => feats[j].entities.has(e));
      const gap = hoursApart(items[i].publishedAt, items[j].publishedAt);

      if (jac >= JACCARD_MIN) {
        dsu.union(i, j);
        links.push({ i, j, why: 'title-similarity ' + jac.toFixed(2) });
      } else if (shared.length >= ENTITY_MIN && gap <= ENTITY_HOURS) {
        dsu.union(i, j);
        links.push({ i, j, why: 'shared-entities: ' + shared.join(', ') });
      } else if (jac >= BORDERLINE_MIN || (shared.length >= ENTITY_MIN && gap <= 36)) {
        borderline.push({
          a: items[i].source + ' — ' + items[i].title,
          b: items[j].source + ' — ' + items[j].title,
          jaccard: +jac.toFixed(2),
          shared,
          hoursApart: +gap.toFixed(1)
        });
      }
    }
  }

  const groups = new Map();
  for (let i = 0; i < items.length; i++) {
    const root = dsu.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  }

  const clusters = [];
  for (const idx of groups.values()) {
    const members = idx.map((i) => items[i]);
    /* 대표는 출처 가중치가 가장 높은 기사. 동률이면 먼저 보도한 쪽. */
    const rep = members.slice().sort((a, b) => {
      const w = weightOf(b.sourceType) - weightOf(a.sourceType);
      if (w !== 0) return w;
      return Date.parse(a.publishedAt) - Date.parse(b.publishedAt);
    })[0];

    /* 교차 보도 수는 '독립 매체 수'다. 같은 매체가 두 건을 써도 하나로 센다. */
    const others = new Map();
    for (const m of members) {
      if (m.source === rep.source) continue;
      if (!others.has(m.source)) others.set(m.source, { source: m.source, url: m.url });
    }
    const crossRefs = [...others.values()];

    clusters.push({
      members,
      representative: rep,
      crossRefs,
      crossCount: crossRefs.length,
      why: idx.length > 1
        ? links.filter((l) => idx.includes(l.i) && idx.includes(l.j)).map((l) => l.why).join(' | ')
        : null
    });
  }

  return { clusters, links, borderline };
}
