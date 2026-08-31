/**
 * Sarah's AI Brief — 공통 셸
 * 언어/테마 상태, 헤더·푸터, URL 유틸, 포맷터, 데이터 조회.
 * 페이지별 렌더링은 pages.js 가 맡는다.
 */
(function () {
  'use strict';

  window.SAB = window.SAB || {};

  /* ==========================================================
     1. UI 문자열
     ========================================================== */

  var I18N = {
    ko: {
      'nav.today': '오늘의 브리핑',
      'nav.archive': '지난 브리핑',
      'nav.topics': '주제별',
      'nav.data': '데이터',
      'nav.glossary': '용어사전',
      'nav.about': '소개',

      'a11y.skip': '본문으로 건너뛰기',
      'a11y.theme': '테마 전환',
      'a11y.lang': '언어 선택',
      'a11y.nav': '주요 메뉴',

      'banner.demo.strong': '샘플 데이터입니다.',
      'banner.demo.text': '아래 기사는 구조 확인용 예시이며 실제 보도된 내용이 아닙니다. 출처 링크는 각 매체 홈으로 연결됩니다.',

      'brief.today': '오늘의 브리핑',
      'brief.archived': '지난 브리핑',
      'brief.insight': '오늘의 인사이트',
      'brief.weeklyInsight': '이번 주를 관통한 것',
      'brief.weekly': '주간 회고',
      'brief.publishedAt': '오전 8시 발행',
      'brief.articles': '오늘의 기사',
      'brief.count': '{n}건',
      'brief.notice': '알림',
      'brief.prev': '이전 브리핑',
      'brief.next': '다음 브리핑',
      'brief.recent': '최근 브리핑',
      'brief.viewAll': '전체 보기',
      'brief.notFound': '그 날짜의 브리핑이 없습니다',
      'brief.notFoundBody': '주소를 다시 확인하시거나 지난 브리핑 목록에서 찾아보세요.',

      'block.summary': '요약',
      'block.implication': '이 기사가 시사하는 점',
      'block.crossrefs': '같은 사건 다른 매체',
      'block.terms': '용어',
      'block.score': '선정 점수',
      'block.original': '원문 보기',

      'archive.title': '지난 브리핑',
      'archive.lede': '발행한 모든 브리핑은 날짜별 고유 주소로 영구 보관합니다. 삭제하지 않습니다.',
      'archive.short': '10건 미달',

      'topics.title': '주제별',
      'topics.lede': '모든 기사는 12개 주제 중 하나에 속합니다. 주제를 선택하면 전체 기간의 기사를 모아 봅니다.',
      'topics.all': '전체',
      'topics.empty': '이 주제로 분류된 기사가 아직 없습니다.',
      'topics.notFound': '그런 주제는 없습니다.',
      'topics.articleCount': '{n}건',

      'data.title': '데이터',
      'data.lede': '선정 기준을 적어두는 것만으로는 그 기준이 실제로 어떻게 작동했는지 알 수 없습니다. 그래서 매일 무엇을 훑었고 어디에서 얼마나 걸러졌는지 공개합니다.',
      'data.caveat': '이 숫자는 AI 업계 전체의 보도량이 아니라 이 사이트가 무엇을 골랐는지에 대한 기록입니다. 특정 매체가 적게 실렸다는 것이 그 매체의 품질을 뜻하지 않습니다.',
      'data.funnel': '수집에서 발행까지',
      'data.funnelNote': '가장 최근 발행일 기준입니다. 각 단계에서 몇 건이 빠졌는지 그대로 적었습니다.',
      'data.sources': '매체별 분포',
      'data.sourcesNote': '발행된 모든 브리핑에 실린 기사를 매체별로 셌습니다. 한 출처는 하루 최대 3건까지만 실립니다.',
      'data.topics': '주제 분포',
      'data.topicsNote': '기사는 12개 주제 중 하나에 속합니다.',
      'data.terms': '용어 누적',
      'data.termsNote': '브리핑에 등장해 용어사전에 쌓인 용어입니다. 상위 10개.',
      'data.showTable': '표로 보기',
      'data.hideTable': '표 닫기',
      'data.days': '발행일',
      'data.totalArticles': '실린 기사',
      'data.shortDays': '10건 미달일',
      'data.avgPerDay': '하루 평균',
      'data.unitDays': '일',
      'data.unitItems': '건',
      'data.colSource': '매체',
      'data.colTopic': '주제',
      'data.colTerm': '용어',
      'data.colCount': '건수',
      'data.colShare': '비율',
      'data.colStage': '단계',
      'data.colRemain': '남은 건수',
      'data.colDrop': '감소',

      'funnel.collected': '피드에서 수집',
      'funnel.window24h': '최근 24시간',
      'funnel.afterExcluded': '제외 필터 통과',
      'funnel.deduped': '중복 묶음 후',
      'funnel.scored': '원문 확보 성공',
      'funnel.published': '발행',

      'glossary.title': '용어사전',
      'glossary.lede': '브리핑에 나온 어려운 용어가 여기에 쌓입니다. 처음 등장한 날짜와 지금까지 나온 횟수를 함께 적습니다.',
      'glossary.firstSeen': '첫 등장',
      'glossary.count': '{n}회 등장',
      'glossary.count1': '1회 등장',

      'about.title': '소개',

      'sub.title': '매일 아침 8시, 메일로 받아보세요',
      'sub.body': '무료입니다. 유료 등급도, 광고도, 협찬 기사도 없습니다. 이메일 주소는 브리핑 발송에만 씁니다.',
      'sub.placeholder': '이메일 주소',
      'sub.button': '구독하기',
      'sub.pending': '아직 구독 접수를 받지 않습니다. 구독 기능은 준비 중이며, 지금은 RSS로 구독하실 수 있습니다.',
      'sub.fine': '언제든 해지할 수 있습니다. 주소를 제3자에게 제공하거나 판매하지 않습니다.',

      'footer.brief': '브리핑',
      'footer.about': '이 사이트',
      'footer.subscribe': '구독',
      'footer.rss': 'RSS 피드',
      'footer.email': '오류 제보',
      'footer.independence': '어떤 매체나 기업으로부터도 대가를 받지 않습니다. 광고, 협찬 기사, 제휴 링크가 없습니다.',
      'footer.copyright': '기사 원문의 저작권은 각 언론사에 있습니다. 이 사이트는 자체 요약과 시사점만 싣습니다.',

      'lang.switchTo': 'English'
    },

    en: {
      'nav.today': 'Today',
      'nav.archive': 'Archive',
      'nav.topics': 'Topics',
      'nav.data': 'Data',
      'nav.glossary': 'Glossary',
      'nav.about': 'About',

      'a11y.skip': 'Skip to content',
      'a11y.theme': 'Toggle theme',
      'a11y.lang': 'Select language',
      'a11y.nav': 'Main',

      'banner.demo.strong': 'This is sample data.',
      'banner.demo.text': 'The items below are placeholders for checking the structure, not real reporting. Source links go to each outlet’s home page.',

      'brief.today': 'Today’s briefing',
      'brief.archived': 'Archived briefing',
      'brief.insight': 'Today’s insight',
      'brief.weeklyInsight': 'What ran through the week',
      'brief.weekly': 'Weekly review',
      'brief.publishedAt': 'Published 8am KST',
      'brief.articles': 'Today’s stories',
      'brief.count': '{n} items',
      'brief.notice': 'Note',
      'brief.prev': 'Previous',
      'brief.next': 'Next',
      'brief.recent': 'Recent briefings',
      'brief.viewAll': 'See all',
      'brief.notFound': 'No briefing for that date',
      'brief.notFoundBody': 'Check the address, or find it in the archive.',

      'block.summary': 'Summary',
      'block.implication': 'What this suggests',
      'block.crossrefs': 'Also covered by',
      'block.terms': 'Terms',
      'block.score': 'Score',
      'block.original': 'Read the original',

      'archive.title': 'Archive',
      'archive.lede': 'Every briefing keeps a permanent address of its own. Nothing is deleted.',
      'archive.short': 'under 10',

      'topics.title': 'Topics',
      'topics.lede': 'Every story belongs to exactly one of twelve topics. Pick one to see it across the whole archive.',
      'topics.all': 'All',
      'topics.empty': 'Nothing filed under this topic yet.',
      'topics.notFound': 'No such topic.',
      'topics.articleCount': '{n} items',

      'data.title': 'Data',
      'data.lede': 'Writing down selection criteria tells you nothing about how they actually behaved. So every day we publish what was scanned and where it got filtered out.',
      'data.caveat': 'These numbers record what this site selected — not how much the AI industry was covered overall. A publication appearing rarely says nothing about its quality.',
      'data.funnel': 'From feeds to published',
      'data.funnelNote': 'Most recent publication day. Each stage shows how many items dropped out.',
      'data.sources': 'By publication',
      'data.sourcesNote': 'Counted across every published briefing. No single source runs more than three items in a day.',
      'data.topics': 'By topic',
      'data.topicsNote': 'Every story belongs to exactly one of twelve topics.',
      'data.terms': 'Glossary terms by frequency',
      'data.termsNote': 'Terms that appeared in briefings and accumulated in the glossary. Top ten.',
      'data.showTable': 'Show table',
      'data.hideTable': 'Hide table',
      'data.days': 'Days published',
      'data.totalArticles': 'Stories run',
      'data.shortDays': 'Days under 10',
      'data.avgPerDay': 'Average per day',
      'data.unitDays': '',
      'data.unitItems': '',
      'data.colSource': 'Publication',
      'data.colTopic': 'Topic',
      'data.colTerm': 'Term',
      'data.colCount': 'Count',
      'data.colShare': 'Share',
      'data.colStage': 'Stage',
      'data.colRemain': 'Remaining',
      'data.colDrop': 'Dropped',

      'funnel.collected': 'Collected from feeds',
      'funnel.window24h': 'Within 24 hours',
      'funnel.afterExcluded': 'Passed exclusion filter',
      'funnel.deduped': 'After grouping duplicates',
      'funnel.scored': 'Full text retrieved',
      'funnel.published': 'Published',

      'glossary.title': 'Glossary',
      'glossary.lede': 'Difficult terms from the briefings accumulate here, with the date each first appeared and how often it has come up since.',
      'glossary.firstSeen': 'First seen',
      'glossary.count': 'appeared {n} times',
      'glossary.count1': 'appeared once',

      'about.title': 'About',

      'sub.title': 'Get it in your inbox at 8am',
      'sub.body': 'Free. No paid tier, no ads, no sponsored items. Your address is used only to send the briefing.',
      'sub.placeholder': 'Email address',
      'sub.button': 'Subscribe',
      'sub.pending': 'Subscriptions are not open yet. The mailing feature is still being built — for now you can subscribe by RSS.',
      'sub.fine': 'Unsubscribe any time. We never share or sell your address.',

      'footer.brief': 'Briefings',
      'footer.about': 'This site',
      'footer.subscribe': 'Subscribe',
      'footer.rss': 'RSS feed',
      'footer.email': 'Report an error',
      'footer.independence': 'We take no payment from any publication or company. No ads, no sponsored items, no affiliate links.',
      'footer.copyright': 'Copyright in the original articles rests with each publisher. This site carries only its own summaries and commentary.',

      'lang.switchTo': '한국어'
    }
  };

  /* ==========================================================
     2. 상태 — 언어와 테마
     ========================================================== */

  var LANG_KEY = 'sab.lang';
  var THEME_KEY = 'sab.theme';
  var state = { lang: 'ko', theme: null };

  /* localStorage 는 사생활 보호 모드나 사이트 데이터 차단 시 접근 자체가 던진다 */
  function storeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* 저장 못 해도 동작은 한다 */ }
  }

  function readParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) { return null; }
  }

  function resolveLang() {
    var q = readParam('lang');
    if (q === 'en' || q === 'ko') return q;
    var saved = storeGet(LANG_KEY);
    if (saved === 'en' || saved === 'ko') return saved;
    var nav = (navigator.language || 'ko').toLowerCase();
    return nav.indexOf('ko') === 0 ? 'ko' : 'en';
  }

  function resolveTheme() {
    var saved = storeGet(THEME_KEY);
    return (saved === 'dark' || saved === 'light') ? saved : null;
  }

  function applyTheme() {
    if (state.theme) document.documentElement.setAttribute('data-theme', state.theme);
    else document.documentElement.removeAttribute('data-theme');
  }

  function currentThemeIsDark() {
    if (state.theme) return state.theme === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /* ==========================================================
     3. 유틸
     ========================================================== */

  function t(key, vars) {
    var dict = I18N[state.lang] || I18N.ko;
    var s = dict[key];
    if (s === undefined) s = key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split('{' + k + '}').join(String(vars[k]));
      });
    }
    return s;
  }

  /** {ko, en} 쌍에서 현재 언어를 꺼낸다. 문자열이면 그대로 돌려준다. */
  function L(pair) {
    if (pair === null || pair === undefined) return '';
    if (typeof pair === 'string') return pair;
    return pair[state.lang] !== undefined ? pair[state.lang] : (pair.ko || pair.en || '');
  }

  /** 요소 생성기. 텍스트는 항상 textContent 로 넣는다. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  /** 'YYYY-MM-DD' 를 그 날짜 그대로 표시한다(시간대 이동 없이). */
  function formatDate(dateStr, style) {
    var parts = String(dateStr).split('-');
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    var opts = style === 'short'
      ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
      : { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat(state.lang === 'ko' ? 'ko-KR' : 'en-US', opts).format(d);
  }

  /** UTC ISO 문자열을 한국 시각으로 표시한다. */
  function formatDateTime(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return new Intl.DateTimeFormat(state.lang === 'ko' ? 'ko-KR' : 'en-US', {
      month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit',
      timeZone: 'Asia/Seoul'
    }).format(d) + ' KST';
  }

  function numberFmt(n) {
    return new Intl.NumberFormat(state.lang === 'ko' ? 'ko-KR' : 'en-US').format(n);
  }

  /** 내부 링크에 현재 언어를 붙인다. 영어일 때만 붙여 한국어 주소를 깨끗하게 둔다. */
  function withLang(href) {
    if (state.lang !== 'en') return href;
    if (/^(https?:|mailto:|#)/.test(href)) return href;
    return href + (href.indexOf('?') === -1 ? '?' : '&') + 'lang=en';
  }

  /* ==========================================================
     4. 데이터 조회
     ========================================================== */

  var data = {
    briefs: function () { return SAB.briefs || []; },
    /** 실제 기사가 실린 브리핑만. 주간 회고는 제외한다. */
    dailyBriefs: function () {
      return data.briefs().filter(function (b) { return b.type !== 'weekly'; });
    },
    latest: function () { return data.briefs()[0] || null; },
    byDate: function (date) {
      return data.briefs().filter(function (b) { return b.date === date; })[0] || null;
    },
    neighbours: function (date) {
      var all = data.briefs();
      var i = all.findIndex(function (b) { return b.date === date; });
      return { newer: i > 0 ? all[i - 1] : null, older: i >= 0 && i < all.length - 1 ? all[i + 1] : null };
    },
    allArticles: function () {
      var out = [];
      data.briefs().forEach(function (b) {
        (b.articles || []).forEach(function (a) {
          out.push({ article: a, brief: b });
        });
      });
      return out;
    },
    topic: function (id) {
      return (SAB.meta.topics || []).filter(function (x) { return x.id === id; })[0] || null;
    },
    sourceType: function (id) {
      return (SAB.meta.sourceTypes || []).filter(function (x) { return x.id === id; })[0] || null;
    },
    term: function (id) {
      return (SAB.glossary || []).filter(function (x) { return x.id === id; })[0] || null;
    },
    feedByName: function (name) {
      return (SAB.meta.feeds || []).filter(function (f) { return f.name === name; })[0] || null;
    },
    /** 값이 큰 순으로 [{key, count}] */
    tally: function (items, keyFn) {
      var map = new Map();
      items.forEach(function (x) {
        var k = keyFn(x);
        if (k === null || k === undefined) return;
        map.set(k, (map.get(k) || 0) + 1);
      });
      return Array.from(map, function (e) { return { key: e[0], count: e[1] }; })
        .sort(function (a, b) { return b.count - a.count; });
    }
  };

  /* ==========================================================
     5. 공통 조각 렌더
     ========================================================== */

  var NAV = [
    { href: 'index.html', key: 'nav.today' },
    { href: 'archive.html', key: 'nav.archive' },
    { href: 'topics.html', key: 'nav.topics' },
    { href: 'data.html', key: 'nav.data' },
    { href: 'glossary.html', key: 'nav.glossary' },
    { href: 'about.html', key: 'nav.about' }
  ];

  function currentPage() {
    var path = window.location.pathname.split('/').pop();
    return path === '' ? 'index.html' : path;
  }

  function svgIcon(name) {
    var paths = {
      sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2 12h2.4M19.6 12H22M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/>',
      moon: '<path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2z"/>'
    };
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paths[name];
    return svg;
  }

  function renderHeader(host) {
    var page = currentPage();

    var nav = el('nav', { class: 'site-nav', 'aria-label': t('a11y.nav') }, [
      el('ul', {}, NAV.map(function (item) {
        var isCurrent = item.href === page;
        return el('li', {}, [
          el('a', {
            href: withLang(item.href),
            text: t(item.key),
            'aria-current': isCurrent ? 'page' : null
          })
        ]);
      }))
    ]);

    var langToggle = el('div', { class: 'lang-toggle', role: 'group', 'aria-label': t('a11y.lang') }, [
      el('button', {
        type: 'button', text: 'KO', 'aria-pressed': state.lang === 'ko' ? 'true' : 'false',
        onclick: function () { setLang('ko'); }
      }),
      el('button', {
        type: 'button', text: 'EN', 'aria-pressed': state.lang === 'en' ? 'true' : 'false',
        onclick: function () { setLang('en'); }
      })
    ]);

    var themeBtn = el('button', {
      type: 'button', class: 'icon-btn', title: t('a11y.theme'), 'aria-label': t('a11y.theme'),
      onclick: function () {
        state.theme = currentThemeIsDark() ? 'light' : 'dark';
        storeSet(THEME_KEY, state.theme);
        applyTheme();
        render();
      }
    }, [svgIcon(currentThemeIsDark() ? 'sun' : 'moon')]);

    clear(host);
    host.appendChild(el('div', { class: 'wrap site-header__bar' }, [
      el('a', { class: 'wordmark', href: withLang('index.html') }, [
        el('span', { class: 'wordmark__name', text: SAB.meta.site.title }),
        el('span', { class: 'wordmark__sub', text: L(SAB.meta.site.tagline) })
      ]),
      nav,
      el('div', { class: 'header-tools' }, [langToggle, themeBtn])
    ]));
  }

  function renderBanner(host) {
    clear(host);
    host.appendChild(el('div', { class: 'wrap' }, [
      el('p', {}, [
        el('strong', { text: t('banner.demo.strong') }),
        ' ',
        t('banner.demo.text')
      ])
    ]));
  }

  function renderFooter(host) {
    var site = SAB.meta.site;
    clear(host);
    host.appendChild(el('div', { class: 'wrap' }, [
      el('div', { class: 'site-footer__grid' }, [
        el('div', {}, [
          el('h3', { text: t('footer.brief') }),
          el('ul', {}, [
            el('li', {}, [el('a', { href: withLang('index.html'), text: t('nav.today') })]),
            el('li', {}, [el('a', { href: withLang('archive.html'), text: t('nav.archive') })]),
            el('li', {}, [el('a', { href: withLang('topics.html'), text: t('nav.topics') })])
          ])
        ]),
        el('div', {}, [
          el('h3', { text: t('footer.about') }),
          el('ul', {}, [
            el('li', {}, [el('a', { href: withLang('about.html'), text: t('nav.about') })]),
            el('li', {}, [el('a', { href: withLang('data.html'), text: t('nav.data') })]),
            el('li', {}, [el('a', { href: withLang('glossary.html'), text: t('nav.glossary') })])
          ])
        ]),
        el('div', {}, [
          el('h3', { text: t('footer.subscribe') }),
          el('ul', {}, [
            el('li', {}, [el('a', { href: site.rss, text: t('footer.rss') })]),
            el('li', {}, [el('a', { href: 'mailto:' + site.email, text: t('footer.email') })])
          ])
        ])
      ]),
      el('div', { class: 'site-footer__bottom' }, [
        el('p', { text: t('footer.independence') }),
        el('p', { text: t('footer.copyright') }),
        el('p', { text: '© 2026 ' + site.title })
      ])
    ]));
  }

  /** 구독 블록. Phase 5에서 이 폼의 submit 을 구독 API로 보낸다. */
  function subscribeBlock() {
    var result = el('p', { class: 'subscribe__result', role: 'status', hidden: true });
    var form = el('form', {
      novalidate: true,
      onsubmit: function (e) {
        e.preventDefault();
        /* TODO(Phase 5): 여기서 구독 API로 POST 한다.
           fetch('/api/subscribe', { method:'POST', body: JSON.stringify({ email, lang: state.lang }) }) */
        result.textContent = t('sub.pending');
        result.hidden = false;
      }
    }, [
      el('input', { type: 'email', name: 'email', required: true, placeholder: t('sub.placeholder'), 'aria-label': t('sub.placeholder') }),
      el('button', { type: 'submit', class: 'btn', text: t('sub.button') })
    ]);

    return el('section', { class: 'subscribe' }, [
      el('h2', { text: t('sub.title') }),
      el('p', { text: t('sub.body') }),
      form,
      result,
      el('p', { class: 'subscribe__fine', text: t('sub.fine') })
    ]);
  }

  /* ==========================================================
     6. 렌더 진입점
     ========================================================== */

  function setLang(lang) {
    if (lang === state.lang) return;
    state.lang = lang;
    storeSet(LANG_KEY, lang);
    /* 영어판은 고유 주소를 갖는다 */
    try {
      var url = new URL(window.location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      window.history.replaceState({}, '', url);
    } catch (e) { /* file:// 등에서 실패해도 렌더는 계속한다 */ }
    render();
  }

  /** [data-lang] 요소는 현재 언어일 때만 보인다 (소개 페이지 본문용) */
  function applyLangVisibility(root) {
    (root || document).querySelectorAll('[data-lang]').forEach(function (node) {
      node.hidden = node.getAttribute('data-lang') !== state.lang;
    });
  }

  function render() {
    document.documentElement.lang = state.lang;

    var skip = document.getElementById('skip-link');
    if (skip) skip.textContent = t('a11y.skip');

    var header = document.getElementById('site-header');
    var banner = document.getElementById('demo-banner');
    var footer = document.getElementById('site-footer');
    if (header) renderHeader(header);
    if (banner) renderBanner(banner);
    if (footer) renderFooter(footer);

    var pageFn = SAB.page;
    if (typeof pageFn === 'function') pageFn();

    applyLangVisibility(document);
    updateTitle();
  }

  var baseTitle = null;
  function updateTitle() {
    if (baseTitle === null) baseTitle = document.title;
    var h1 = document.querySelector('main h1');
    var name = SAB.meta.site.title;
    document.title = h1 && h1.textContent ? h1.textContent.trim() + ' — ' + name : baseTitle;
  }

  function init() {
    state.lang = resolveLang();
    state.theme = resolveTheme();
    applyTheme();
    render();
  }

  /* ==========================================================
     7. 공개 API
     ========================================================== */

  SAB.app = {
    t: t, L: L, el: el, clear: clear,
    lang: function () { return state.lang; },
    withLang: withLang,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    numberFmt: numberFmt,
    readParam: readParam,
    data: data,
    subscribeBlock: subscribeBlock,
    render: render,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
