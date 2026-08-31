/**
 * Sarah's AI Brief — 페이지 렌더러
 * 각 HTML은 마지막에 SAB.page = SAB.pages.<이름> 을 지정한다.
 */
(function () {
  'use strict';

  var A = SAB.app;
  var t = A.t, L = A.L, el = A.el, clear = A.clear, D = A.data;

  function host() { return document.getElementById('page'); }

  /* ==========================================================
     공용 조각
     ========================================================== */

  function pageHead(eyebrow, title, lede) {
    return el('header', { class: 'page-head' }, [
      eyebrow ? el('p', { class: 'page-head__eyebrow', text: eyebrow }) : null,
      el('h1', { text: title }),
      lede ? el('p', { class: 'page-head__lede', text: lede }) : null
    ]);
  }

  function topicChip(topicId, asLink) {
    var topic = D.topic(topicId);
    if (!topic) return null;
    var label = L(topic.label);
    return asLink
      ? el('a', { class: 'chip', href: A.withLang('topics.html?t=' + topicId), text: label })
      : el('span', { class: 'chip', text: label });
  }

  function sourceTypeChip(typeId) {
    var st = D.sourceType(typeId);
    if (!st) return null;
    return el('span', {
      class: 'chip chip--type' + (typeId === 'primary' ? ' chip--primary' : ''),
      text: L(st.label)
    });
  }

  function termChips(ids) {
    if (!ids || !ids.length) return null;
    var chips = ids.map(function (id) {
      var term = D.term(id);
      if (!term) return null;
      return el('a', {
        class: 'chip',
        href: A.withLang('glossary.html#' + id),
        text: L(term.term)
      });
    }).filter(Boolean);
    if (!chips.length) return null;
    return el('div', { class: 'terms' }, [el('span', { class: 'terms__label', text: t('block.terms') })].concat(chips));
  }

  function paragraphs(list) {
    return (list || []).map(function (p) { return el('p', { text: p }); });
  }

  /** 기사 카드. compact 는 주제 페이지에서 요약을 한 문단만 보여줄 때 쓴다. */
  function articleCard(article, opts) {
    opts = opts || {};
    var meta = [];

    meta.push(el('span', { text: article.source }));
    meta.push(el('span', { class: 'sep', text: '·' }));
    meta.push(el('span', { text: A.formatDateTime(article.publishedAt) }));
    if (opts.briefDate) {
      meta.push(el('span', { class: 'sep', text: '·' }));
      meta.push(el('a', {
        href: A.withLang('brief.html?d=' + opts.briefDate),
        text: A.formatDate(opts.briefDate)
      }));
    }
    meta.push(el('span', { class: 'sep', text: '·' }));
    meta.push(el('span', { class: 'article__score', text: t('block.score') + ' ' + article.score }));

    var summaryList = opts.compact
      ? (L(article.summary) || []).slice(0, 1)
      : L(article.summary);

    var crossRefs = null;
    if (!opts.compact && article.crossRefs && article.crossRefs.length) {
      var refNodes = [];
      article.crossRefs.forEach(function (ref, i) {
        if (i) refNodes.push(el('span', { class: 'sep', text: '·' }));
        refNodes.push(el('a', { href: ref.url, target: '_blank', rel: 'noopener', text: ref.source }));
      });
      crossRefs = el('p', { class: 'crossrefs' },
        [el('span', { class: 'crossrefs__label', text: t('block.crossrefs') })].concat(refNodes));
    }

    return el('article', { class: 'article', id: article.id }, [
      el('div', { class: 'article__top' }, [
        el('span', { class: 'article__rank', text: String(article.rank).padStart(2, '0') }),
        topicChip(article.topic, true),
        sourceTypeChip(article.sourceType)
      ]),
      el('h3', { class: 'article__title' }, [
        el('a', { href: article.url, target: '_blank', rel: 'noopener', title: t('block.original') }, [
          L(article.title),
          el('span', { class: 'ext', text: '↗', 'aria-hidden': 'true' })
        ])
      ]),
      el('p', { class: 'article__meta' }, meta),
      el('div', { class: 'block' }, [
        el('p', { class: 'block__label', text: t('block.summary') })
      ].concat(paragraphs(summaryList))),
      el('div', { class: 'block block--implication' }, [
        el('p', { class: 'block__label', text: t('block.implication') }),
        el('p', { text: L(article.implication) })
      ]),
      crossRefs,
      opts.compact ? null : termChips(article.terms)
    ]);
  }

  /* ==========================================================
     오늘의 브리핑 / 날짜별 브리핑
     ========================================================== */

  function renderBrief(options) {
    options = options || {};
    var root = host();
    if (!root) return;
    clear(root);

    var brief;
    if (options.byParam) {
      var date = A.readParam('d');
      brief = date ? D.byDate(date) : D.latest();
      if (!brief) {
        root.appendChild(pageHead(null, t('brief.notFound')));
        root.appendChild(el('div', { class: 'empty-state' }, [
          el('p', { text: t('brief.notFoundBody') }),
          el('p', { style: 'margin-top:14px' }, [
            el('a', { href: A.withLang('archive.html'), text: t('nav.archive') })
          ])
        ]));
        return;
      }
    } else {
      brief = D.latest();
      if (!brief) return;
    }

    var isLatest = D.latest() && brief.date === D.latest().date;
    var isWeekly = brief.type === 'weekly';

    /* 머리 */
    var head = el('header', { class: 'page-head' }, [
      el('p', {
        class: 'page-head__eyebrow',
        text: isWeekly ? t('brief.weekly') : (isLatest ? t('brief.today') : t('brief.archived'))
      }),
      el('h1', { class: 'brief-date' }, [
        A.formatDate(brief.date),
        el('span', { class: 'brief-date__weekday', text: L(brief.weekday) })
      ]),
      el('p', { class: 'brief-meta' }, [
        el('span', { text: t('brief.publishedAt') }),
        !isWeekly ? el('span', { class: 'brief-meta__dot', text: '·' }) : null,
        !isWeekly ? el('span', { text: t('brief.count', { n: brief.articles.length }) }) : null
      ].filter(Boolean))
    ]);
    root.appendChild(head);

    /* 미달 사유 등 알림 */
    if (brief.note) {
      root.appendChild(el('div', { class: 'notice' }, [
        el('span', { class: 'notice__label', text: t('brief.notice') }),
        el('span', { text: L(brief.note) })
      ]));
    }

    /* 인사이트 */
    root.appendChild(el('section', { class: 'insight' }, [
      el('p', { class: 'insight__label', text: isWeekly ? t('brief.weeklyInsight') : t('brief.insight') }),
      el('h2', { text: L(brief.insight.title) })
    ].concat(paragraphs(L(brief.insight.body)))));

    /* 본문 */
    if (isWeekly && brief.weekly) {
      var weekly = el('section', { class: 'articles' }, [
        el('div', { class: 'articles__heading' }, [
          el('span', { text: t('brief.weekly') })
        ])
      ]);
      brief.weekly.sections.forEach(function (sec) {
        var refs = (sec.refs || []).map(function (ref) {
          return el('a', {
            class: 'ref-link',
            href: A.withLang('brief.html?d=' + ref.date + '#' + ref.articleId),
            text: A.formatDate(ref.date, 'short')
          });
        });
        weekly.appendChild(el('div', { class: 'weekly-section' }, [
          el('h3', { text: L(sec.title) }),
          el('p', { text: L(sec.body) }),
          refs.length ? el('div', { class: 'weekly-refs' }, refs) : null
        ]));
      });
      root.appendChild(weekly);
    } else if (brief.articles.length) {
      var list = el('section', { class: 'articles' }, [
        el('div', { class: 'articles__heading' }, [
          el('span', { text: t('brief.articles') }),
          el('span', { class: 'articles__count', text: t('brief.count', { n: brief.articles.length }) })
        ])
      ]);
      brief.articles.forEach(function (a) { list.appendChild(articleCard(a)); });
      root.appendChild(list);
    }

    /* 앞뒤 브리핑 */
    var near = D.neighbours(brief.date);
    if (near.newer || near.older) {
      root.appendChild(el('nav', { class: 'weekly-refs', style: 'margin-top:28px' }, [
        near.older ? el('a', {
          class: 'ref-link', href: A.withLang('brief.html?d=' + near.older.date),
          text: '← ' + t('brief.prev') + ' · ' + A.formatDate(near.older.date, 'short')
        }) : null,
        near.newer ? el('a', {
          class: 'ref-link', href: A.withLang('brief.html?d=' + near.newer.date),
          text: t('brief.next') + ' · ' + A.formatDate(near.newer.date, 'short') + ' →'
        }) : null
      ].filter(Boolean)));
    }

    /* 최근 브리핑 (오늘 페이지에서만) */
    if (!options.byParam) {
      var recent = D.briefs().slice(1, 4);
      if (recent.length) {
        var recentBox = el('section', { class: 'articles', style: 'margin-top:46px' }, [
          el('div', { class: 'articles__heading' }, [
            el('span', { text: t('brief.recent') }),
            el('a', { class: 'articles__count', href: A.withLang('archive.html'), text: t('brief.viewAll') })
          ])
        ]);
        recent.forEach(function (b) { recentBox.appendChild(briefRow(b)); });
        root.appendChild(recentBox);
      }
    }

    root.appendChild(A.subscribeBlock());
  }

  /* ==========================================================
     지난 브리핑
     ========================================================== */

  function briefRow(brief) {
    var isWeekly = brief.type === 'weekly';
    var count = brief.articles.length;
    var badge = null;
    if (isWeekly) badge = el('span', { class: 'badge badge--weekly', text: t('brief.weekly') });
    else if (count < 10) badge = el('span', { class: 'badge badge--short', text: t('archive.short') });

    return el('a', { class: 'brief-row', href: A.withLang('brief.html?d=' + brief.date) }, [
      el('span', { class: 'brief-row__date', text: brief.date }),
      el('span', { class: 'brief-row__title' }, [
        L(brief.insight.title),
        el('span', { class: 'brief-row__wd', text: L(brief.weekday) })
      ]),
      el('span', { class: 'brief-row__count' }, [
        badge || el('span', { text: t('brief.count', { n: count }) })
      ])
    ]);
  }

  function renderArchive() {
    var root = host();
    if (!root) return;
    clear(root);

    root.appendChild(pageHead(null, t('archive.title'), t('archive.lede')));

    var groups = new Map();
    D.briefs().forEach(function (b) {
      var key = b.date.slice(0, 7);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    });

    groups.forEach(function (list, key) {
      /* '2026년 8월 1일' → '2026년 8월', 'August 1, 2026' → 'August 2026' */
      var label = A.formatDate(key + '-01').replace(/\s*\d+일$/, '').replace(/\s\d+,/, '');
      var group = el('section', { class: 'month-group' }, [
        el('h2', { class: 'month-group__title', text: label })
      ]);
      list.forEach(function (b) { group.appendChild(briefRow(b)); });
      root.appendChild(group);
    });

    root.appendChild(A.subscribeBlock());
  }

  /* ==========================================================
     주제별
     ========================================================== */

  function renderTopics() {
    var root = host();
    if (!root) return;
    clear(root);

    var selected = A.readParam('t');
    var counts = D.tally(D.allArticles(), function (x) { return x.article.topic; });
    var countMap = new Map(counts.map(function (c) { return [c.key, c.count]; }));

    root.appendChild(pageHead(null, t('topics.title'), t('topics.lede')));

    var grid = el('div', { class: 'topic-grid' });
    grid.appendChild(el('a', {
      class: 'topic-card', href: A.withLang('topics.html'),
      'aria-current': selected ? null : 'true'
    }, [
      el('span', { class: 'topic-card__name', text: t('topics.all') }),
      el('span', { class: 'topic-card__count', text: t('topics.articleCount', { n: D.allArticles().length }) })
    ]));

    SAB.meta.topics.forEach(function (topic) {
      grid.appendChild(el('a', {
        class: 'topic-card',
        href: A.withLang('topics.html?t=' + topic.id),
        'aria-current': selected === topic.id ? 'true' : null
      }, [
        el('span', { class: 'topic-card__name', text: L(topic.label) }),
        el('span', { class: 'topic-card__desc', text: L(topic.description) }),
        el('span', { class: 'topic-card__count', text: t('topics.articleCount', { n: countMap.get(topic.id) || 0 }) })
      ]));
    });
    root.appendChild(grid);

    var items = D.allArticles();
    var heading = t('topics.all');

    if (selected) {
      var topic = D.topic(selected);
      if (!topic) {
        root.appendChild(el('div', { class: 'empty-state' }, [el('p', { text: t('topics.notFound') })]));
        return;
      }
      heading = L(topic.label);
      items = items.filter(function (x) { return x.article.topic === selected; });
    }

    var list = el('section', { class: 'articles' }, [
      el('div', { class: 'articles__heading' }, [
        el('span', { text: heading }),
        el('span', { class: 'articles__count', text: t('topics.articleCount', { n: items.length }) })
      ])
    ]);

    if (!items.length) {
      list.appendChild(el('div', { class: 'empty-state' }, [el('p', { text: t('topics.empty') })]));
    } else {
      items.forEach(function (x) {
        list.appendChild(articleCard(x.article, { compact: true, briefDate: x.brief.date }));
      });
    }
    root.appendChild(list);
  }

  /* ==========================================================
     데이터
     ========================================================== */

  /** 단일 계열 가로 막대. 길이가 값이고, 색은 하나다. */
  function barChart(rows, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    var total = rows.reduce(function (s, r) { return s + r.value; }, 0);

    var chart = el('div', { class: 'chart' });
    rows.forEach(function (r) {
      var pct = (r.value / max) * 100;
      var share = total ? Math.round((r.value / total) * 1000) / 10 : 0;
      var label = r.href
        ? el('span', { class: 'bar-row__label' }, [el('a', { href: r.href, text: r.label })])
        : el('span', { class: 'bar-row__label', text: r.label, title: r.label });

      chart.appendChild(el('div', {
        class: 'bar-row',
        title: r.label + ' — ' + A.numberFmt(r.value) + (opts.unit || '') + (total ? ' (' + share + '%)' : '')
      }, [
        label,
        el('div', { class: 'bar-row__track' }, [
          el('div', { class: 'bar-row__fill', style: 'width:' + pct.toFixed(1) + '%' })
        ]),
        el('span', { class: 'bar-row__value' }, [
          A.numberFmt(r.value),
          opts.unit ? el('span', { class: 'unit', text: opts.unit }) : null
        ].filter(Boolean))
      ]));
    });
    return chart;
  }

  /** 색에만 의존하지 않도록 모든 차트에 표를 함께 둔다. */
  function tableFor(rows, headers, opts) {
    opts = opts || {};
    var total = rows.reduce(function (s, r) { return s + r.value; }, 0);
    var body = rows.map(function (r) {
      return el('tr', {}, [
        el('td', { text: r.label }),
        el('td', { class: 'num', text: A.numberFmt(r.value) }),
        opts.share !== false
          ? el('td', { class: 'num', text: total ? (Math.round((r.value / total) * 1000) / 10) + '%' : '—' })
          : null
      ].filter(Boolean));
    });

    var wrap = el('div', { class: 'data-table-wrap', hidden: true }, [
      el('table', { class: 'data-table' }, [
        el('thead', {}, [el('tr', {}, headers.map(function (h, i) {
          return el('th', { text: h, class: i ? 'num' : null });
        }))]),
        el('tbody', {}, body)
      ])
    ]);

    var toggle = el('button', {
      type: 'button', class: 'chart-table-toggle', text: t('data.showTable'),
      'aria-expanded': 'false',
      onclick: function () {
        var open = wrap.hidden;
        wrap.hidden = !open;
        toggle.textContent = open ? t('data.hideTable') : t('data.showTable');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });

    return [toggle, wrap];
  }

  function panel(title, note, children) {
    return el('section', { class: 'panel' }, [
      el('h2', { text: title }),
      note ? el('p', { class: 'panel__note', text: note }) : null
    ].concat(children));
  }

  function renderData() {
    var root = host();
    if (!root) return;
    clear(root);

    root.appendChild(pageHead(null, t('data.title'), t('data.lede')));
    root.appendChild(el('div', { class: 'notice' }, [
      el('span', { class: 'notice__label', text: t('brief.notice') }),
      el('span', { text: t('data.caveat') })
    ]));

    var daily = D.dailyBriefs();
    var all = D.allArticles();
    var shortDays = daily.filter(function (b) { return b.articles.length < 10; }).length;
    var avg = daily.length ? Math.round((all.length / daily.length) * 10) / 10 : 0;

    /* 요약 수치 */
    root.appendChild(el('div', { class: 'stat-row' }, [
      el('div', { class: 'stat' }, [
        el('p', { class: 'stat__label', text: t('data.days') }),
        el('p', { class: 'stat__value', text: A.numberFmt(daily.length) })
      ]),
      el('div', { class: 'stat' }, [
        el('p', { class: 'stat__label', text: t('data.totalArticles') }),
        el('p', { class: 'stat__value', text: A.numberFmt(all.length) })
      ]),
      el('div', { class: 'stat' }, [
        el('p', { class: 'stat__label', text: t('data.shortDays') }),
        el('p', { class: 'stat__value', text: A.numberFmt(shortDays) }),
        el('p', { class: 'stat__sub', text: t('archive.short') })
      ]),
      el('div', { class: 'stat' }, [
        el('p', { class: 'stat__label', text: t('data.avgPerDay') }),
        el('p', { class: 'stat__value', text: String(avg) })
      ])
    ]));

    /* 퍼널 — 가장 최근 발행일 */
    var latest = daily[0];
    if (latest && latest.funnel) {
      var f = latest.funnel;
      var stages = [
        { label: t('funnel.collected'), value: f.collected },
        { label: t('funnel.window24h'), value: f.window24h },
        { label: t('funnel.afterExcluded'), value: f.window24h - f.excluded },
        { label: t('funnel.deduped'), value: f.deduped },
        { label: t('funnel.scored'), value: f.scored },
        { label: t('funnel.published'), value: f.published }
      ];
      var fMax = stages[0].value || 1;

      var funnelChart = el('div', { class: 'chart' });
      stages.forEach(function (s, i) {
        var drop = i === 0 ? null : stages[i - 1].value - s.value;
        funnelChart.appendChild(el('div', {
          class: 'funnel-row',
          title: s.label + ' — ' + A.numberFmt(s.value) + (drop ? ' (−' + A.numberFmt(drop) + ')' : '')
        }, [
          el('span', { class: 'funnel-row__label' }, [
            el('span', { class: 'step', text: String(i + 1) + '.' }),
            s.label,
            drop ? el('span', { class: 'funnel-row__drop', text: '−' + A.numberFmt(drop) }) : null
          ].filter(Boolean)),
          el('div', { class: 'bar-row__track' }, [
            el('div', { class: 'bar-row__fill', style: 'width:' + ((s.value / fMax) * 100).toFixed(1) + '%' })
          ]),
          el('span', { class: 'bar-row__value', text: A.numberFmt(s.value) })
        ]));
      });

      var funnelRows = stages.map(function (s, i) {
        return { label: s.label, value: s.value, drop: i === 0 ? 0 : stages[i - 1].value - s.value };
      });
      var funnelTable = el('div', { class: 'data-table-wrap', hidden: true }, [
        el('table', { class: 'data-table' }, [
          el('thead', {}, [el('tr', {}, [
            el('th', { text: t('data.colStage') }),
            el('th', { class: 'num', text: t('data.colRemain') }),
            el('th', { class: 'num', text: t('data.colDrop') })
          ])]),
          el('tbody', {}, funnelRows.map(function (r) {
            return el('tr', {}, [
              el('td', { text: r.label }),
              el('td', { class: 'num', text: A.numberFmt(r.value) }),
              el('td', { class: 'num', text: r.drop ? '−' + A.numberFmt(r.drop) : '—' })
            ]);
          }))
        ])
      ]);
      var funnelToggle = el('button', {
        type: 'button', class: 'chart-table-toggle', text: t('data.showTable'), 'aria-expanded': 'false',
        onclick: function () {
          var open = funnelTable.hidden;
          funnelTable.hidden = !open;
          funnelToggle.textContent = open ? t('data.hideTable') : t('data.showTable');
          funnelToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      });

      root.appendChild(panel(
        t('data.funnel'),
        t('data.funnelNote') + ' (' + A.formatDate(latest.date) + ')',
        [funnelChart, funnelToggle, funnelTable]
      ));
    }

    /* 매체별 분포 */
    var sourceRows = D.tally(all, function (x) { return x.article.source; }).map(function (c) {
      var feed = D.feedByName(c.key);
      return { label: c.key, value: c.count, href: feed ? feed.home : null };
    });
    root.appendChild(panel(t('data.sources'), t('data.sourcesNote'),
      [barChart(sourceRows)].concat(tableFor(sourceRows, [t('data.colSource'), t('data.colCount'), t('data.colShare')]))));

    /* 주제 분포 */
    var topicCounts = D.tally(all, function (x) { return x.article.topic; });
    var topicMap = new Map(topicCounts.map(function (c) { return [c.key, c.count]; }));
    var topicRows = SAB.meta.topics.map(function (topic) {
      return {
        label: L(topic.label),
        value: topicMap.get(topic.id) || 0,
        href: A.withLang('topics.html?t=' + topic.id)
      };
    }).sort(function (a, b) { return b.value - a.value; });
    root.appendChild(panel(t('data.topics'), t('data.topicsNote'),
      [barChart(topicRows)].concat(tableFor(topicRows, [t('data.colTopic'), t('data.colCount'), t('data.colShare')]))));

    /* 용어 누적 */
    var termRows = (SAB.glossary || []).slice()
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 10)
      .map(function (term) {
        return { label: L(term.term), value: term.count, href: A.withLang('glossary.html#' + term.id) };
      });
    root.appendChild(panel(t('data.terms'), t('data.termsNote'),
      [barChart(termRows)].concat(tableFor(termRows, [t('data.colTerm'), t('data.colCount'), t('data.colShare')]))));
  }

  /* ==========================================================
     용어사전
     ========================================================== */

  function renderGlossary() {
    var root = host();
    if (!root) return;
    clear(root);

    root.appendChild(pageHead(null, t('glossary.title'), t('glossary.lede')));

    var lang = A.lang();
    var terms = (SAB.glossary || []).slice().sort(function (a, b) {
      return L(a.term).localeCompare(L(b.term), lang === 'ko' ? 'ko-KR' : 'en-US');
    });

    var list = el('div', {});
    terms.forEach(function (term) {
      list.appendChild(el('article', { class: 'glossary-item', id: term.id }, [
        el('div', { class: 'glossary-item__head' }, [
          el('h3', { text: L(term.term) }),
          el('span', { class: 'glossary-item__en', text: lang === 'ko' ? term.term.en : term.term.ko })
        ]),
        el('p', { text: L(term.definition) }),
        el('p', { class: 'glossary-item__meta' }, [
          t('glossary.firstSeen') + ' ',
          el('a', {
            href: A.withLang('brief.html?d=' + term.firstSeen),
            text: A.formatDate(term.firstSeen)
          }),
          ' · ',
          term.count === 1 ? t('glossary.count1') : t('glossary.count', { n: term.count })
        ])
      ]));
    });
    root.appendChild(list);

    /* 해시로 들어온 용어로 이동 */
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
    }
  }

  /* ==========================================================
     소개 — 본문은 about.html 에 [data-lang] 으로 들어 있다
     ========================================================== */

  function renderAbout() {
    var head = document.getElementById('about-head');
    if (!head) return;
    clear(head);
    head.appendChild(pageHead(null, t('about.title')));
  }

  SAB.pages = {
    today: function () { renderBrief({ byParam: false }); },
    brief: function () { renderBrief({ byParam: true }); },
    archive: renderArchive,
    topics: renderTopics,
    data: renderData,
    glossary: renderGlossary,
    about: renderAbout
  };
})();
