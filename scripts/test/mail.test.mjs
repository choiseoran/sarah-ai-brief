/**
 * Phase 5a 발송 렌더 검증 — SPEC 5절 발송 규격
 *
 * 메일은 발행 뒤 사람이 다시 보지 않는 산출물이다. 화면과 달리 "열어 보니 깨졌다"를
 * 알게 되는 것이 하루 뒤이므로, 여기서는 통과보다 **막아야 할 것을 막는지**를 본다.
 *   - 한국어만 나가는가 (영어는 Phase 5b 의 몫이다)
 *   - 전문이 다 실렸는가 — 요약 문단 하나만 빠져도 메일은 멀쩡해 보인다
 *   - Gmail 이 지우거나 잘라내는 것을 넣지 않았는가
 *
 * SPEC 의 숫자는 lib 에서 import 하지 않고 여기 그대로 적는다 —
 * 상수를 가져오면 상수를 바꾸는 순간 테스트가 따라 움직여 명세 위반을 못 잡는다.
 *
 * nodemailer 도 smtp.mjs 도 import 하지 않는다. 네트워크도 의존성도 없이 돈다.
 */
import { renderBrief, renderFailure, escapeHtml } from '../lib/letter.mjs';
import { loadBriefs, loadMeta, loadGlossary } from '../lib/meta.mjs';

export const name = '발송 렌더 (5절 발송 규격)';

/* SPEC 5절 발송 규격의 숫자 */
const SPEC_WIDTH = 600;          // 본문 폭
const SPEC_SUBJECT_MAX = 78;     // 제목 상한
const SPEC_MAX_BYTES = 95000;    // Gmail 102KB 클리핑 앞의 여유
const SPEC_LOG_TAIL = 40;        // 실패 알림에 붙이는 로그 꼬리 상한

/* Gmail 이 지우거나 무시하는 것들. 하나라도 들어가면 화면과 메일이 달라진다. */
const FORBIDDEN = ['<style', '<link', '<script', 'class=', '<img', 'background-image', '@media'];

/* 영어가 새는지 보려고 심는 표식. ko 에는 절대 넣지 않는다. */
const EN = '__EN_ONLY__';

const META = {
  site: { title: "Sarah's AI Brief", email: 'sarah@insightai.art' },
  sourceTypes: [
    { id: 'primary', label: { ko: '공식', en: 'Primary' }, weight: 1.0 },
    { id: 'domestic', label: { ko: '국내', en: 'Korea' }, weight: 0.75 }
  ],
  topics: [
    { id: 'safety', label: { ko: '안전·정렬', en: 'Safety' } },
    { id: 'compute', label: { ko: '컴퓨팅·인프라', en: 'Compute' } }
  ]
};

const GLOSSARY = [
  { id: 'eval', term: { ko: '평가', en: 'Eval' }, definition: { ko: '모델 능력을 재는 표준화된 시험.', en: EN }, firstSeen: '2026-09-01', count: 1 }
];

function article(i, over = {}) {
  return {
    id: '2026-09-01-0' + i,
    rank: i,
    title: { ko: '기사 제목 ' + i, en: EN + i },
    source: 'Anthropic News',
    sourceType: 'primary',
    url: 'https://example.com/article/' + i,
    publishedAt: '2026-08-31T22:39:50.000Z',
    topic: 'safety',
    score: 65,
    scoreParts: { weight: 1, cross: 0, fresh: 0.99 },
    crossRefs: [{ source: 'VentureBeat', url: 'https://example.com/cross/' + i }],
    summary: { ko: ['첫 문단 ' + i + ' 사실만 적는다.', '둘째 문단 ' + i + ' 여기도 사실이다.'], en: [EN] },
    implication: { ko: '시사점 ' + i + ' 판단은 여기에만 적는다.', en: EN },
    terms: ['eval'],
    ...over
  };
}

function brief(count = 3, over = {}) {
  return {
    date: '2026-09-01',
    weekday: { ko: '화요일', en: 'Tuesday' },
    type: 'daily',
    note: null,
    funnel: { collected: 1693, window24h: 66, excluded: 43, deduped: 40, fetchFailed: 6, scored: 34, published: count },
    insight: {
      title: { ko: '인사이트 제목', en: EN },
      body: { ko: ['인사이트 첫 문단이다.', '인사이트 둘째 문단이다.'], en: [EN] }
    },
    articles: Array.from({ length: count }, (_, i) => article(i + 1)),
    ...over
  };
}

const CTX = { meta: META, glossary: GLOSSARY, siteUrl: null, notice: null };

export function run(t) {
  const r = renderBrief(brief(3), CTX);

  /* ── 언어 — 한국어만 나간다 ─────────────────────────────────── */
  t('영어 문자열이 본문에 섞이지 않는다', !r.html.includes(EN) && !r.text.includes(EN),
    'ko 만 렌더한다');
  t('영어 제목이 메일 제목에 섞이지 않는다', !r.subject.includes(EN));

  /* ── 완전성 — 메일만 읽어도 끝나야 한다 ────────────────────── */
  const b = brief(3);
  t('모든 기사 제목이 들어간다', b.articles.every((a) => r.html.includes(escapeHtml(a.title.ko))));
  t('요약 문단이 하나도 빠지지 않는다',
    b.articles.every((a) => a.summary.ko.every((p) => r.html.includes(escapeHtml(p)))),
    '문단 배열을 통째로 넘기면 여기서 걸린다');
  t('모든 시사점이 들어간다', b.articles.every((a) => r.html.includes(escapeHtml(a.implication.ko))));
  t('인사이트 본문이 문단째 들어간다', b.insight.body.ko.every((p) => r.html.includes(escapeHtml(p))));
  t('원문 링크가 기사 수만큼 있다',
    b.articles.every((a) => r.html.includes('href="' + a.url + '"')));
  t('교차 보도 링크가 들어간다', r.html.includes('https://example.com/cross/1'));
  t('요약과 시사점이 다른 블록으로 갈린다 (P1)',
    r.html.includes('이 기사가 시사하는 점') && r.html.includes('요약'));

  /* 용어 정의를 메일 안에 담는다 — 사이트 링크가 없을 수 있다 */
  t('쓰인 용어의 정의가 본문에 실린다', r.html.includes('모델 능력을 재는 표준화된 시험.'));
  const unknown = renderBrief(brief(1, { articles: [article(1, { terms: ['없는용어'] })] }), CTX);
  t('용어사전에 없는 id 는 조용히 건너뛴다', !unknown.html.includes('undefined'));

  /* note 는 있을 때만 */
  t('note 가 없으면 알림 상자를 만들지 않는다', !r.html.includes('알림'));
  const noted = renderBrief(brief(3, { note: { ko: '국내 매체 부족으로 9건입니다.', en: EN } }), CTX);
  t('note 가 있으면 본문에 나온다', noted.html.includes('국내 매체 부족으로 9건입니다.'));

  /* ── HTML 위생 — Gmail 이 지우는 것을 쓰지 않는다 ──────────── */
  for (const bad of FORBIDDEN) {
    t('금지: ' + bad, !r.html.includes(bad));
  }
  t('본문 폭이 ' + SPEC_WIDTH + 'px 이다', r.html.includes('max-width:' + SPEC_WIDTH + 'px'));
  t('charset 이 utf-8 이다', r.html.includes('<meta charset="utf-8">'));
  const hrefs = [...r.html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  t('모든 링크가 절대 주소다', hrefs.length > 0 && hrefs.every((h) => /^https?:\/\//.test(h)),
    hrefs.length + '개');

  /* ── 이스케이프 — 제목·요약은 모델이 만든 문자열이다 ───────── */
  const nasty = renderBrief(brief(1, {
    articles: [article(1, { title: { ko: '<script>alert(1)</script> A & B "인용"', en: EN } })]
  }), CTX);
  t('태그가 그대로 새지 않는다', !nasty.html.includes('<script>alert(1)</script>'));
  t('&lt; 로 이스케이프된다', nasty.html.includes('&lt;script&gt;'));
  t('& 가 이스케이프된다', nasty.html.includes('A &amp; B'));
  t('따옴표가 이스케이프된다', nasty.html.includes('&quot;인용&quot;'));

  /* ── 크기 — Gmail 은 102KB 를 넘으면 잘라낸다 ──────────────── */
  const full = renderBrief(brief(10), CTX);
  const approx = Math.round((Buffer.byteLength(full.html + full.text, 'utf8') * 4) / 3);
  t('기사 10건이 ' + SPEC_MAX_BYTES + '바이트 안에 들어간다 (base64 근사)',
    approx < SPEC_MAX_BYTES, approx + '바이트');

  /* ── text/plain 대체본 ─────────────────────────────────────── */
  t('대체본에 HTML 태그가 없다', !/<\/?[a-z][^>]*>/i.test(r.text));
  t('대체본에 기사 번호가 순서대로 있다',
    r.text.indexOf('[1]') >= 0 && r.text.indexOf('[1]') < r.text.indexOf('[2]') && r.text.indexOf('[2]') < r.text.indexOf('[3]'));
  t('대체본에 모든 원문 주소가 있다', b.articles.every((a) => r.text.includes(a.url)));
  t('대체본에 인사이트 전문이 있다', b.insight.body.ko.every((p) => r.text.includes(p)));

  /* ── 제목 ──────────────────────────────────────────────────── */
  t('제목에 날짜가 있다', r.subject.startsWith('2026-09-01'));
  t('제목에 건수가 있다', r.subject.includes('3건'));
  t('제목에 인사이트 제목이 있다', r.subject.includes('인사이트 제목'));
  const longTitle = renderBrief(brief(3, {
    insight: { title: { ko: '가'.repeat(200), en: EN }, body: { ko: ['본문'], en: [EN] } }
  }), CTX);
  t('제목이 ' + SPEC_SUBJECT_MAX + '자를 넘지 않는다', longTitle.subject.length <= SPEC_SUBJECT_MAX,
    longTitle.subject.length + '자');
  t('제목이 잘려도 날짜는 남는다', longTitle.subject.startsWith('2026-09-01'));

  /* ── 사이트 링크는 설정됐을 때만 ───────────────────────────── */
  t('siteUrl 이 없으면 사이트 링크를 넣지 않는다', !r.html.includes('brief.html?d='));
  const linked = renderBrief(brief(3), { ...CTX, siteUrl: 'https://example.dev/' });
  t('siteUrl 이 있으면 그날 브리핑 주소가 붙는다',
    linked.html.includes('https://example.dev/brief.html?d=2026-09-01'));

  /* ── 주간 회고 ─────────────────────────────────────────────── */
  const weekly = renderBrief({
    date: '2026-08-30',
    weekday: { ko: '일요일', en: 'Sunday' },
    type: 'weekly',
    note: null,
    funnel: { collected: 0, published: 0 },
    insight: { title: { ko: '주간 제목', en: EN }, body: { ko: ['주간 본문'], en: [EN] } },
    articles: [],
    weekly: { sections: [{ title: { ko: '섹션 제목', en: EN }, body: { ko: '섹션 본문이다.', en: EN }, refs: [{ date: '2026-08-28', articleId: '2026-08-28-03' }] }] }
  }, CTX);
  t('주간 회고가 예외 없이 렌더된다', weekly.html.length > 0 && weekly.subject.includes('2026-08-30'));
  t('주간 섹션의 제목과 본문이 들어간다',
    weekly.html.includes('섹션 제목') && weekly.html.includes('섹션 본문이다.'));
  t("주간에는 '오늘의 기사' 라벨이 나오지 않는다", !weekly.html.includes('오늘의 기사'));
  t("주간 인사이트 라벨이 '이번 주를 관통한 것' 이다", weekly.html.includes('이번 주를 관통한 것'));

  /* ── 경고 배너 — 브리핑은 나왔는데 뒤 단계가 실패한 날 ─────── */
  const warned = renderBrief(brief(3), { ...CTX, notice: { step: 'push', code: 1 } });
  t('경고 배너에 단계 이름이 한국어로 나온다', warned.html.includes('푸시 단계가 종료 코드 1'));
  t('경고가 있어도 전문은 그대로 실린다',
    b.articles.every((a) => warned.html.includes(escapeHtml(a.title.ko))));

  /* ── 실패 알림 ─────────────────────────────────────────────── */
  const tail = Array.from({ length: 60 }, (_, i) => '2026-09-01 08:0' + (i % 10) + ':00  줄 ' + i);
  const fail = renderFailure({ date: '2026-09-01', step: 'summarize', code: 1, logTail: tail }, CTX);
  t('실패 제목에 표식과 날짜가 있다',
    fail.subject.startsWith('[발행 실패]') && fail.subject.includes('2026-09-01'));
  t('실패 본문에 단계 이름이 한국어로 나온다', fail.html.includes('요약 생성'));
  t('실패 본문에 종료 코드가 있다', fail.html.includes('종료 코드 1'));
  t('로그 꼬리가 ' + SPEC_LOG_TAIL + '줄을 넘지 않는다',
    fail.html.includes('줄 59') && !fail.html.includes('줄 19'), '마지막 ' + SPEC_LOG_TAIL + '줄만');
  const dirty = renderFailure({ date: '2026-09-01', step: 'collect', code: 2, logTail: ['<b>깨진 줄</b>'] }, CTX);
  t('로그 꼬리도 이스케이프된다', !dirty.html.includes('<b>깨진 줄</b>') && dirty.html.includes('&lt;b&gt;'));
  const noStep = renderFailure({ date: '2026-09-01', code: 9 }, CTX);
  t('단계를 몰라도 렌더된다', noStep.subject.includes('2026-09-01') && noStep.html.length > 0);

  /* ── 순수성 — 시각·난수가 섞이면 재현이 깨진다 ─────────────── */
  t('두 번 불러도 결과가 같다',
    JSON.stringify(renderBrief(brief(3), CTX)) === JSON.stringify(renderBrief(brief(3), CTX)));

  /* ── 실제 데이터 — 픽스처가 통과해도 진짜 브리핑은 틀릴 수 있다 ── */
  const real = loadBriefs()[0];
  if (real) {
    const ctx = { meta: loadMeta(), glossary: loadGlossary(), siteUrl: null, notice: null };
    const rr = renderBrief(real, ctx);
    const bytes = Math.round((Buffer.byteLength(rr.html + rr.text, 'utf8') * 4) / 3);
    t('실제 브리핑(' + real.date + ')이 크기 상한 안에 들어간다', bytes < SPEC_MAX_BYTES, bytes + '바이트');
    t('실제 브리핑의 요약 문단이 하나도 빠지지 않는다',
      (real.articles ?? []).every((a) => (a.summary?.ko ?? []).every((p) => rr.html.includes(escapeHtml(p)))));
    t('실제 브리핑에 영어가 섞이지 않는다',
      (real.articles ?? []).every((a) => !a.title?.en || !rr.html.includes(escapeHtml(a.title.en))));
    t('실제 브리핑 제목이 상한을 지킨다', rr.subject.length <= SPEC_SUBJECT_MAX, rr.subject.length + '자');
  }
}
