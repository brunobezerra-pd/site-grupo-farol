// main.js — Public site logic
// Sections are implemented across ISSUES 15–24.
// This file owns: STRINGS (i18n prep), content/creators/partners loading, nav wiring.

// ── i18n strings (PT-BR) ─────────────────────────────────────────────────────
// All fixed UI text lives here. Swap this object for another locale in Phase 2.
const STRINGS = {
  a11y: {
    skipToContent: 'Pular para o conteúdo',
  },
  nav: {
    sobre:           'SoBre',
    talentos:        'TALENTOS',
    comoTrabalhamos: 'Como TrAbALHAMOS',
    contatos:        'cONtatos',
    faleConosco:     'FAle conOsco',
  },
  hero: {
    heading: 'Grupo Farol — A maior agência de creators da América Latina',
    cta1:    'Conheça Nossos Creators',
    cta2:    'Fale com o Farol',
  },
  about: {
    heading: 'Sobre o Grupo Farol',
  },
  creators: {
    heading:  'Nossos Creators',
    callout:  'Mais de 200 Creators',
    tags: [
      'Humor & Criatividade',
      'Gastronomia',
      'Esportes & Games',
      'Moda & Beleza',
      'Lifestyle',
      'Páginas & Comunidades',
    ],
  },
  talents: {
    heading:  'Talentos em Destaque',
    callout:  'Conheça alguns dos creators que fazem parte da nossa curadoria.',
    subtext:  'Nosso casting reúne talentos que construíram comunidades reais em diferentes territórios da cultura digital.',
    empty:    'Talentos em breve.',
    prev:     'Anterior',
    next:     'Próximo',
    ctaAll:   'Conheça todos os nossos talentos',
  },
  how: {
    heading:   'Como Trabalhamos',
    subheading: 'COMO TRABaLHaMOS',
    title:     'COM MARCAS',
    subtext:   'Um processo estruturado que combina curadoria humana, visão estratégica e execução impecável.',
    card1: {
      stamp: 'EstRaTÉGiA & INTELIGÊNCIA',
      text:  'Atuamos como uma consultoria criativa que identifica territórios culturais e constrói narrativas onde o talento faz parte da ideia desde o começo. Em vez de fórmulas prontas, <strong>desenvolvemos caminhos estratégicos para que a marca se torne parte orgânica da conversa.</strong>',
    },
    card2: {
      stamp: 'CONEXões & PARCERIAS',
      text:  '<strong>Articulamos relações verdadeiras entre marcas e talentos</strong>, fugindo da lógica de "mídia de prateleira". Focamos na construção de <strong>parcerias de longo</strong> prazo onde a co-autoria garante a autenticidade do conteúdo.',
    },
    card3: {
      stamp: 'Projetos Especiais',
      text:  'Desenvolvemos formatos e narrativas proprietárias que <strong>transformam briefings em histórias que permanecem</strong>. Criamos projetos sob medida onde a conexão entre marca e criador é o que <strong>gera impacto real no público.</strong>',
    },
    card4: {
      stamp: 'Excelência no Craft',
      text:  'Nossa execução une <strong>técnica audiovisual e alma criativa</strong>. Cuidamos de todo o processo, do roteiro à direção, garantindo que o resultado final tenha o <strong>rigor técnico e a sensibilidade narrativa</strong> que o mercado de conteúdo exige.',
    },
  },
  partners: {
    heading: 'Parceiros',
    title:   'DE QUEM SOMOS PARCEIROS',
    empty:   '',
  },
  cta: {
    heading:  'Fale com o Farol',
    title:    'VAMOS CO-CRIAR JUNTOS?',
    subtext:  'Quando o objetivo é construir conteúdo que deixa marca, <strong>estamos prontos para criar juntos.</strong>',
    cta:      'FALE COM O FAROL',
  },
  footer: {
    copyright: '©2026 Grupo Farol. Todos os direitos reservados.',
    nav: {
      sobre:            'SoBre',
      talentos:         'TALENTOS',
      comoTrabalhamos:  'Como TrAbALHAMOS',
      contatos:         'cONtatos',
      faleConosco:      'FAle conOsco',
    },
  },
  errors: {
    loadFailed: 'Não foi possível carregar o conteúdo.',
  },
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ── Module state ──────────────────────────────────────────────────────────────
let _content  = {}
let _creators = []
let _partners = []

// ── API fetchers ──────────────────────────────────────────────────────────────
async function fetchContent() {
  const res = await fetch('/api/content')
  if (!res.ok) throw new Error('content')
  _content = await res.json()
}

async function fetchCreators() {
  const res = await fetch('/api/creators')
  if (!res.ok) throw new Error('creators')
  _creators = await res.json()
}

async function fetchPartners() {
  const res = await fetch('/api/partners')
  if (!res.ok) throw new Error('partners')
  _partners = await res.json()
}

// ── Nav: wire contact link from DB ────────────────────────────────────────────
function wireContactLinks() {
  const url = _content.contact_url || ''
  const links = document.querySelectorAll('#nav-contact-link, #mobile-contact-link')
  links.forEach(el => {
    if (url) el.href = url
  })
}

// ── Section renderers (stubs — filled by each Issue) ─────────────────────────
function renderHero() {
  const skeleton  = document.getElementById('hero-skeleton')
  const contentEl = document.getElementById('hero-content')
  if (!skeleton || !contentEl) return

  const headline    = _content.hero_headline    || 'A maior agência de creators da\nAmérica Latina'
  const subheadline = _content.hero_subheadline || 'No Farol, conectamos marcas a um ecossistema exclusivo com os principais talentos |para co-criar histórias que engajam e inspiram.'
  const cta1Text    = _content.hero_cta1_text   || 'ConHEçA NoSsos CReAToRs'
  const cta1Url     = _content.hero_cta1_url    || '#talentos'
  const cta2Text    = _content.hero_cta2_text   || 'FaLE com O FARoL'
  const cta2Url     = _content.hero_cta2_url    || '#contato'

  // Headline: split on \n — line1 text-[144px], line2 text-[296px] (Figma Desktop exact)
  const parts = headline.split('\n')
  const line1 = escapeHtml(parts[0] || headline)
  const line2 = parts.length > 1 ? escapeHtml(parts[1]) : ''

  const headlineHtml = line2
    ? `<span class="block leading-none text-[48px] md:text-[80px] lg:text-[144px]">${line1}</span>
       <span class="block leading-none text-[88px] md:text-[176px] lg:text-[296px]">${line2}</span>`
    : `<span class="block leading-none text-[60px] md:text-[100px] lg:text-[144px]">${line1}</span>`

  // Subheadline: split on | to separate regular italic from bold italic
  const subParts   = subheadline.split('|')
  const subRegular = escapeHtml(subParts[0] || subheadline)
  const subBold    = subParts.length > 1 ? escapeHtml(subParts[1]) : ''

  const subheadlineHtml = subBold
    ? `<span class="font-pt-serif italic leading-[1.2]">${subRegular}</span><span class="font-pt-serif italic font-bold leading-[1.2]">${subBold}</span>`
    : `<span class="font-pt-serif italic leading-[1.2]">${subRegular}</span>`

  contentEl.innerHTML = `
    <!-- Beam: absolutely positioned relative to the section.
         left:180px = section px-[120px] minus anchor left:-52px plus viewBox beam apex x=112.
         right:0 stretches to the viewport right edge at any screen width.
         The SVG uses preserveAspectRatio="none" so the triangle scales horizontally to fill. -->
    <div class="hidden lg:block absolute z-0" style="top:72px;left:180px;right:0;height:1008px" aria-hidden="true">
      <img src="/assets/images/hero-beam.svg" alt="" role="presentation" class="block w-full h-full max-w-none" onerror="this.style.display='none'" />
    </div>

    <div class="flex items-start w-full">

      <!-- Lighthouse anchor: Figma container h-[113px] w-[113px], image overflows via absolute positioning.
           Contains lighthouse body + sparkle only (beam is now the separate element above). -->
      <div class="hidden lg:block relative z-10 shrink-0 h-[113px] w-[113px]" aria-hidden="true">
        <div class="absolute" style="top:-90px;left:-52px;width:1854px;height:1008px">
          <img src="/assets/images/hero-illustration.svg" alt="" role="presentation" class="block w-full h-full max-w-none" onerror="this.style.display='none'" />
        </div>
      </div>

      <!-- Text column: flex-[1_0_0] items-end gap-[32px] pb-[72px] (Figma exact) -->
      <div class="relative z-20 flex flex-[1_0_0] flex-col items-center lg:items-end gap-[32px] text-farol-text text-center lg:text-right pb-[72px]">

        <!-- Headline container: h-[474px] w-[1066px] flex-col justify-center (Figma exact) -->
        <div class="flex flex-col justify-center h-auto lg:h-[474px] w-full lg:w-[1066px]">
          <h1
            id="hero-heading"
            class="font-agharti uppercase text-farol-text"
            style="font-stretch:semi-condensed;font-weight:600"
          >${headlineHtml}</h1>
        </div>

        <!-- Subheadline: min-w-full w-[min-content] text-[32px] leading-[1.2] (Figma exact) -->
        <div class="min-w-full lg:w-[min-content]">
          <p class="text-farol-text text-[18px] md:text-[24px] lg:text-[32px]">
            ${subheadlineHtml}
          </p>
        </div>

        <!-- Buttons: gap-[56px] items-center (Figma exact) -->
        <div class="flex flex-col md:flex-row items-center gap-[16px] md:gap-[56px]">
          <a
            href="${escapeHtml(cta1Url)}"
            class="inline-flex items-center justify-center bg-farol-burning-red rounded-[99px] px-[27px] pt-[7px] pb-[10px] lg:px-[43.102px] lg:pt-[10.776px] lg:pb-[16.163px] font-agharti uppercase text-farol-text text-[36px] lg:text-[60.94px] leading-none lg:tracking-[0.6094px] whitespace-nowrap btn-cta-hover focus:outline-none focus:ring-2 focus:ring-farol-text/50"
            style="font-stretch:semi-condensed;font-weight:600"
            data-i18n="hero.cta1"
          >${escapeHtml(cta1Text)}</a>
          <a
            href="${escapeHtml(cta2Url)}"
            class="inline-flex items-center justify-center bg-farol-blue rounded-[99px] px-[27px] pt-[7px] pb-[10px] lg:px-[43.102px] lg:pt-[10.776px] lg:pb-[16.163px] font-agharti uppercase text-farol-text text-[36px] lg:text-[60.94px] leading-none lg:tracking-[0.6094px] whitespace-nowrap btn-cta-hover focus:outline-none focus:ring-2 focus:ring-farol-text/50"
            style="font-stretch:semi-condensed;font-weight:600"
            data-i18n="hero.cta2"
          >${escapeHtml(cta2Text)}</a>
        </div>

      </div>
    </div>
  `

  skeleton.classList.add('hidden')
  contentEl.classList.remove('hidden')
}
function renderAbout() {
  const skeleton  = document.getElementById('about-skeleton')
  const contentEl = document.getElementById('about-content')
  if (!contentEl) return

  const imageUrl  = _content.about_image_url  || ''
  const aboutText = _content.about_text        || ''
  const stat1Val  = _content.about_stat1_value || '+200'
  const stat2Val  = _content.about_stat2_value || '+1000'
  const stat3Val  = _content.about_stat3_value || '+1000'

  // Image: use uploaded URL or static placeholder
  const imgSrc = imageUrl
    ? escapeHtml(imageUrl)
    : '/assets/images/placeholders/about-placeholder.svg'

  // Body text: split on double-newline into individual paragraphs
  const bodyHtml = aboutText
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p class="font-poppins italic text-farol-text leading-[1.2] text-[18px]">${escapeHtml(p.trim())}</p>`)
    .join('\n')

  contentEl.innerHTML = `
    <div class="px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">

      <!-- Desktop: two-column; Tablet/Mobile: single column -->
      <div class="flex flex-col lg:flex-row gap-[40px] lg:gap-[105px] lg:h-[800px]">

        <!-- ── Left column: heading + body text ──────────────────────────── -->
        <div class="flex flex-col flex-1 gap-[32px] lg:gap-0 lg:justify-between">

          <!-- Heading block (relative for separator positioning) -->
          <div class="relative">
            <div class="text-farol-text">
              <p class="font-agharti font-light leading-none text-[48px] md:text-[80px] lg:text-[144px]"
                 style="font-stretch:semi-condensed">SoMos o</p>
              <p class="font-agharti font-bold leading-none text-[116px] md:text-[180px] lg:text-[264px]"
                 style="font-stretch:condensed">GRUPO FAROL</p>
            </div>
            <!-- Separator line (right-aligned, vertically centred on the first heading line) -->
            <div class="absolute h-0 right-0 top-[29px] md:top-[48px] lg:top-[66px] w-[318px] md:w-[481px] lg:w-[580px]"
                 aria-hidden="true">
              <div class="absolute" style="inset:-3px 0 0 0">
                <img src="/assets/images/about-separator.svg" alt="" role="presentation"
                     class="block w-full h-full" />
              </div>
            </div>
          </div>

          <!-- Body text paragraphs -->
          <div class="flex flex-col gap-[12px]">
            ${bodyHtml}
          </div>

        </div>

        <!-- ── Right column: image + stats cards ─────────────────────────── -->
        <div class="flex flex-col gap-[32px] w-full lg:w-[713px] lg:h-full lg:justify-between">

          <!-- Image slot: uploaded image or placeholder -->
          <div class="w-full h-[384px] bg-[#d9d9d9] overflow-hidden">
            <img src="${imgSrc}"
                 alt="Sobre o Grupo Farol"
                 class="w-full h-full object-cover"
                 onerror="this.onerror=null; this.src='/assets/images/placeholders/about-placeholder.svg';" />
          </div>

          <!-- Stats cards row (mobile: stacked; tablet+: horizontal row) -->
          <div class="flex flex-col md:flex-row gap-[32px] md:gap-0 md:justify-between">

            <!-- Card 1 — green: creators no casting -->
            <div class="bg-farol-green flex items-center justify-center px-[12px] lg:px-[16px] py-[30px] lg:py-[40px] rounded-[24px] h-[126px] md:h-[201px] lg:h-[269px] w-full md:w-auto">
              <div class="flex flex-row md:flex-col gap-[18px] md:gap-[25px] items-center justify-center text-farol-text text-center">
                <p class="font-agharti font-black leading-none text-[90px] md:text-[66px] lg:text-[88px]"
                   style="font-stretch:ultra-expanded">${escapeHtml(stat1Val)}</p>
                <p class="font-foun leading-none text-[30px] lg:text-[40px]">creators<br>no casting</p>
              </div>
            </div>

            <!-- Card 2 — blue: projetos realizados -->
            <div class="bg-farol-blue flex items-center justify-center px-[12px] lg:px-[16px] py-[30px] lg:py-[40px] rounded-[24px] h-[150px] md:h-[201px] lg:h-[269px] w-full md:w-auto">
              <div class="flex flex-row md:flex-col gap-[18px] md:gap-[25px] items-center justify-center text-farol-text text-center">
                <p class="font-agharti font-black leading-none text-[90px] md:text-[66px] lg:text-[88px]"
                   style="font-stretch:ultra-expanded">${escapeHtml(stat2Val)}</p>
                <p class="font-foun leading-none text-[30px] lg:text-[40px]">PrOjetos<br>realizados</p>
              </div>
            </div>

            <!-- Card 3 — red: clientes e parceiros -->
            <div class="bg-farol-red flex items-center justify-center px-[12px] lg:px-[16px] py-[30px] lg:py-[40px] rounded-[24px] h-[150px] md:h-[201px] lg:h-[269px] w-full md:w-auto">
              <div class="flex flex-row md:flex-col gap-[18px] md:gap-[25px] items-center justify-center text-farol-text text-center">
                <p class="font-agharti font-black leading-none text-[90px] md:text-[66px] lg:text-[88px]"
                   style="font-stretch:ultra-expanded">${escapeHtml(stat3Val)}</p>
                <p class="font-foun leading-none text-[30px] lg:text-[40px]">Clientes<br>E parceiros</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  `

  if (skeleton) skeleton.classList.add('hidden')
  contentEl.classList.remove('hidden')
}
function renderCreators() {
  const el = document.getElementById('creators-content')
  if (!el) return

  // Tags: colour-coded category badges matching Figma exactly.
  // Desktop: slightly rotated for scattered visual effect.
  // Tablet: flex-wrap two-column grid.
  // Mobile: full-width stacked list.
  const tags = [
    { label: 'HuMOR &amp; CRIATIVIDADE',  bgColor: '#D96837', rotDeg: -3.94 },
    { label: 'GASTRONOMIA',               bgColor: '#D1D362', rotDeg: -0.74 },
    { label: 'ESPORTES &amp; GAMES',      bgColor: '#E5A545', rotDeg:  5.06 },
    { label: 'MODA &amp; BELEZA',         bgColor: '#B1375B', rotDeg:  5.06 },
    { label: 'LIFESTYLE',                 bgColor: '#5C8DC9', rotDeg: -6.68 },
    { label: 'P&Aacute;GINAS &amp; COMUNIDADES', bgColor: '#90C2AC', rotDeg: -2.33 },
  ]

  // Rotation is applied via data attribute + JS after render so Tailwind
  // doesn't need to scan dynamically-constructed class names.
  const tagsHtml = tags.map(t => `
    <div class="creators-tag-wrap lg:flex-grow" data-rot="${t.rotDeg}" role="listitem"
         style="display:flex;align-items:center">
      <div class="creators-tag-inner"
           style="background:${t.bgColor};
                  border-radius:9999px;
                  padding:4px 32px 14px;
                  width:100%;
                  display:flex;align-items:center;justify-content:center">
        <span class="font-agharti text-farol-text whitespace-nowrap"
              style="font-variation-settings:'wdth' 50;
                     font-size:clamp(40px,8vw,80px);
                     line-height:1">${t.label}</span>
      </div>
    </div>
  `).join('')

  el.innerHTML = `
    <div class="bg-farol-beige overflow-hidden px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">
      <div class="flex flex-col gap-[72px] lg:gap-[105px] items-start w-full">

        <!-- ── Heading block ──────────────────────────────────────── -->
        <div class="flex flex-col gap-[10px] items-start w-full">

          <!-- "MAIS DE" + decorative dashed line -->
          <div class="flex gap-[10px] items-center w-full" aria-hidden="true">
            <div class="shrink-0" style="transform:rotate(-1.91deg);display:inline-block">
              <span class="font-casual-human text-farol-text text-[32px] md:text-[48px] lg:text-[64px]"
                    style="line-height:0.94"
                    data-i18n="creators.maisde">MAIS DE</span>
            </div>
            <div class="flex-1" style="height:28px;position:relative;overflow:hidden" aria-hidden="true">
              <svg style="position:absolute;inset:0;width:100%;height:100%"
                   xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <line x1="0" y1="50%" x2="100%" y2="50%"
                      stroke="#1A1A1A" stroke-width="2.5" stroke-dasharray="10 6"/>
              </svg>
            </div>
          </div>

          <!-- Display headline: "200 CREATORS. CENTENAS DE COMUNIDADES." -->
          <!-- Desktop: side-by-side (different sizes on the same baseline).
               Tablet/Mobile: stacked. -->
          <div class="flex flex-col lg:flex-row lg:gap-[10px] lg:items-end w-full text-farol-text">
            <h2 id="creators-heading"
                class="font-agharti text-[140px] md:text-[200px] lg:text-[296px]"
                style="line-height:0.94;font-variation-settings:'wdth' 50"
                data-i18n="creators.callout200">200 CREATORS.</h2>
            <span class="font-agharti text-[72px] md:text-[108px] lg:text-[176px] uppercase"
                  style="line-height:0.94;font-variation-settings:'wdth' 34;font-weight:100"
                  data-i18n="creators.calloutCentenas">Centenas de comunidades.</span>
          </div>

        </div>

        <!-- ── Subtext ────────────────────────────────────────────── -->
        <p class="font-pt-serif italic text-farol-text text-[22px] md:text-[28px] lg:text-[35px] text-center leading-normal w-full"
           data-i18n="creators.subtext">
          Nosso casting reúne talentos que construíram comunidades reais em diferentes
          <strong class="font-pt-serif not-italic font-bold">territ&oacute;rios</strong>
          da cultura digital.
        </p>

        <!-- ── Category tags ──────────────────────────────────────── -->
        <!-- Mobile: single column full-width.
             Tablet: flex-wrap natural flow (2-col).
             Desktop: flex-wrap with JS-applied rotations. -->
        <div id="creators-tags"
             class="flex flex-col gap-[16px] w-full
                    md:flex-row md:flex-wrap md:gap-[16px] md:items-start lg:justify-between"
             role="list"
             aria-label="Categorias de creators">
          ${tagsHtml}
        </div>

      </div>
    </div>
  `

  // Apply desktop-only rotation after DOM insertion.
  // On tablet/mobile the rotation hurts the wrapping layout — skip it.
  function applyTagRotations() {
    const isDesktop = window.innerWidth >= 1024
    el.querySelectorAll('.creators-tag-wrap').forEach(wrap => {
      const inner = wrap.querySelector('.creators-tag-inner')
      if (!inner) return
      const deg = parseFloat(wrap.dataset.rot || '0')
      inner.style.transform = isDesktop ? `rotate(${deg}deg)` : ''
    })
  }

  applyTagRotations()

  // Re-apply on window resize so rotation updates correctly
  if (!window._creatorsResizeAttached) {
    window._creatorsResizeAttached = true
    window.addEventListener('resize', applyTagRotations, { passive: true })
  }
}
function renderHow() {
  const el = document.getElementById('how-content')
  if (!el) return

  // ── Card data ─────────────────────────────────────────────────────────────
  // Stamp colours from Figma exactly:
  //  card1 (EstRaTÉGiA): #D1D362 green
  //  card2 (CONEXões):   #D96837 orange
  //  card3 (Projetos):   #E5A545 yellow
  //  card4 (Excelência): #90C2AC teal
  const cards = [
    {
      stamp:      'EstRaTÉGiA &amp;<br>INTELIGÊNCIA',
      stampColor: '#D1D362',
      text:       'Atuamos como uma consultoria criativa que identifica territórios culturais e constrói narrativas onde o talento faz parte da ideia desde o começo. Em vez de fórmulas prontas, <strong>desenvolvemos caminhos estratégicos para que a marca se torne parte orgânica da conversa.</strong>',
      i18n:       'how.card1',
    },
    {
      stamp:      'CONEXões &amp;<br>PARCERIAS',
      stampColor: '#D96837',
      text:       '<strong>Articulamos relações verdadeiras entre marcas e talentos</strong>, fugindo da lógica de "mídia de prateleira". Focamos na construção de <strong>parcerias de longo</strong> prazo onde a co-autoria garante a autenticidade do conteúdo.',
      i18n:       'how.card2',
    },
    {
      stamp:      'Projetos<br>Especiais',
      stampColor: '#E5A545',
      text:       'Desenvolvemos formatos e narrativas proprietárias que <strong>transformam briefings em histórias que permanecem</strong>. Criamos projetos sob medida onde a conexão entre marca e criador é o que <strong>gera impacto real no público.</strong>',
      i18n:       'how.card3',
    },
    {
      stamp:      'Excelência<br>no Craft',
      stampColor: '#90C2AC',
      text:       'Nossa execução une <strong>técnica audiovisual e alma criativa</strong>. Cuidamos de todo o processo, do roteiro à direção, garantindo que o resultado final tenha o <strong>rigor técnico e a sensibilidade narrativa</strong> que o mercado de conteúdo exige.',
      i18n:       'how.card4',
    },
  ]

  // ── WorkCard HTML builder ─────────────────────────────────────────────────
  function buildWorkCard(card) {
    return `
      <div class="how-card h-full bg-farol-beige border-[4px] border-farol-black rounded-[40px]
                  relative flex items-start
                  px-[32px] md:px-[48px] lg:px-[72px]
                  pt-[48px] md:pt-[56px]
                  pb-[32px]
                  w-full"
           data-i18n="${card.i18n}">

        <!-- Category stamp (top-left, overlapping card border) -->
        <div class="absolute flex items-center justify-center rounded-full"
             style="width:120px;height:120px;
                    background:${card.stampColor};
                    top:-60px;left:-48px;
                    padding:10px">
          <span class="font-agharti text-farol-text text-center"
                style="font-variation-settings:'wdth' 0;
                       font-size:clamp(18px,1.8vw,32px);
                       line-height:0.95;
                       font-weight:700;
                       transform:rotate(-20deg);
                       display:block">
            ${card.stamp}
          </span>
        </div>

        <!-- Card body text (Poppins italic per Figma) -->
        <p class="font-poppins italic text-farol-text leading-normal
                  text-[18px] md:text-[22px] lg:text-[24px]
                  mt-[16px] md:mt-[8px]">
          ${card.text}
        </p>
      </div>
    `
  }

  el.innerHTML = `
    <div class="bg-farol-beige px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">
      <div class="flex flex-col gap-[32px] lg:gap-[64px] items-start w-full">

        <!-- ── Heading block ──────────────────────────────────────── -->
        <div class="flex flex-col items-center w-full" style="margin-bottom:24px">

          <!-- "COMO TRABaLHaMOS" — Casual Human, slightly rotated -->
          <p class="font-casual-human text-farol-text text-center"
             style="font-size:clamp(28px,4vw,64px);
                    line-height:1;
                    transform:rotate(1.51deg);
                    display:inline-block"
             data-i18n="how.subheading">COMO TRABaLHaMOS</p>

          <!-- "COM MARCAS" with yellow rectangle behind it -->
          <div class="relative flex items-center justify-center w-full" style="margin-top:-8px">
            <!-- Yellow rect behind text (Figma ::before) -->
            <div class="absolute" aria-hidden="true"
                 style="background:#E5A545;
                        height:55%;
                        bottom:4px;
                        left:50%;
                        transform:translateX(-50%) rotate(0.9deg);
                        width:min(892px,93%)">
            </div>
            <h2 id="how-heading-visible"
                class="font-agharti text-farol-text relative"
                style="font-size:clamp(80px,18vw,296px);
                       font-variation-settings:'wdth' 50;
                       font-weight:700;
                       line-height:1;
                       transform:rotate(2.84deg);
                       white-space:nowrap;"
                data-i18n="how.title">COM MARCAS</h2>
          </div>

        </div>

        <!-- ── Subtext ──────────────────────────────────────────────── -->
        <p class="font-pt-serif italic text-farol-text
                  text-[20px] md:text-[26px] lg:text-[32px]
                  text-center leading-normal w-full"
           data-i18n="how.subtext">
          Um processo estruturado que combina
          <strong class="font-pt-serif not-italic font-bold">curadoria humana, visão estratégica e execução impecável.</strong>
        </p>

        <!-- ── Work cards grid ──────────────────────────────────────── -->
        <!-- Desktop: 2×2 grid. Tablet: 1-column. Mobile: 1-column. -->
        <!-- Each card has a stamp that overflows top-left — needs extra top margin -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-[48px] gap-y-[96px]
                    items-stretch w-full pt-[80px]"
             role="list"
             aria-label="Como trabalhamos com marcas">
          ${cards.map(c => `<div role="listitem" class="h-full">${buildWorkCard(c)}</div>`).join('')}
        </div>

      </div>
    </div>
  `
}
function renderPartners() {
  const section = document.getElementById('contatos')
  const el      = document.getElementById('partners-content')
  if (!el) return

  const partners = _partners || []

  // ── Empty state: hide entire section ──────────────────────────────────
  if (!partners.length) {
    if (section) section.hidden = true
    return
  }
  if (section) section.hidden = false

  // ── Logo card ──────────────────────────────────────────────────
  function buildLogoCard(partner) {
    const nameEsc   = escapeHtml(partner.name     || '')
    const logoEsc   = escapeHtml(partner.logo_url || '')
    const altText   = nameEsc ? `${nameEsc} logo` : 'Partner logo'

    const logoHtml = logoEsc
      ? `<img src="${logoEsc}"
              alt="${altText}"
              class="max-w-full max-h-full object-contain"
              loading="lazy"
              onerror="this.style.display='none'" />`
      : `<div class="w-full h-full bg-[#e0d5c7] rounded-[12px]"></div>`

    return `
      <div class="bg-white rounded-[16px] overflow-hidden flex items-center justify-center
                  shrink-0 p-[16px]"
           style="width:256px;height:144px"
           role="listitem"
           title="${nameEsc}">
        ${logoHtml}
      </div>
    `
  }

  // ── Skeleton card ─────────────────────────────────────────────
  function buildSkeleton() {
    return `
      <div class="bg-white rounded-[16px] shrink-0 animate-pulse"
           style="width:256px;height:144px"
           aria-hidden="true">
      </div>
    `
  }

  el.innerHTML = `
    <div class="bg-farol-beige px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">
      <div class="flex flex-col gap-[64px] lg:gap-[96px] items-start w-full">

        <!-- ── Heading row ─────────────────────────────────────── -->
        <div class="flex items-end gap-[32px] w-full">
          <h2 class="font-agharti text-farol-text leading-[0.94] shrink-0
                     text-[56px] md:text-[80px] lg:text-[112px] uppercase"
              style="font-variation-settings:'wdth' 50"
              data-i18n="partners.title">DE QUEM SOMOS PARCEIROS</h2>
          <!-- Horizontal separator line -->
          <div class="hidden lg:block flex-1 mb-[12px]" aria-hidden="true">
            <div style="height:3px;background:#1A1A1A;border-radius:2px"></div>
          </div>
        </div>

        <!-- ── Logo grid ────────────────────────────────────────── -->
        <!-- Desktop: flex-wrap up to 5 per row. Tablet & Mobile: 2-column grid -->
        <div class="w-full">

          <!-- Desktop (≥1024px): flex-wrap centred, up to 5 per row -->
          <div class="hidden lg:flex flex-wrap gap-[32px] justify-center w-full"
               role="list"
               aria-label="Logos de parceiros">
            ${partners.map(buildLogoCard).join('')}
          </div>

          <!-- Tablet & Mobile (<1024px): strict 2-column grid -->
          <div class="grid lg:hidden grid-cols-2 gap-[24px] w-full"
               role="list"
               aria-label="Logos de parceiros">
            ${partners.map(p => {
              const nameEsc = escapeHtml(p.name || '')
              const logoEsc = escapeHtml(p.logo_url || '')
              const altText = nameEsc ? `${nameEsc} logo` : 'Partner logo'
              const logoHtml = logoEsc
                ? `<img src="${logoEsc}" alt="${altText}" class="max-w-full max-h-full object-contain" loading="lazy" onerror="this.style.display='none'" />`
                : `<div class="w-full h-full bg-[#e0d5c7]"></div>`
              return `
                <div class="bg-white rounded-[16px] overflow-hidden flex items-center justify-center p-[12px] w-full"
                     style="height:100px"
                     role="listitem"
                     title="${nameEsc}">
                  ${logoHtml}
                </div>`
            }).join('')}
          </div>

        </div>

      </div>
    </div>
  `
}
function renderCta() {
  const el = document.getElementById('cta-content')
  if (!el) return

  // Content comes from _content (key→value map from /api/content)
  // cta_final_image_url is the admin-uploaded image; falls back to grey placeholder
  const imageUrl  = (_content && _content.cta_final_image_url) || ''
  const contactUrl = (_content && _content.contact_url) || '#'

  const imageHtml = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}"
            alt="Imagem de contexto Grupo Farol"
            class="w-full h-full object-cover rounded-[24px]"
            loading="lazy"
            onerror="this.onerror=null; this.outerHTML='<div class=\\'w-full h-full bg-[#D9D9D9] rounded-[24px]\\'></div>';" />`
    : `<div class="w-full h-full bg-[#D9D9D9] rounded-[24px]"
             aria-hidden="true"></div>`

  el.innerHTML = `
    <div class="bg-farol-beige px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">
      <div class="flex flex-col lg:flex-row gap-[48px] lg:gap-[96px] items-start w-full">

        <!-- ── Left: CTA green card ──────────────────────────────── -->
        <div class="bg-[#D1D362] rounded-[48px] flex flex-col gap-[48px] items-center justify-center
                    px-[40px] pt-[40px] pb-[72px] relative
                    w-full lg:w-[790px] shrink-0"
             style="min-height:300px">

          <!-- Title: Casual Human Bold, slightly rotated -->
          <p class="font-casual-human font-bold text-farol-text text-center leading-[0.94]
                    text-[40px] md:text-[52px] lg:text-[64px]"
             style="transform:rotate(1.56deg);display:inline-block"
             data-i18n="cta.title">VAMOS CO-CRIAR JUNTOS?</p>

          <!-- Horizontal separator -->
          <div class="w-[240px] md:w-[320px] lg:w-[405px]" aria-hidden="true"
               style="height:3px;background:#1A1A1A;border-radius:2px"></div>

          <!-- Subtext: PT Serif -->
          <p class="font-pt-serif text-farol-text text-center leading-[1.4]
                    text-[20px] md:text-[24px] lg:text-[28px]
                    max-w-[746px] w-full"
             data-i18n="cta.subtext">
            Quando o objetivo é construir conteúdo que deixa marca,
            <strong>estamos prontos para criar juntos.</strong>
          </p>

          <!-- CTA button: hangs below the card -->
          <a href="${escapeHtml(contactUrl)}"
             id="cta-contact-btn"
             class="absolute bottom-0 left-1/2 flex items-center gap-[24px]
                    bg-farol-red rounded-[99px]
                    px-[48px] pt-[12px] pb-[18px]
                    no-underline transition-opacity"
             style="transform:translate(-50%, 50%);"
             data-i18n="cta.cta">
            <span class="font-agharti text-farol-text text-center
                         text-[40px] md:text-[52px] lg:text-[68px]
                         whitespace-nowrap"
                  style="font-variation-settings:'wdth' 34;
                         letter-spacing:0.01em">
              FALE COM O FAROL
            </span>
            <!-- Arrow icon circle -->
            <span class="flex items-center justify-center rounded-full bg-transparent
                         border-[4px] border-farol-black flex-shrink-0
                         w-[56px] h-[56px]"
                  aria-hidden="true">
              <svg viewBox="0 0 32 26" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M31.056 14.155c.685-.685.685-1.795 0-2.48L19.894.514c-.685-.685-1.795-.685-2.48 0-.685.685-.685 1.795 0 2.48L27.335 12.915 17.414 22.837c-.685.685-.685 1.795 0 2.48.685.685 1.795.685 2.48 0L31.056 14.155ZM0 12.915v1.754h29.815v-1.754V11.16H0v1.754Z" fill="black"/>
              </svg>
            </span>
          </a>
        </div>

        <!-- ── Right: image slot ──────────────────────────────────── -->
        <!-- Desktop: 496×791px. Tablet/Mobile: 16:9 aspect ratio -->
        <div class="w-full lg:flex-1 overflow-hidden"
             style="height:clamp(220px,40vw,496px)">
          ${imageHtml}
        </div>

      </div>
    </div>
  `
}

function renderFooter() {
  const el = document.getElementById('footer-content')
  if (!el) return

  const contactUrl = (_content && _content.contact_url) || '#'

  // Nav links mirror the main nav — same anchors
  const navLinks = [
    { href: '#sobre',            label: 'SoBre',            i18n: 'nav.sobre' },
    { href: '#talentos',         label: 'TALENTOS',         i18n: 'nav.talentos' },
    { href: '#como-trabalhamos', label: 'Como TrAbALHAMOS', i18n: 'nav.comoTrabalhamos' },
    { href: '#fale-com-o-farol', label: 'FAle conOsco',     i18n: 'nav.faleConosco' },
  ]

  const navDesktop = navLinks.map(l =>
    `<li><a href="${l.href}"
              class="font-foun text-white text-[24px] leading-normal
                     hover:opacity-70 transition-opacity whitespace-nowrap
                     focus:outline-none focus:underline"
              data-i18n="${l.i18n}">${l.label}</a></li>`
  ).join('')

  const navMobile = navLinks.map(l =>
    `<li><a href="${l.href}"
              class="font-foun text-white text-[28px] leading-normal text-center
                     hover:opacity-70 transition-opacity
                     focus:outline-none focus:underline"
              data-i18n="${l.i18n}">${l.label}</a></li>`
  ).join('')

  el.innerHTML = `
    <div class="bg-farol-black px-[30px] md:px-[64px] lg:px-[120px] py-[72px]">

      <!-- Desktop layout: logo+copyright left | nav right -->
      <div class="hidden lg:flex items-center justify-between w-full">

        <!-- Left: logo + copyright -->
        <div class="flex flex-col gap-[8px] items-start">
          <!-- Logo: white HTML reproduction matching mobile-header pattern -->
          <a href="/" aria-label="Grupo Farol — página inicial" class="no-underline">
            <img src="/assets/images/LogoGrupoFarol--dark.png" alt="Grupo Farol" class="h-[48px] w-auto block object-contain" />
          </a>
          <p class="font-poppins text-white text-[24px] leading-[1.82] whitespace-nowrap"
             data-i18n="footer.copyright">©2026 Grupo Farol. Todos os direitos reservados.</p>
        </div>

        <!-- Right: nav links -->
        <nav aria-label="Links de rodapé">
          <ul class="flex items-center gap-[32px] list-none m-0 p-0" role="list">
            ${navDesktop}
          </ul>
        </nav>

      </div>

      <!-- Mobile/tablet layout: centered logo, then copyright, then nav stacked -->
      <div class="flex lg:hidden flex-col items-center gap-[32px] w-full text-center">

        <!-- Logo -->
        <a href="/" aria-label="Grupo Farol — página inicial" class="no-underline">
          <img src="/assets/images/LogoGrupoFarol--dark.png" alt="Grupo Farol" class="h-[56px] w-auto block object-contain mx-auto" />
        </a>

        <!-- Copyright -->
        <p class="font-poppins text-white text-[18px] leading-[1.6]"
           data-i18n="footer.copyright">©2026 Grupo Farol. Todos os direitos reservados.</p>

        <!-- Nav -->
        <nav aria-label="Links de rodapé">
          <ul class="flex flex-col items-center gap-[16px] list-none m-0 p-0" role="list">
            ${navMobile}
          </ul>
        </nav>

      </div>

    </div>
  `
}

// ── Mobile nav: hamburger toggle ─────────────────────────────────────────────
function initMobileNav() {
  const btn  = document.getElementById('hamburger-btn')
  const menu = document.getElementById('mobile-menu')
  if (!btn || !menu) return

  function openMenu() {
    menu.classList.remove('hidden')
    btn.setAttribute('aria-expanded', 'true')
    btn.setAttribute('aria-label', 'Fechar menu')
    // Focus first focusable item inside menu
    const first = menu.querySelector('a, button')
    if (first) first.focus()
  }

  function closeMenu() {
    menu.classList.add('hidden')
    btn.setAttribute('aria-expanded', 'false')
    btn.setAttribute('aria-label', 'Abrir menu')
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true'
    isOpen ? closeMenu() : openMenu()
  })

  // Close on any menu link click
  menu.addEventListener('click', e => {
    if (e.target.closest('a')) closeMenu()
  })

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      closeMenu()
      btn.focus()
    }
  })

  // Close on outside click
  document.addEventListener('click', e => {
    if (
      btn.getAttribute('aria-expanded') === 'true' &&
      !btn.contains(e.target) &&
      !menu.contains(e.target)
    ) {
      closeMenu()
    }
  })
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function init() {
  // Parallel load — ISSUE 24 adds full skeleton/fallback handling
  const results = await Promise.allSettled([
    fetchContent(),
    fetchCreators(),
    fetchPartners(),
  ])

  // Log individual failures without crashing the rest of the page
  results.forEach(r => {
    if (r.status === 'rejected') console.warn('Fetch failed:', r.reason)
  })

  // Wire nav contact link
  wireContactLinks()

  // Wire hamburger toggle
  initMobileNav()

  // Render sections (each checks its own data availability)
  renderHero()
  renderAbout()
  renderCreators()
  
  // Provide populated creators array to the slider component
  if (typeof window.renderTalentsSlider === 'function') {
    window.renderTalentsSlider(_creators)
  }

  renderHow()
  renderPartners()
  renderCta()
  renderFooter()
}

document.addEventListener('DOMContentLoaded', init)
