// slider.js — Featured Talents slider (ISSUES 19 & 20)
//
// Desktop  (≥1024px): 3 cards visible, prev/next arrows, no looping.
// Tablet+Mobile (<1024px): 1 card + peek of next, touch swipe + arrows below.
//
// Data source: GET /api/creators — ordered by `position` ascending.
// All fixed text uses data-i18n attributes per SPEC i18n convention.

// ── Figma design tokens for this section ─────────────────────────────────────
// Section bg:   #B9323B  (farol-burning-red)   — rounded-[48px] desktop, square tablet/mobile
// Card bg:      #FFF2E7  (farol-beige)
// Card padding: 12px
// Image height: 390px
// Name text:    Agharti wdth:34, 96px desktop / 72px tablet / 56px mobile
// Social text:  PT Serif italic, ~19px
// Stamp:        150px circle, Agharti wdth:0, 48px, rotated -20°, top:-63px, right:~24px
// Arrow btn:    88px circle, bg farol-beige, shadow, positioned at slider mid-height
//               Desktop: hanging outside slider edges (left:-40px / right:0)
// CTA button:   Agharti wdth:34 ~68px, bg farol-burning-red, shadow, hanging below section

// ── Category stamp colours (match Figma badge colours per category name) ──────
const STAMP_COLORS = {
  'humor & criatividade': '#D96837',
  'gastronomia':          '#D1D362',
  'esportes & games':     '#E5A545',
  'moda & beleza':        '#B1375B',
  'lifestyle':            '#5C8DC9',
  'páginas & comunidades':'#90C2AC',
  // Fallback for unknown categories
  default:                '#D96837',
}

function stampColor(category) {
  const key = (category || '').toLowerCase().trim()
  return STAMP_COLORS[key] || STAMP_COLORS.default
}

// ── Handle extractor (username from full URL or raw handle) ───────────────────
function toHandle(url) {
  if (!url) return ''
  // If it's a plain handle (no slash), return as-is with @
  const stripped = url.replace(/^@/, '').trim()
  // If it looks like a URL, extract the last path segment
  try {
    const u = new URL(url)
    const parts = u.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')
    const handle = parts[parts.length - 1]
    return handle ? `@${handle}` : ''
  } catch {
    return stripped ? `@${stripped}` : ''
  }
}

// ── escapeHtml (re-used from main.js scope — but slider.js is standalone) ─────
function _escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ── Card renderer ─────────────────────────────────────────────────────────────
function buildCard(creator) {
  const name        = _escHtml(creator.name     || '')
  const photoUrl    = creator.photo_url         || ''
  const category    = creator.category          || ''
  const instaHandle = toHandle(creator.instagram_url || '')
  const tiktokHandle= toHandle(creator.tiktok_url    || '')
  const color       = stampColor(category)
  const categoryEsc = _escHtml(category)

  const photoHtml = photoUrl
    ? `<img src="${_escHtml(photoUrl)}" alt="${name}" class="absolute inset-0 w-full h-full object-cover rounded-[16px]" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'absolute inset-0 bg-[#d9d9d9] rounded-[16px]\\'></div>';" />`
    : `<div class="absolute inset-0 bg-[#d9d9d9] rounded-[16px]"></div>`

  const instaHtml = instaHandle ? `
    <div class="flex items-center gap-[8px] min-w-0">
      <img src="/assets/images/icon-instagram.svg" alt="Instagram" class="shrink-0" style="width:32px;height:32px" />
      <span class="font-pt-serif italic text-farol-text leading-normal text-[16px] md:text-[18px] lg:text-[19px] truncate">${_escHtml(instaHandle)}</span>
    </div>` : ''

  const tiktokHtml = tiktokHandle ? `
    <div class="flex items-center gap-[8px] min-w-0">
      <img src="/assets/images/icon-tiktok.svg" alt="TikTok" class="shrink-0" style="width:32px;height:32px" />
      <span class="font-pt-serif italic text-farol-text leading-normal text-[16px] md:text-[18px] lg:text-[19px] truncate">${_escHtml(tiktokHandle)}</span>
    </div>` : ''

  return `
    <div class="talent-card bg-farol-beige rounded-[24px] p-[12px] flex flex-col gap-[23px] relative shrink-0"
         style="width:calc(100vw - 100px);
                max-width:497px;
                min-width:280px">

      <!-- Card image area -->
      <div class="relative rounded-[16px] overflow-hidden" style="height:320px" aria-hidden="true">
        ${photoHtml}
        <!-- Decorative stripe (matching Figma CardImageDecoration) -->
        <div class="absolute left-[24px] top-[24px] flex flex-col gap-[4px]" aria-hidden="true">
          ${Array.from({length:7}, () => '<div style="width:10px;height:24px;background:#1A1A1A;opacity:0.15;border-radius:2px"></div>').join('')}
        </div>
      </div>

      <!-- Card body -->
      <div class="flex flex-col gap-[16px] pb-[32px] px-[16px] md:px-[24px]">
        <p class="font-agharti text-farol-text leading-none text-[56px] md:text-[72px] lg:text-[96px] w-full"
           style="font-variation-settings:'wdth' 34">${name}</p>
        <div class="flex items-center gap-[16px] flex-wrap">
          ${instaHtml}
          ${tiktokHtml}
        </div>
      </div>

      <!-- Category stamp (top-right corner, overlapping card edge) -->
      ${category ? `
      <div class="absolute flex items-center justify-center rounded-full"
           style="width:120px;height:120px;background:${color};top:-50px;right:16px;padding:10px">
        <span class="font-agharti text-farol-text text-center leading-tight"
              style="font-variation-settings:'wdth' 0;font-size:clamp(20px,2vw,32px);
                     font-weight:700;transform:rotate(-20deg);display:block">
          ${categoryEsc}
        </span>
      </div>` : ''}
    </div>
  `
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function buildSkeletonCard() {
  return `
    <div class="talent-card bg-farol-beige rounded-[24px] p-[12px] flex flex-col gap-[23px] relative shrink-0
                w-full md:w-[420px] lg:w-[497px] animate-pulse">
      <div class="rounded-[16px] bg-[#e0d5c7]" style="height:320px"></div>
      <div class="flex flex-col gap-[12px] pb-[32px] px-[24px]">
        <div class="h-[56px] bg-[#e0d5c7] rounded-[8px] w-3/4"></div>
        <div class="h-[24px] bg-[#e0d5c7] rounded-[8px] w-1/2"></div>
      </div>
    </div>
  `
}

// ── Main slider controller ────────────────────────────────────────────────────
window.renderTalentsSlider = function(creatorsData) {
  const container = document.getElementById('talents-slider')
  if (!container) return

  // State
  let creators      = creatorsData || []
  let currentIndex  = 0     // index of first visible card

  // ── How many cards visible depends on breakpoint ──────────────────────────
  function visibleCount() {
    return window.innerWidth >= 1024 ? 3 : 1
  }

  // ── Render: full section shell ────────────────────────────────────────────
  function renderShell(isLoading) {
    container.innerHTML = `
      <div class="bg-farol-burning-red overflow-visible px-[30px] md:px-[64px] lg:px-[120px] py-[72px] lg:rounded-[48px] relative"
           style="margin-top:0">

        <!-- ── Section heading ─────────────────────────────────────── -->
        <div class="flex flex-col items-start relative w-full" style="margin-bottom:72px">

          <!-- Big title: "TAlENtoS Em DestaQUeS" -->
          <!-- Desktop: single line overflowing. Tablet/Mobile: wraps -->
          <p class="font-agharti text-farol-text leading-none w-full overflow-visible"
             style="font-size:clamp(80px,16vw,304px);
                    font-variation-settings:'wdth' 50;
                    white-space:nowrap"
             data-i18n="talents.heading">TAlENtoS Em DestaQUeS</p>

          <!-- Beige badge "Conheça alguns dos creators..." -->
          <div class="mt-[-8px] md:mt-[-12px] lg:mt-[-16px] self-end"
               style="transform:rotate(0.9deg)">
            <div class="bg-farol-beige rounded-[99px] px-[32px] pt-[2px] pb-[10px] flex items-center">
              <span class="font-casual-human font-bold text-farol-text leading-normal whitespace-nowrap"
                    style="font-size:clamp(18px,2.5vw,40px)"
                    data-i18n="talents.callout">Conheça alguns dos creators que fazem parte da nossa curadoria.</span>
            </div>
          </div>

        </div>

        <!-- ── Subtext ──────────────────────────────────────────────── -->
        <p class="font-pt-serif italic text-farol-text text-[22px] md:text-[28px] lg:text-[35px]
                  text-center leading-normal w-full mb-[72px]"
           data-i18n="talents.subtext">
          Nosso casting reúne talentos que construíram comunidades reais em diferentes
          <strong class="font-pt-serif not-italic font-bold">territórios</strong>
          da cultura digital.
        </p>

        <!-- ── Slider viewport + arrows ─────────────────────────────── -->
        <div class="relative" style="padding-bottom:72px">

          <!-- Cards viewport -->
          <!-- On mobile/tablet: overflow shows a peek of the next card.
               The section has overflow-visible up to the parent's edge. -->
          <div id="slider-viewport"
               class="w-full"
               style="overflow:hidden">
            <div id="slider-track"
                 class="flex gap-[24px] transition-transform duration-300 ease-in-out"
                 style="will-change:transform">
              ${
                !creators.length
                  ? `<div class="w-full flex items-center justify-center p-8 bg-farol-beige rounded-3xl min-h-[300px]">
                       <p class="font-agharti text-farol-text text-3xl md:text-5xl uppercase" style="font-variation-settings:'wdth' 34">Talentos em breve</p>
                     </div>`
                  : creators.map(buildCard).join('')
               }
            </div>
          </div>

          <!-- ── Left arrow ────────────────────────────────────────── -->
          <button id="slider-prev"
                  class="absolute -translate-y-1/2 flex items-center justify-center bg-farol-beige rounded-full
                         shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25)]
                         transition-opacity duration-200
                         focus:outline-none focus:ring-2 focus:ring-farol-text/50"
                  style="width:88px;height:88px;top:50%;left:-44px;z-index:10"
                  aria-label="Anterior"
                  data-i18n-aria="talents.prev"
                  type="button">
            <!-- Left arrow SVG -->
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M38 14H2M2 14L14 2M2 14L14 26" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- ── Right arrow ───────────────────────────────────────── -->
          <button id="slider-next"
                  class="absolute -translate-y-1/2 flex items-center justify-center bg-farol-beige rounded-full
                         shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25)]
                         transition-opacity duration-200
                         focus:outline-none focus:ring-2 focus:ring-farol-text/50"
                  style="width:88px;height:88px;top:50%;right:-44px;z-index:10"
                  aria-label="Próximo"
                  data-i18n-aria="talents.next"
                  type="button">
            <!-- Right arrow SVG -->
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2 14H38M38 14L26 2M38 14L26 26" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

        </div>

        <!-- ── CTA button — hangs below section bottom edge ─────────── -->
        <div class="flex justify-center" style="margin-top:-36px;position:relative;z-index:5">
          <a href="#talentos"
             id="talents-cta"
             class="inline-flex items-center gap-[16px] bg-farol-burning-red rounded-[99px]
                    px-[32px] md:px-[48px] pt-[12px] pb-[18px]
                    shadow-[0px_4px_16px_0px_rgba(0,0,0,0.3)]
                    btn-cta-hover
                    focus:outline-none focus:ring-2 focus:ring-farol-text/50"
             data-i18n="talents.ctaAll">
            <span class="font-agharti text-farol-text leading-none whitespace-nowrap"
                  style="font-size:clamp(32px,4vw,68px);font-variation-settings:'wdth' 34">
              CONHEÇA TODOS OS NOSSOS TALENTOS
            </span>
            <!-- Circle arrow icon -->
            <span class="flex items-center justify-center bg-farol-beige rounded-full border-[3px] border-farol-black
                         shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0"
                  style="width:56px;height:56px" aria-hidden="true">
              <svg width="24" height="18" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 14H38M38 14L26 2M38 14L26 26" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

      </div>
    `
  }

  // ── Update arrow states and track position ────────────────────────────────
  function updateSlider() {
    const track    = document.getElementById('slider-track')
    const btnPrev  = document.getElementById('slider-prev')
    const btnNext  = document.getElementById('slider-next')
    if (!track || !btnPrev || !btnNext) return

    const visible  = visibleCount()
    const total    = creators.length
    const maxIndex = Math.max(0, total - visible)

    // Clamp current index
    if (currentIndex < 0)        currentIndex = 0
    if (currentIndex > maxIndex) currentIndex = maxIndex

    // Calculate card width (first card element)
    const firstCard = track.querySelector('.talent-card')
    const cardW     = firstCard ? firstCard.offsetWidth : 0
    const gap       = 24
    const offset    = currentIndex * (cardW + gap)

    track.style.transform = `translateX(-${offset}px)`

    // Arrow disabled states
    const atStart = currentIndex === 0
    const atEnd   = currentIndex >= maxIndex

    btnPrev.disabled = atStart
    btnPrev.setAttribute('aria-disabled', String(atStart))
    btnPrev.style.opacity = atStart ? '0.35' : '1'
    btnPrev.style.cursor  = atStart ? 'default' : 'pointer'

    btnNext.disabled = atEnd
    btnNext.setAttribute('aria-disabled', String(atEnd))
    btnNext.style.opacity = atEnd ? '0.35' : '1'
    btnNext.style.cursor  = atEnd ? 'default' : 'pointer'
  }

  // ── Wire arrow click handlers ─────────────────────────────────────────────
  function wireArrows() {
    const btnPrev = document.getElementById('slider-prev')
    const btnNext = document.getElementById('slider-next')

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--
          updateSlider()
        }
      })
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const visible  = visibleCount()
        const maxIndex = Math.max(0, creators.length - visible)
        if (currentIndex < maxIndex) {
          currentIndex++
          updateSlider()
        }
      })
    }
  }

  // ── Touch swipe support (ISSUE 20 — Tablet/Mobile) ────────────────────────
  function wireSwipe() {
    const viewport = document.getElementById('slider-viewport')
    if (!viewport) return

    let startX = 0
    let startY = 0

    viewport.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }, { passive: true })

    viewport.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY

      // Only register as horizontal swipe if dx is dominant
      if (Math.abs(dx) < Math.abs(dy)) return
      if (Math.abs(dx) < 40) return          // min swipe distance

      const visible  = visibleCount()
      const maxIndex = Math.max(0, creators.length - visible)

      if (dx < 0 && currentIndex < maxIndex) {
        // Swipe left → next
        currentIndex++
        updateSlider()
      } else if (dx > 0 && currentIndex > 0) {
        // Swipe right → prev
        currentIndex--
        updateSlider()
      }
    }, { passive: true })
  }

  // ── Re-calculate on window resize ─────────────────────────────────────────
  let _resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer)
    _resizeTimer = setTimeout(() => {
      // Reset to start if current index is out of new bounds
      const visible  = visibleCount()
      const maxIndex = Math.max(0, creators.length - visible)
      if (currentIndex > maxIndex) currentIndex = maxIndex
      updateSlider()
    }, 100)
  }, { passive: true })
  // Initial setup
  renderShell()
  wireArrows()
  wireSwipe()
  requestAnimationFrame(() => updateSlider())
}
