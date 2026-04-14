/**
 * slider.js — Slider de talentos em destaque
 * Issue 17: 3 cards no desktop, 1 no mobile, loop infinito, swipe touch, arrows
 */

(function () {
  'use strict';

  /**
   * Retorna quantos cards são visíveis dado o viewport atual.
   */
  function visibleCount() {
    if (window.innerWidth >= 1024) return 3; // lg
    if (window.innerWidth >= 768) return 2;  // md
    return 1;                                // mobile
  }

  /**
   * Renderiza o HTML de um card de creator.
   * @param {Object} creator
   */
  function renderCard(creator) {
    var socials = '';

    if (creator.instagram_url) {
      socials += '<a href="' + creator.instagram_url + '" target="_blank" rel="noopener noreferrer" ' +
        'aria-label="Instagram de ' + creator.name + '" ' +
        'class="inline-flex items-center gap-1 font-serif italic text-sm text-brand-black hover:text-brand-red transition-colors">' +
        '<svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
          '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>' +
        '</svg>' +
        '@' + creator.instagram_url.replace(/.*instagram\.com\//, '').replace(/\/$/, '') +
        '</a>';
    }

    if (creator.youtube_url) {
      socials += '<a href="' + creator.youtube_url + '" target="_blank" rel="noopener noreferrer" ' +
        'aria-label="YouTube de ' + creator.name + '" ' +
        'class="inline-flex items-center gap-1 font-serif italic text-sm text-brand-black hover:text-brand-red transition-colors">' +
        '<svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
          '<path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>' +
        '</svg>' +
        'YouTube' +
        '</a>';
    }

    if (creator.tiktok_url) {
      socials += '<a href="' + creator.tiktok_url + '" target="_blank" rel="noopener noreferrer" ' +
        'aria-label="TikTok de ' + creator.name + '" ' +
        'class="inline-flex items-center gap-1 font-serif italic text-sm text-brand-black hover:text-brand-red transition-colors">' +
        '<svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
          '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>' +
        '</svg>' +
        '@' + creator.tiktok_url.replace(/.*tiktok\.com\/@/, '').replace(/\/$/, '') +
        '</a>';
    }

    return '<div class="slider-card" role="group" aria-label="Foto de ' + creator.name + '">' +
      '<div class="slider-card-inner">' +
        '<img ' +
          'src="' + creator.photo_url + '" ' +
          'alt="Foto de ' + creator.name + '" ' +
          'class="slider-card-photo" ' +
          'loading="lazy" ' +
        '/>' +
        '<div class="slider-card-info">' +
          '<p class="font-agharti font-black text-2xl md:text-3xl uppercase text-brand-black leading-none mb-3">' + creator.name + '</p>' +
          (creator.category ? '<p class="font-casual text-sm text-brand-black/70 mb-3">' + creator.category + '</p>' : '') +
          (socials ? '<div class="flex flex-wrap gap-3">' + socials + '</div>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /**
   * Inicializa o slider com o array de creators.
   * Chamado por main.js após carregar os dados.
   * @param {Array} creators
   */
  window.initSlider = function (creators) {
    var track    = document.getElementById('slider-track');
    var viewport = document.getElementById('slider-viewport');
    var skeleton = document.getElementById('slider-skeleton');
    var fallback = document.getElementById('slider-fallback');
    var btnPrev  = document.getElementById('slider-prev');
    var btnNext  = document.getElementById('slider-next');

    if (!track || !creators || !creators.length) {
      if (skeleton) skeleton.classList.add('hidden');
      if (fallback) fallback.classList.remove('hidden');
      return;
    }

    // Esconde skeleton, exibe slider
    if (skeleton) skeleton.classList.add('hidden');
    viewport.classList.remove('hidden');

    var count  = creators.length;
    var index  = 0; // índice lógico atual (0 .. count-1)
    var vis    = visibleCount();
    var moving = false;

    // Renderiza todos os cards
    track.innerHTML = creators.map(renderCard).join('');

    // Ajusta a largura do card conforme visíveis
    function updateCardWidths() {
      vis = visibleCount();
      var pct = (100 / vis) + '%';
      track.querySelectorAll('.slider-card').forEach(function (card) {
        card.style.width = pct;
      });
    }

    // Move para um índice sem animação (para loop)
    function jumpTo(i) {
      track.style.transition = 'none';
      track.style.transform  = 'translateX(-' + (i * (100 / vis)) + '%)';
    }

    // Move com animação
    function slideTo(i) {
      track.style.transition = 'transform 0.4s ease-in-out';
      track.style.transform  = 'translateX(-' + (i * (100 / vis)) + '%)';
    }

    function goNext() {
      if (moving) return;
      moving = true;
      index = (index + 1) % count;
      slideTo(index);
      setTimeout(function () { moving = false; }, 450);
    }

    function goPrev() {
      if (moving) return;
      moving = true;
      index = (index - 1 + count) % count;
      slideTo(index);
      setTimeout(function () { moving = false; }, 450);
    }

    updateCardWidths();
    jumpTo(0);

    btnNext.addEventListener('click', goNext);
    btnPrev.addEventListener('click', goPrev);

    // Touch / swipe
    var touchStartX = 0;
    var touchEndX   = 0;

    viewport.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goNext() : goPrev();
      }
    }, { passive: true });

    // Recalcula em resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateCardWidths();
        jumpTo(index);
      }, 150);
    });
  };
})();
