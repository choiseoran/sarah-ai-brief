/**
 * Sarah's AI Brief — 사이트 메타데이터
 * SPEC.md 7절 데이터 계약 참조.
 *
 * JSON이 아니라 전역 객체에 대입하는 .js 인 이유:
 * fetch()는 file:// 에서 CORS로 차단된다. 파일을 직접 열어도 렌더되어야 한다.
 */
window.SAB = window.SAB || {};

SAB.meta = {
  site: {
    title: "Sarah's AI Brief",
    tagline: {
      ko: '매일 오전 8시, 국내외 AI 기사 10건을 한국어와 영어로',
      en: 'Ten AI stories a day, in Korean and English, at 8am KST'
    },
    publishTime: '08:00',
    timezone: 'Asia/Seoul',
    email: 'sarah@insightai.art',
    rss: 'feed.xml'
  },

  /* 출처 유형과 가중치 — SPEC 6.1 */
  sourceTypes: [
    { id: 'primary',   label: { ko: '공식',      en: 'Primary'   }, weight: 1.0  },
    { id: 'tech',      label: { ko: '기술',      en: 'Tech'      }, weight: 0.85 },
    { id: 'industry',  label: { ko: '업계',      en: 'Industry'  }, weight: 0.8  },
    { id: 'domestic',  label: { ko: '국내',      en: 'Korea'     }, weight: 0.75 },
    { id: 'community', label: { ko: '커뮤니티',  en: 'Community' }, weight: 0.6  }
  ],

  /* 수집 대상 12개 피드.
     url은 실제 RSS 주소(Phase 2에서 사용), home은 화면에 노출하는 링크.
     format은 파서 분기용이며 사이트 렌더에는 쓰이지 않는다. 생략 시 'rss'.
     2026-08-31 전수 검증: 아래 주소는 모두 200 + 항목 1건 이상 확인됨. */
  feeds: [
    { id: 'openai',     name: 'OpenAI Blog',           type: 'primary',   url: 'https://openai.com/news/rss.xml',                                   home: 'https://openai.com/news/' },
    { id: 'anthropic',  name: 'Anthropic News',        type: 'primary',   url: 'https://www.anthropic.com/sitemap.xml',                             home: 'https://www.anthropic.com/news', format: 'sitemap', pathPrefix: '/news/' },
    { id: 'deepmind',   name: 'Google DeepMind Blog',  type: 'primary',   url: 'https://deepmind.google/blog/rss.xml',                              home: 'https://deepmind.google/discover/blog/' },
    { id: 'meta',       name: 'Meta Engineering',      type: 'primary',   url: 'https://engineering.fb.com/feed/',                                  home: 'https://engineering.fb.com/' },
    { id: 'mittr',      name: 'MIT Technology Review', type: 'tech',      url: 'https://www.technologyreview.com/feed/',                            home: 'https://www.technologyreview.com/topic/artificial-intelligence/' },
    { id: 'arstech',    name: 'Ars Technica',          type: 'tech',      url: 'https://arstechnica.com/ai/feed/',                                  home: 'https://arstechnica.com/ai/' },
    { id: 'verge',      name: 'The Verge',             type: 'industry',  url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', home: 'https://www.theverge.com/ai-artificial-intelligence', format: 'atom' },
    { id: 'techcrunch', name: 'TechCrunch',            type: 'industry',  url: 'https://techcrunch.com/tag/ai/feed/',                               home: 'https://techcrunch.com/category/artificial-intelligence/' },
    { id: 'venturebeat',name: 'VentureBeat',           type: 'industry',  url: 'https://venturebeat.com/category/ai/feed/',                         home: 'https://venturebeat.com/category/ai/' },
    { id: 'etnews',     name: '전자신문',                type: 'domestic',  url: 'https://rss.etnews.com/04.xml',                                       home: 'https://www.etnews.com/news/section.html?id1=04' },
    { id: 'zdnetkr',    name: 'ZDNet Korea',           type: 'domestic',  url: 'https://feeds.feedburner.com/zdkorea',                              home: 'https://zdnet.co.kr/news/?lstcode=0050' },
    { id: 'hn',         name: 'Hacker News',           type: 'community', url: 'https://hnrss.org/newest?q=AI+OR+LLM+OR+OpenAI&points=100',         home: 'https://news.ycombinator.com/' }
  ],

  /* 12개 주제 — 기사는 정확히 하나에 속한다 */
  topics: [
    { id: 'models',     label: { ko: '모델·연구',       en: 'Models & Research' },   description: { ko: '새 모델, 논문, 성능 평가', en: 'New models, papers, benchmarks' } },
    { id: 'products',   label: { ko: '제품·서비스',     en: 'Products' },            description: { ko: '소비자·개발자 대상 제품 출시와 개편', en: 'Consumer and developer product launches' } },
    { id: 'compute',    label: { ko: '인프라·반도체',   en: 'Compute & Chips' },     description: { ko: '데이터센터, 가속기, 전력', en: 'Data centers, accelerators, power' } },
    { id: 'funding',    label: { ko: '자금·인수',       en: 'Funding & M&A' },       description: { ko: '투자 유치, 인수합병, 기업가치', en: 'Rounds, acquisitions, valuations' } },
    { id: 'policy',     label: { ko: '정책·규제',       en: 'Policy & Regulation' }, description: { ko: '입법, 행정 지침, 국제 합의', en: 'Legislation, guidance, treaties' } },
    { id: 'safety',     label: { ko: '안전·정렬',       en: 'Safety & Alignment' },  description: { ko: '평가, 레드팀, 오남용 대응', en: 'Evals, red teaming, misuse' } },
    { id: 'opensource', label: { ko: '오픈소스',        en: 'Open Source' },         description: { ko: '공개 가중치, 라이선스, 커뮤니티 도구', en: 'Open weights, licenses, community tooling' } },
    { id: 'enterprise', label: { ko: '기업 도입',       en: 'Enterprise' },          description: { ko: '도입 사례, 조달, 업무 적용', en: 'Deployments, procurement, workflows' } },
    { id: 'robotics',   label: { ko: '로보틱스·자율',   en: 'Robotics & Autonomy' }, description: { ko: '로봇, 자율주행, 체화 AI', en: 'Robots, self-driving, embodied AI' } },
    { id: 'data',       label: { ko: '데이터·저작권',   en: 'Data & Copyright' },    description: { ko: '학습 데이터, 소송, 라이선싱', en: 'Training data, lawsuits, licensing' } },
    { id: 'people',     label: { ko: '인력·조직',       en: 'People & Orgs' },       description: { ko: '인재 이동, 조직 개편', en: 'Talent moves, reorganizations' } },
    { id: 'society',    label: { ko: '사회·노동',       en: 'Society & Labor' },     description: { ko: '고용, 교육, 사회적 영향', en: 'Jobs, education, social impact' } }
  ]
};
