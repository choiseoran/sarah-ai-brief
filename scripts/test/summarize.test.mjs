/**
 * Phase 3 생성물 검증 — SPEC 5절(콘텐츠 규격)·7절(데이터 계약)
 *
 * 발행 전 사람 검토를 두지 않기로 했으므로 validate.mjs 가 유일한 게이트다.
 * 게이트가 새면 규격을 어긴 글이 그대로 나간다. 그래서 여기서는 "통과하는 것"보다
 * **막아야 할 것을 실제로 막는지**를 더 많이 본다.
 *
 * SPEC 의 숫자는 lib 에서 import 하지 않고 여기에 그대로 적는다 —
 * 상수를 가져오면 상수를 바꾸는 순간 테스트도 따라 움직여 명세 위반을 못 잡는다.
 *
 * 네트워크도, API 키도 쓰지 않는다.
 */
import {
  sentenceCount, missingPairs, validateArticle, validateInsight, validateBrief
} from '../lib/validate.mjs';
import { mergeBrief, recountGlossary, addNewTerms, dropSamples, keepLangs, SAMPLE_DATES } from '../lib/publish.mjs';

export const name = 'Phase 3 생성물 검증 (5·7절)';

/* 규격을 지키는 기사 하나. 여기서 한 군데씩 무너뜨려 가며 검사한다. */
function goodArticle() {
  return {
    title: { ko: '과기정통부, 국가 AI 컴퓨팅 센터 사업자 선정', en: 'Korea picks operator for national AI computing center' },
    summary: {
      ko: [
        '과학기술정보통신부가 국가 AI 컴퓨팅 센터 운영사를 선정했다. 총 사업비는 2조원이다.',
        '센터는 GPU 1만장 규모로 2027년 상반기 가동을 목표로 한다. 운영은 민관 합작 법인이 맡는다.'
      ],
      en: [
        'Korea\'s science ministry named the operator of its national AI computing center. The project is budgeted at 2 trillion won.',
        'The center targets a first-half 2027 launch with 10,000 GPUs. A public-private joint venture will run it.'
      ]
    },
    implication: {
      ko: '국가 단위 컴퓨팅 확보 경쟁이 조달 단계로 넘어갔다. 자금보다 전력과 부지가 병목이다.',
      en: 'The race for national compute has moved to procurement. Power and land, not money, are the binding constraints.'
    },
    topic: 'compute',
    terms: ['sovereign-ai'],
    newTerms: []
  };
}

const CTX = { topicIds: ['compute', 'policy', 'models'], glossaryIds: ['sovereign-ai', 'agent'] };
/* 한국어만 발행하는 날 — data/meta.js 의 site.languages 가 ['ko'] 일 때 */
const KO_ONLY = { ...CTX, langs: ['ko'] };

/** 켜 둔 언어만 남긴 값. keepLangs 가 발행 직전에 하는 일과 같다. */
function koOnly(value) {
  return keepLangs(value, ['ko']);
}

export function run(t) {
  /* ── 문장 세기 ──────────────────────────────────────────────── */
  t('마침표 뒤에 공백이 와야 문장 끝', sentenceCount('한 문장이다. 두 문장이다.') === 2,
    '실제 ' + sentenceCount('한 문장이다. 두 문장이다.'));
  t('"3.5%" 의 점은 문장 끝이 아니다', sentenceCount('성장률은 3.5% 였다.') === 1,
    '실제 ' + sentenceCount('성장률은 3.5% 였다.'));

  /* 영어 약어를 문장 끝으로 세면 멀쩡한 기사가 규격 위반으로 빠진다.
     실측에서 이 오판 하나로 기사 3건이 드랍됐다. */
  t('"Aug. 31" 의 약어 마침표는 세지 않는다',
    sentenceCount('Korea named the operator on Aug. 31. The plan starts in 2027.') === 2,
    '실제 ' + sentenceCount('Korea named the operator on Aug. 31. The plan starts in 2027.'));
  t('"Co." · "Inc." 도 세지 않는다',
    sentenceCount('Samsung Electronics Co. and SK hynix Inc. supply memory. That is the point.') === 2,
    '실제 ' + sentenceCount('Samsung Electronics Co. and SK hynix Inc. supply memory. That is the point.'));
  /* 닫는 따옴표 뒤의 마침표를 못 세면 3문장 문단이 1문장으로 읽힌다 — 실측 드랍 사유 */
  t('인용부호로 끝나는 문장도 센다',
    sentenceCount('He called it an "irreplaceable node." The plan follows. It starts in 2027.') === 3,
    '실제 ' + sentenceCount('He called it an "irreplaceable node." The plan follows. It starts in 2027.'));
  t('한국어 인용부호도 센다',
    sentenceCount('그는 “대체 불가능한 국가”라고 말했다. 계획은 2027년 시작한다.') === 2,
    '실제 ' + sentenceCount('그는 “대체 불가능한 국가”라고 말했다. 계획은 2027년 시작한다.'));

  t('"U.S." 도 세지 않는다',
    sentenceCount('The U.S. and China shifted policy. Korea followed.') === 2,
    '실제 ' + sentenceCount('The U.S. and China shifted policy. Korea followed.'));

  /* ── 기사 규격 ──────────────────────────────────────────────── */
  t('규격을 지킨 기사는 위반 0건', validateArticle(goodArticle(), CTX).length === 0,
    validateArticle(goodArticle(), CTX).join(' / '));

  const long = goodArticle();
  long.title.ko = '가'.repeat(61);
  t('제목 61자는 막는다 (60자 이내)', validateArticle(long, CTX).some((v) => v.includes('title.ko')));

  const onePara = goodArticle();
  onePara.summary.ko = ['한 문단뿐이다. 두 문장이 들어 있다.'];
  t('요약 1문단은 막는다 (2문단 고정)', validateArticle(onePara, CTX).some((v) => v.includes('1문단')));

  /* 상한이 곧 실측 분량이 되므로 위쪽도 막아야 한다 — 3문단을 열어 두면 늘 3문단이 나온다 */
  const threePara = goodArticle();
  threePara.summary.ko = [
    '첫 문단이다. 사건 자체를 적는다.',
    '둘째 문단이다. 숫자를 적는다.',
    '셋째 문단이다. 여기가 규격 위반이다.'
  ];
  t('요약 3문단은 막는다 (2문단 고정)', validateArticle(threePara, CTX).some((v) => v.includes('3문단')));

  const threeSent = goodArticle();
  threeSent.summary.ko[0] = '하나다. 둘이다. 셋이다.';
  t('요약 한 문단 3문장은 막는다 (2문장 이내)', validateArticle(threeSent, CTX).some((v) => v.includes('3문장')));

  /* 문장은 상한만 규격이다 — 넘치는 쪽만 막고 모자란 쪽은 통과시킨다.
     하한을 조여도 분량이 줄지 않고 드랍 사유만 늘어난다. */
  const oneSent = goodArticle();
  oneSent.summary.ko[0] = '한 문장으로 끝나는 문단이다.';
  t('요약 한 문단 1문장은 통과한다', validateArticle(oneSent, CTX).length === 0,
    validateArticle(oneSent, CTX).join(' / '));

  /* 시사점도 상한이 곧 실측 분량이었다 — 09-01~09-04 서른일곱 건 중 서른세 건이 4문장이었다 */
  const threeSentImp = goodArticle();
  threeSentImp.implication.ko = '조달 단계로 넘어갔다. 전력이 병목이다. 계약 조건이 다음 관문이다.';
  t('시사점 3문장은 막는다 (2문장 이내)',
    validateArticle(threeSentImp, CTX).some((v) => v.includes('implication.ko') && v.includes('3문장')));

  /* 문장은 상한만 규격이다 — 하한을 조여도 분량은 안 줄고 드랍 사유만 늘어난다 */
  const oneSentImp = goodArticle();
  oneSentImp.implication.ko = '한 문장짜리 시사점이다.';
  t('시사점 1문장은 통과한다', validateArticle(oneSentImp, CTX).length === 0,
    validateArticle(oneSentImp, CTX).join(' / '));

  /* P1 — 요약에 추측이 섞이면 독자가 사실과 해석을 구분할 수 없다 */
  const hedgeKo = goodArticle();
  hedgeKo.summary.ko[1] = '가동은 2027년으로 예상된다. 규모는 더 커질 전망이다.';
  t('요약의 "~로 예상된다"를 잡는다', validateArticle(hedgeKo, CTX).some((v) => v.includes('추측 표현')));

  const hedgeEn = goodArticle();
  hedgeEn.summary.en[1] = 'The center is expected to open in 2027. Costs may be higher.';
  t('요약의 "is expected to"를 잡는다',
    validateArticle(hedgeEn, CTX).some((v) => v.includes('summary.en') && v.includes('추측')));

  /* 시사점에서는 추측이 허용된다 — 그게 시사점의 몫이다 */
  const hedgeImp = goodArticle();
  hedgeImp.implication.ko = '전력이 다음 병목이 될 전망이다. 부지 확보가 관건이다.';
  t('시사점의 추측 표현은 막지 않는다', validateArticle(hedgeImp, CTX).length === 0,
    validateArticle(hedgeImp, CTX).join(' / '));

  const badTopic = goodArticle();
  badTopic.topic = 'gadgets';
  t('12개에 없는 주제는 막는다', validateArticle(badTopic, CTX).some((v) => v.includes('gadgets')));

  const badTerm = goodArticle();
  badTerm.terms = ['sovereign-ai', 'quantum-supremacy'];
  t('용어사전에 없는 term id 는 막는다', validateArticle(badTerm, CTX).some((v) => v.includes('quantum-supremacy')));

  const manyTerms = goodArticle();
  manyTerms.terms = ['agent', 'agent', 'sovereign-ai', 'agent'];
  t('terms 4개는 막는다 (3개 이내)', validateArticle(manyTerms, CTX).some((v) => v.includes('4개')));

  const noEn = goodArticle();
  noEn.title.en = '';
  t('한쪽 언어만 있는 필드는 막는다', validateArticle(noEn, CTX).some((v) => v.includes('title.en')));

  /* ── {ko,en} 쌍 — SPEC 7절 불변 규칙 ────────────────────────── */
  t('missingPairs 가 en 누락을 찾는다',
    missingPairs({ note: { ko: '있다' } }).length === 1);
  t('missingPairs 가 빈 문단 배열을 찾는다',
    missingPairs({ body: { ko: ['글'], en: [] } }).some((m) => m.includes('body.en')));
  t('둘 다 있으면 통과', missingPairs({ x: { ko: 'ㄱ', en: 'a' } }).length === 0);

  /* ── 인사이트 — 10건을 가로질러 읽었는가 ────────────────────── */
  const goodInsight = {
    title: { ko: '규제는 미뤄지고 청구서는 앞당겨진다', en: 'Rules slip, the bill arrives early' },
    body: {
      ko: ['1번과 3번은 같은 압력의 다른 표현이다. 5번이 그 사이를 잇는다.', '오늘 상위 세 건이 전부 조달 이야기다. 능력 경쟁이 아니다.'],
      en: ['Items 1 and 3 are the same pressure in different words. Item 5 links them.', 'The top three stories are all about procurement, not capability.']
    },
    refs: [1, 3, 5]
  };
  t('근거 3건을 든 인사이트는 통과', validateInsight(goodInsight, { articleCount: 6 }).length === 0,
    validateInsight(goodInsight, { articleCount: 6 }).join(' / '));

  /* 인사이트도 2문단 고정이다 — 상한을 열어 두면 상한이 곧 실측 분량이 된다.
     09-01~09-04 네 번의 발행이 전부 3문단을 채워 976~1088자였다. */
  const threeParaInsight = {
    ...goodInsight,
    body: {
      ko: [...goodInsight.body.ko, '셋째 문단이다. 여기가 규격 위반이다.'],
      en: [...goodInsight.body.en, 'Third paragraph. This is the violation.']
    }
  };
  t('인사이트 3문단은 막는다 (2문단 고정)',
    validateInsight(threeParaInsight, { articleCount: 6 }).some((v) => v.includes('3문단')));

  const fourSentInsight = {
    ...goodInsight,
    body: {
      ko: ['1번이다. 3번이다. 5번이다. 넷째 문장이라 규격 위반이다.', goodInsight.body.ko[1]],
      en: goodInsight.body.en
    }
  };
  t('인사이트 한 문단 4문장은 막는다 (3문장 이내)',
    validateInsight(fourSentInsight, { articleCount: 6 }).some((v) => v.includes('4문장')));

  /* 문장은 상한만 규격이다. 인사이트는 실패하면 그날을 통째로 못 내므로 더욱 그렇다. */
  const oneSentInsight = {
    ...goodInsight,
    body: {
      ko: ['1번과 3번과 5번이 한 문장으로 묶인다.', goodInsight.body.ko[1]],
      en: goodInsight.body.en
    }
  };
  t('인사이트 한 문단 1문장은 통과한다',
    validateInsight(oneSentInsight, { articleCount: 6 }).length === 0,
    validateInsight(oneSentInsight, { articleCount: 6 }).join(' / '));

  /* 문단이 줄어도 근거 3건은 그대로다 — 가로질러 읽었다는 증거는 근거의 수다 */
  t('2문단이어도 근거 3건을 요구한다',
    validateInsight({ ...goodInsight, refs: [1, 3] }, { articleCount: 6 }).some((v) => v.includes('refs 가 2건')));

  const twoRefs = { ...goodInsight, refs: [1, 3] };
  t('근거 2건은 막는다 (3건 이상)', validateInsight(twoRefs, { articleCount: 6 }).some((v) => v.includes('refs 가 2건')));

  const ghostRef = { ...goodInsight, refs: [1, 3, 9] };
  t('실리지 않은 기사를 근거로 들면 막는다',
    validateInsight(ghostRef, { articleCount: 6 }).some((v) => v.includes('9 번 기사는')));

  const unmentioned = {
    ...goodInsight,
    body: { ko: ['1번과 3번뿐이다. 다른 이야기는 없다.', '두 번째 문단이다. 여기도 번호가 없다.'], en: goodInsight.body.en },
    refs: [1, 3, 5]
  };
  t('refs 에만 있고 본문에 없는 번호는 막는다',
    validateInsight(unmentioned, { articleCount: 6 }).some((v) => v.includes('한국어 본문에')));

  /* 기사가 2건뿐인 날은 2건이 최대치다 — 없는 기사를 지어내게 하지 않는다 */
  const twoDay = {
    ...goodInsight,
    body: { ko: ['1번과 2번이 겹친다. 그게 오늘이다.', '두 번째 문단이다. 1번이 근거다.'], en: ['Items 1 and 2 overlap. That is today.', 'Second paragraph. Item 1 is the ground.'] },
    refs: [1, 2]
  };
  t('기사가 2건인 날은 근거 2건으로 통과', validateInsight(twoDay, { articleCount: 2 }).length === 0,
    validateInsight(twoDay, { articleCount: 2 }).join(' / '));

  /* ── 브리핑 전체 — 데이터 계약 ──────────────────────────────── */
  const brief = {
    date: '2026-09-01',
    weekday: { ko: '화요일', en: 'Tuesday' },
    type: 'daily',
    note: { ko: '오늘은 2건입니다.', en: 'Today carries 2 stories.' },
    funnel: { collected: 100, window24h: 20, excluded: 5, deduped: 10, fetchFailed: 0, scored: 10, published: 2 },
    insight: goodInsight,
    articles: [
      {
        ...goodArticle(), id: '2026-09-01-01', rank: 1,
        source: '전자신문', sourceType: 'domestic', url: 'https://etnews.com/1',
        publishedAt: '2026-08-31T07:52:26.000Z',
        score: 39, scoreParts: { weight: 0.75, cross: 0, fresh: 0.37 }, crossRefs: []
      },
      {
        ...goodArticle(), id: '2026-09-01-02', rank: 2,
        source: 'ZDNet Korea', sourceType: 'domestic', url: 'https://zdnet.co.kr/2',
        publishedAt: '2026-08-31T06:28:00.000Z',
        score: 38, scoreParts: { weight: 0.75, cross: 0, fresh: 0.31 }, crossRefs: []
      }
    ]
  };
  t('규격을 지킨 브리핑은 위반 0건', validateBrief(brief, CTX).length === 0, validateBrief(brief, CTX).join(' / '));

  const koBrief = koOnly(brief);
  t('한국어만 담은 브리핑도 발행 직전 검사를 통과한다',
    validateBrief(koBrief, KO_ONLY).length === 0, validateBrief(koBrief, KO_ONLY).join(' / '));
  t('같은 브리핑을 한/영 기준으로 보면 막힌다',
    validateBrief(koBrief, CTX).some((v) => v.includes('.en')));

  const badId = JSON.parse(JSON.stringify(brief));
  badId.articles[1].id = '2026-09-01-2';
  t('id 는 <date>-<rank 2자리> 여야 한다', validateBrief(badId, CTX).some((v) => v.includes('2026-09-01-02')));

  const badScore = JSON.parse(JSON.stringify(brief));
  badScore.articles[0].score = 41;
  t('scoreParts 에서 재현되지 않는 점수는 막는다 (P2)',
    validateBrief(badScore, CTX).some((v) => v.includes('재현할 수 없다')));

  const noNote = JSON.parse(JSON.stringify(brief));
  noNote.note = null;
  t('10건 미달인데 note 가 없으면 막는다 (P3)',
    validateBrief(noNote, CTX).some((v) => v.includes('note 가 없다')));

  const wrongFunnel = JSON.parse(JSON.stringify(brief));
  wrongFunnel.funnel.published = 10;
  t('funnel.published 와 실린 건수가 다르면 막는다',
    validateBrief(wrongFunnel, CTX).some((v) => v.includes('funnel.published')));

  /* ── 발행 언어를 줄인 날 — SPEC 5절 언어 스위치 ─────────────── */

  /* 영어를 끄는 것은 규격을 낮추는 것이 아니다. 켠 언어는 예전과 똑같이 검사한다. */
  t('한국어만 발행하는 날 영어 없는 기사는 통과한다',
    validateArticle(koOnly(goodArticle()), KO_ONLY).length === 0,
    validateArticle(koOnly(goodArticle()), KO_ONLY).join(' / '));

  /* 기본값이 느슨한 쪽이면 langs 를 넘기는 것을 잊은 자리마다 게이트가 조용히 열린다 */
  t('langs 를 넘기지 않으면 영어를 그대로 요구한다',
    validateArticle(koOnly(goodArticle()), CTX).some((v) => v.includes('title.en')),
    validateArticle(koOnly(goodArticle()), CTX).join(' / '));

  const koShort = koOnly(goodArticle());
  koShort.summary.ko = ['한 문단뿐이다. 두 문장이 들어 있다.'];
  t('한국어만 발행해도 한국어 규격은 그대로다',
    validateArticle(koShort, KO_ONLY).some((v) => v.includes('1문단')));

  t('missingPairs 는 끈 언어를 찾지 않는다',
    missingPairs({ note: { ko: '있다' } }, '', ['ko']).length === 0);
  t('끈 언어를 켠 것으로 착각하지 않는다 — ko 가 비면 여전히 잡는다',
    missingPairs({ note: { en: 'only english' } }, '', ['ko']).some((m) => m.includes('note.ko')));

  /* cli 경로는 스키마를 강제할 수 없어 "쓰지 말라"고 해도 영어가 딸려 오는 날이 있다.
     검증기는 끈 언어를 보지 않으므로 잘라 내지 않으면 어떤 날만 영어가 있는 briefs.js 가 된다. */
  const pruned = keepLangs(goodArticle(), ['ko']);
  t('keepLangs 가 끈 언어를 잘라 낸다',
    pruned.title.en === undefined && pruned.summary.en === undefined && pruned.implication.en === undefined);
  t('keepLangs 는 켠 언어를 그대로 둔다',
    pruned.title.ko === goodArticle().title.ko && pruned.summary.ko.length === 2);
  t('keepLangs 는 언어 쌍이 아닌 객체를 건드리지 않는다',
    JSON.stringify(keepLangs({ scoreParts: { weight: 0.75, cross: 0, fresh: 0.37 } }, ['ko'])) ===
      JSON.stringify({ scoreParts: { weight: 0.75, cross: 0, fresh: 0.37 } }));

  /* ── 발행 — briefs.js / glossary.js 갱신 ────────────────────── */
  const older = { date: '2026-08-30', articles: [] };
  const merged = mergeBrief([older], brief);
  t('mergeBrief 는 최신순을 유지한다', merged[0].date === '2026-09-01' && merged[1].date === '2026-08-30');

  const replaced = mergeBrief([brief, older], { ...brief, articles: [] });
  t('같은 날짜는 하나뿐이다 (date 가 고유 키)',
    replaced.filter((b) => b.date === '2026-09-01').length === 1 && replaced.length === 2);

  const counted = recountGlossary(
    [{ id: 'sovereign-ai', term: {}, definition: {}, firstSeen: '2020-01-01', count: 99 },
     { id: 'agent', term: {}, definition: {}, firstSeen: '2020-01-01', count: 7 }],
    [brief]
  );
  t('용어 등장 횟수를 briefs 에서 다시 센다',
    counted[0].count === 2 && counted[0].firstSeen === '2026-09-01',
    'count ' + counted[0].count + ' · firstSeen ' + counted[0].firstSeen);
  /* 용어사전은 "브리핑에 등장한 용어"가 쌓이는 곳이다. 0회는 정의상 여기 있을 것이 아니다 */
  t('어느 브리핑도 가리키지 않는 용어는 사전에서 빠진다',
    counted.length === 1 && !counted.some((g) => g.id === 'agent'),
    counted.map((g) => g.id).join(', '));

  const added = addNewTerms(
    [{ id: 'agent' }],
    [{ id: 'agent', term: {}, definition: {}, at: 0 },
     { id: 'World Model', term: {}, definition: {}, at: 1 },
     { id: 'moe-router', term: {}, definition: {}, at: 0 },
     { id: 'fourth', term: {}, definition: {}, at: 1 }],
    '2026-09-01', 2
  );
  const entry = added.glossary.find((g) => g.id === 'world-model');
  t('이미 있는 id 는 다시 넣지 않는다', added.added.every((x) => x.id !== 'agent'));
  t('신규 용어는 하루 2개까지', added.added.length === 2, added.added.map((x) => x.id).join(', '));
  t('id 는 소문자 하이픈으로 정리된다', added.added[0].id === 'world-model', added.added[0].id);
  t('신규 용어의 firstSeen 은 그날', entry && entry.firstSeen === '2026-09-01');
  /* 제안한 기사에 붙이지 않으면 0회 등장으로 사전에서 다시 빠진다 */
  t('제안한 기사의 자리를 함께 돌려준다', added.added[0].at === 1, String(added.added[0].at));

  /* ── 샘플 제거 ──────────────────────────────────────────────── */
  const withSamples = [brief, { date: SAMPLE_DATES[0], articles: [] }, { date: SAMPLE_DATES[1], articles: [] }];
  t('dropSamples 는 샘플만 지우고 실데이터는 남긴다',
    dropSamples(withSamples).length === 1 && dropSamples(withSamples)[0].date === '2026-09-01');
}
