/**
 * Phase 5a · 브리핑 → 메일 한 통 (SPEC 5절 발송 규격)
 *
 * 순수 렌더러다. 네트워크도 파일도 현재 시각도 읽지 않는다 — 필요한 것은 전부 인자로 받는다.
 * smtp.mjs 와 nodemailer 를 import 하지 않는 것이 이 파일의 존재 이유다. 덕분에
 * mail.test.mjs 가 의존성 0으로 렌더 전체를 검사할 수 있다(run.mjs 헤더의 약속).
 *
 * 사이트 CSS 를 재사용하지 않는 이유 — assets/css/style.css 는 CSS 변수와 클래스 위에
 * 서 있는데 Gmail 은 <head> 의 <style> 을 지운다. 그래서 색 값만 옮겨 적고 나머지는
 * 인라인 style 속성으로만 쓴다. 미디어쿼리도 의사클래스도 쓸 수 없다.
 *
 * 배경색을 준 요소에는 반드시 글자색도 함께 준다. Gmail 안드로이드가 색을 강제로
 * 반전할 때 한쪽만 지정돼 있으면 흰 바탕에 흰 글씨가 된다.
 */
import { kstStamp } from './time.mjs';

/* SPEC 5절 발송 규격 */
export const MAIL_WIDTH = 600;
export const SUBJECT_MAX = 78;
export const LOG_TAIL_MAX = 40;

/* daily.ps1 이 넘기는 ASCII 토큰 → 사람이 읽는 이름.
   PowerShell → cmd → Node 로 넘어가는 명령줄에 공백 있는 한국어를 실으면
   코드페이지와 인용부호가 동시에 걸린다. 그래서 경계에서는 ASCII 만 오간다. */
export const STEP_LABEL = {
  collect: '수집',
  summarize: '요약 생성',
  commit: '커밋',
  push: '푸시'
};

/* 단계마다 "이게 무슨 뜻인가"를 한 줄로. 로그를 열지 않고도 판단할 수 있어야 한다. */
const STEP_NOTE = {
  collect: '피드 수집에서 멈췄습니다. 상대 매체 사정이거나 네트워크 문제일 수 있습니다.',
  summarize: '요약 생성에서 멈췄습니다. 인사이트가 규격을 끝내 통과하지 못하면 그날은 발행하지 않습니다 (SPEC 5절).',
  commit: '데이터는 만들어졌지만 커밋이 실패했습니다. 저장소 상태를 확인하세요.',
  push: '커밋까지는 됐고 푸시가 실패했습니다. 커밋은 남아 있으니 다음 실행에서 함께 올라갑니다.'
};

/* assets/css/style.css 1절 토큰에서 값만 옮겨 왔다. 파일을 공유하지 않으므로
   사이트 색을 바꾸면 여기도 같이 바꿔야 한다. 대신 메일이 CSS 에 의존하지 않는다. */
const C = {
  page: '#f2f0ea',
  card: '#faf9f7',
  text: '#1a1a17',
  text2: '#55534c',
  muted: '#86837a',
  line: '#e3e0d8',
  accent: '#a8391a',
  accentSoft: '#f7ece7',
  accentLine: '#e5c4b6',
  warnBg: '#fdf3e3',
  warnLine: '#e8d4ad',
  warnText: '#7a5a19'
};

/* Pretendard 를 뺀 사이트 폰트 스택. 메일에 웹폰트를 싣지 않는다. */
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Malgun Gothic','Apple SD Gothic Neo',sans-serif";
const MONO = "ui-monospace,'Cascadia Mono','Consolas','D2Coding',monospace";

/* assets/js/app.js 의 I18N.ko 와 짝을 맞춘다. 브라우저 IIFE 라 import 할 수 없어
   같은 말을 다시 적는다. 사이트의 문구를 바꾸면 여기도 바꾼다. */
const T = {
  insight: '오늘의 인사이트',
  weeklyInsight: '이번 주를 관통한 것',
  weekly: '주간 회고',
  articles: '오늘의 기사',
  notice: '알림',
  summary: '요약',
  implication: '이 기사가 시사하는 점',
  crossrefs: '같은 사건 다른 매체',
  terms: '용어',
  score: '선정 점수',
  original: '원문 보기',
  publishedAt: '오전 8시 발행',
  independence: '어떤 매체나 기업으로부터도 대가를 받지 않습니다. 광고, 협찬 기사, 제휴 링크가 없습니다.',
  copyright: '기사 원문의 저작권은 각 언론사에 있습니다. 이 사이트는 자체 요약과 시사점만 싣습니다.'
};

/* ── 작은 도구들 ───────────────────────────────────────────────────── */

/** 제목·요약은 모델이 만든 문자열이다. 신뢰하지 않고 전부 여기를 통과시킨다. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** {ko, en} 에서 한국어만. 영어 발송은 SPEC 10절 Phase 5b 의 몫이다. */
function ko(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return value.ko ?? '';
}

function labelOf(list, id) {
  const hit = (list ?? []).find((x) => x.id === id);
  return hit ? ko(hit.label) : id ?? '';
}

/** 링크로 쓸 수 있는 주소만 통과시킨다. 상대 경로는 메일에서 의미가 없다. */
function safeUrl(url) {
  return /^https?:\/\//i.test(String(url ?? '')) ? String(url) : null;
}

function clip(text, max) {
  const s = String(text ?? '');
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

/** 요약·인사이트 본문은 {ko: [문단, …]} 이고 시사점은 {ko: '한 문단'} 이다. 둘 다 받는다. */
function paras(value) {
  const v = ko(value);
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return v ? [String(v)] : [];
}

/* ── 스타일 조각 ───────────────────────────────────────────────────── */

const S = {
  h2: `margin:28px 0 10px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${C.accent};`,
  h3: `margin:0 0 6px;font-size:18px;line-height:1.45;font-weight:700;color:${C.text};`,
  p: `margin:0 0 10px;font-size:15px;line-height:1.75;color:${C.text};`,
  meta: `margin:0 0 12px;font-size:12px;line-height:1.6;color:${C.muted};`,
  label: `margin:0 0 4px;font-size:11px;letter-spacing:.06em;color:${C.text2};`,
  link: `color:${C.accent};text-decoration:underline;`
};

function pHtml(text, style) {
  return `<p style="${style ?? S.p}">${escapeHtml(text)}</p>`;
}

/* ── 기사 ──────────────────────────────────────────────────────────── */

function articleHtml(article, ctx, index) {
  const out = [];
  const rank = String(article.rank ?? index + 1).padStart(2, '0');
  const chips = [rank, labelOf(ctx.meta?.topics, article.topic), labelOf(ctx.meta?.sourceTypes, article.sourceType)]
    .filter(Boolean).join(' · ');

  out.push(`<div style="border-top:1px solid ${C.line};padding:20px 0 4px;">`);
  out.push(pHtml(chips, `margin:0 0 8px;font-size:11px;letter-spacing:.06em;color:${C.accent};`));

  const url = safeUrl(article.url);
  const title = escapeHtml(ko(article.title));
  out.push(url
    ? `<h3 style="${S.h3}"><a href="${escapeHtml(url)}" style="${S.link}">${title}</a></h3>`
    : `<h3 style="${S.h3}">${title}</h3>`);

  const meta = [article.source, article.publishedAt ? kstStamp(article.publishedAt) : '',
    article.score !== undefined ? `${T.score} ${article.score}` : ''].filter(Boolean).join(' · ');
  out.push(pHtml(meta, S.meta));

  out.push(pHtml(T.summary, S.label));
  for (const para of paras(article.summary)) out.push(pHtml(para));

  /* 요약(사실)과 시사점(판단)은 다른 필드다(P1). 화면에서 그렇듯 메일에서도 눈으로 갈려야 한다. */
  out.push(`<div style="background:${C.accentSoft};color:${C.text};border-left:3px solid ${C.accentLine};padding:12px 14px;margin:14px 0;">`);
  out.push(pHtml(T.implication, `margin:0 0 4px;font-size:11px;letter-spacing:.06em;color:${C.accent};`));
  out.push(pHtml(ko(article.implication), `margin:0;font-size:15px;line-height:1.75;color:${C.text};`));
  out.push('</div>');

  const refs = (article.crossRefs ?? []).map((ref) => {
    const refUrl = safeUrl(ref.url);
    const name = escapeHtml(ref.source);
    return refUrl ? `<a href="${escapeHtml(refUrl)}" style="${S.link}">${name}</a>` : name;
  });
  if (refs.length) {
    out.push(`<p style="${S.meta}">${escapeHtml(T.crossrefs)} · ${refs.join(' · ')}</p>`);
  }

  if (url) {
    out.push(`<p style="${S.meta}"><a href="${escapeHtml(url)}" style="${S.link}">→ ${escapeHtml(T.original)}</a></p>`);
  }
  out.push('</div>');
  return out.join('');
}

/* ── 용어 ──────────────────────────────────────────────────────────── */

/**
 * 그날 기사가 가리킨 용어의 정의를 메일 안에 담는다.
 * 사이트 링크가 없을 수도 있으므로(공개 주소가 아직 없다) 정의를 밖에 두면 읽을 방법이 없다.
 */
function termsHtml(brief, ctx) {
  const used = [];
  for (const article of brief.articles ?? []) {
    for (const id of article.terms ?? []) if (!used.includes(id)) used.push(id);
  }
  const entries = used
    .map((id) => (ctx.glossary ?? []).find((g) => g.id === id))
    .filter(Boolean);
  if (!entries.length) return '';

  const out = [`<h2 style="${S.h2}">${escapeHtml(T.terms)}</h2>`];
  for (const entry of entries) {
    out.push(`<p style="${S.p}"><strong>${escapeHtml(ko(entry.term))}</strong> — ${escapeHtml(ko(entry.definition))}</p>`);
  }
  return out.join('');
}

/* ── 껍데기 ────────────────────────────────────────────────────────── */

function page(subject, inner) {
  return [
    '<!doctype html><html lang="ko"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">',
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin:0;padding:0;background:${C.page};color:${C.text};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">`,
    '<tr><td align="center" style="padding:24px 12px;">',
    `<div style="max-width:${MAIL_WIDTH}px;width:100%;text-align:left;background:${C.card};color:${C.text};border:1px solid ${C.line};padding:28px 24px;font-family:${FONT};">`,
    inner,
    '</div></td></tr></table></body></html>'
  ].join('');
}

function noticeHtml(notice) {
  if (!notice) return '';
  const label = STEP_LABEL[notice.step] ?? notice.step;
  const text = `${label} 단계가 종료 코드 ${notice.code} 로 실패했습니다. 브리핑 자체는 만들어졌고 이 메일의 내용은 그대로입니다.`;
  return `<div style="background:${C.warnBg};color:${C.warnText};border:1px solid ${C.warnLine};padding:12px 14px;margin:0 0 20px;">`
    + pHtml(text, `margin:0;font-size:13px;line-height:1.7;color:${C.warnText};`)
    + '</div>';
}

function footerHtml(brief, ctx) {
  const out = [`<div style="border-top:1px solid ${C.line};margin-top:28px;padding-top:16px;">`];
  const funnel = brief.funnel;
  if (funnel) {
    out.push(pHtml(`수집 ${funnel.collected} → 발행 ${funnel.published}`, S.meta));
  }
  const base = ctx.siteUrl ? String(ctx.siteUrl).replace(/\/+$/, '') : null;
  if (base && safeUrl(base)) {
    const href = `${base}/brief.html?d=${brief.date}`;
    out.push(`<p style="${S.meta}"><a href="${escapeHtml(href)}" style="${S.link}">웹에서 보기</a></p>`);
  }
  out.push(pHtml(T.independence, S.meta));
  out.push(pHtml(T.copyright, S.meta));
  out.push('</div>');
  return out.join('');
}

/* ── 본문 ──────────────────────────────────────────────────────────── */

function subjectFor(brief) {
  const weekly = brief.type === 'weekly';
  const day = ko(brief.weekday).slice(0, 1);
  const head = day ? `${brief.date} (${day})` : brief.date;
  const kind = weekly ? T.weekly : `AI 브리핑 ${(brief.articles ?? []).length}건`;
  const title = ko(brief.insight?.title);
  /* 날짜를 맨 앞에 둔다. 78자에서 잘려도 날짜는 남아야 하고, Gmail 이 날짜별로 다른
     스레드로 잡는다. */
  return clip(title ? `${head} ${kind} — ${title}` : `${head} ${kind}`, SUBJECT_MAX);
}

/**
 * 브리핑 한 건을 메일 한 통으로.
 *
 * 같은 입력에 같은 출력이어야 한다 — 시각·난수를 섞지 않는다. 그래야 테스트가
 * 두 번 불러 비교할 수 있고, 이 저장소가 결정성을 다뤄 온 방식과도 같다.
 */
export function renderBrief(brief, ctx = {}) {
  const weekly = brief.type === 'weekly';
  const subject = subjectFor(brief);
  const site = ko(ctx.meta?.site?.title) || "Sarah's AI Brief";
  const out = [];

  out.push(noticeHtml(ctx.notice));
  out.push(pHtml(site, `margin:0 0 4px;font-size:13px;letter-spacing:.06em;color:${C.accent};`));
  const count = weekly ? T.weekly : `기사 ${(brief.articles ?? []).length}건`;
  out.push(pHtml(`${brief.date} ${ko(brief.weekday)} · ${count} · ${T.publishedAt}`, S.meta));

  if (ko(brief.note)) {
    out.push(`<div style="background:${C.warnBg};color:${C.warnText};border:1px solid ${C.warnLine};padding:12px 14px;margin:0 0 20px;">`);
    out.push(pHtml(T.notice, `margin:0 0 4px;font-size:11px;letter-spacing:.06em;color:${C.warnText};`));
    out.push(pHtml(ko(brief.note), `margin:0;font-size:13px;line-height:1.7;color:${C.warnText};`));
    out.push('</div>');
  }

  if (brief.insight) {
    out.push(`<h2 style="${S.h2}">${escapeHtml(weekly ? T.weeklyInsight : T.insight)}</h2>`);
    out.push(pHtml(ko(brief.insight.title), S.h3));
    for (const para of paras(brief.insight.body)) out.push(pHtml(para));
  }

  if (weekly) {
    for (const section of brief.weekly?.sections ?? []) {
      out.push(`<div style="border-top:1px solid ${C.line};padding:20px 0 4px;">`);
      out.push(pHtml(ko(section.title), S.h3));
      for (const para of paras(section.body)) out.push(pHtml(para));
      const refs = (section.refs ?? []).map((r) => `${r.date} ${String(r.articleId ?? '').slice(-2)}번`);
      if (refs.length) out.push(pHtml(refs.join(' · '), S.meta));
      out.push('</div>');
    }
  } else if ((brief.articles ?? []).length) {
    out.push(`<h2 style="${S.h2}">${escapeHtml(T.articles)}</h2>`);
    brief.articles.forEach((article, i) => out.push(articleHtml(article, ctx, i)));
    out.push(termsHtml(brief, ctx));
  }

  out.push(footerHtml(brief, ctx));
  return { subject, refId: brief.date, html: page(subject, out.join('')), text: briefText(brief, ctx, subject) };
}

/**
 * text/plain 대체본은 전문이 아니라 목차다.
 *
 * 한글은 base64 로도 4/3 배로 부푼다. HTML 전문과 text 전문을 함께 실으면 Gmail 이
 * 잘라내는 102KB 에 닿는다(SPEC 5절 발송 규격의 95KB 상한). Gmail 은 항상 HTML 을
 * 보여주므로 "메일만 읽어도 끝난다"는 HTML 파트가 지킨다. 잘려서 아무것도 못 읽는
 * 것보다 요약을 한쪽에만 싣는 편이 낫다.
 */
function briefText(brief, ctx, subject) {
  const weekly = brief.type === 'weekly';
  const lines = [subject, ''];
  const count = weekly ? T.weekly : `기사 ${(brief.articles ?? []).length}건`;
  lines.push(`${brief.date} ${ko(brief.weekday)} · ${count} · ${T.publishedAt}`, '');

  if (ctx.notice) {
    const label = STEP_LABEL[ctx.notice.step] ?? ctx.notice.step;
    lines.push(`[${T.notice}] ${label} 단계가 종료 코드 ${ctx.notice.code} 로 실패했습니다.`, '');
  }
  if (ko(brief.note)) lines.push(`[${T.notice}] ${ko(brief.note)}`, '');

  if (brief.insight) {
    lines.push(weekly ? T.weeklyInsight : T.insight, ko(brief.insight.title), '');
    for (const para of paras(brief.insight.body)) lines.push(para, '');
  }

  if (weekly) {
    for (const section of brief.weekly?.sections ?? []) {
      lines.push(ko(section.title), '');
      for (const para of paras(section.body)) lines.push(para, '');
    }
  } else {
    (brief.articles ?? []).forEach((article, i) => {
      lines.push(`[${i + 1}] ${ko(article.title)}`);
      const meta = [article.source, labelOf(ctx.meta?.sourceTypes, article.sourceType),
        article.publishedAt ? kstStamp(article.publishedAt) : '',
        article.score !== undefined ? `${T.score} ${article.score}` : ''].filter(Boolean).join(' · ');
      lines.push(`    ${meta}`);
      lines.push(`    ${T.implication}: ${ko(article.implication)}`);
      if (safeUrl(article.url)) lines.push(`    ${T.original}: ${article.url}`);
      lines.push('');
    });
    lines.push('요약 전문은 HTML 본문에 있습니다. 메일 크기를 아끼려고 이 대체본에는 싣지 않습니다.', '');
  }

  const base = ctx.siteUrl ? String(ctx.siteUrl).replace(/\/+$/, '') : null;
  if (base && safeUrl(base)) lines.push(`웹에서 보기: ${base}/brief.html?d=${brief.date}`, '');
  lines.push(T.independence, T.copyright);
  return lines.join('\n');
}

/* ── 실패 알림 ─────────────────────────────────────────────────────── */

/**
 * 그날 브리핑이 없을 때 보내는 짧은 메일.
 *
 * 메일이 안 오는 것으로는 "발행이 실패했다"와 "메일만 실패했다"를 구분할 수 없다.
 * 그래서 실패한 날에도 한 통은 온다.
 */
export function renderFailure(info, ctx = {}) {
  const label = STEP_LABEL[info.step] ?? info.step ?? '알 수 없는 단계';
  const subject = clip(`[발행 실패] ${info.date} · ${label}`, SUBJECT_MAX);
  const site = ko(ctx.meta?.site?.title) || "Sarah's AI Brief";
  const tail = (info.logTail ?? []).slice(-LOG_TAIL_MAX);

  const out = [];
  out.push(pHtml(site, `margin:0 0 4px;font-size:13px;letter-spacing:.06em;color:${C.accent};`));
  out.push(pHtml(`${info.date} 브리핑을 발행하지 못했습니다.`, S.h3));
  out.push(`<div style="background:${C.warnBg};color:${C.warnText};border:1px solid ${C.warnLine};padding:12px 14px;margin:12px 0 16px;">`);
  out.push(pHtml(`멈춘 단계 — ${label} (종료 코드 ${info.code ?? '?'})`, `margin:0 0 6px;font-size:14px;line-height:1.7;color:${C.warnText};`));
  if (STEP_NOTE[info.step]) {
    out.push(pHtml(STEP_NOTE[info.step], `margin:0;font-size:13px;line-height:1.7;color:${C.warnText};`));
  }
  out.push('</div>');

  if (tail.length) {
    out.push(pHtml(`runs/daily.log 마지막 ${tail.length}줄`, S.label));
    out.push(`<div style="background:${C.page};color:${C.text2};border:1px solid ${C.line};padding:12px 14px;margin:0 0 16px;font-family:${MONO};font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;">`);
    out.push(escapeHtml(tail.join('\n')));
    out.push('</div>');
  }

  out.push(pHtml('손으로 다시 돌리려면 저장소에서 아래를 실행하세요.', S.meta));
  out.push(`<div style="background:${C.page};color:${C.text2};border:1px solid ${C.line};padding:10px 12px;font-family:${MONO};font-size:12px;">node scripts/collect.mjs &amp;&amp; node scripts/summarize.mjs</div>`);

  const text = [
    subject, '',
    `${info.date} 브리핑을 발행하지 못했습니다.`,
    `멈춘 단계 — ${label} (종료 코드 ${info.code ?? '?'})`,
    STEP_NOTE[info.step] ?? '', '',
    tail.length ? `runs/daily.log 마지막 ${tail.length}줄` : '',
    ...tail, '',
    '손으로 다시 돌리려면: node scripts/collect.mjs && node scripts/summarize.mjs'
  ].filter((line, i, all) => !(line === '' && all[i - 1] === '')).join('\n');

  return { subject, refId: info.date + '-fail', html: page(subject, out.join('')), text };
}
