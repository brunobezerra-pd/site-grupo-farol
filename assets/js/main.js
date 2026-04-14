/**
 * main.js — Orquestra o carregamento de dados do site público.
 * Issues 14-20: renderiza conteúdo dinâmico de cada seção.
 * Issue 21: Promise.all, skeleton loaders, fallbacks individuais por seção.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* STRINGS — i18n stub (PT-BR); estrutura pronta para troca de idioma  */
  /* ------------------------------------------------------------------ */
  var STRINGS = {
    skip_to_content:        'Ir para o conteúdo',
    nav_sobre:              'SoBre',
    nav_talentos:           'TALENTOS',
    nav_como:               'Como TrAbALHAMOS',
    nav_parceiros:          'cONtatos',
    nav_fale:               'FAle conOsco',
    hero_fallback_headline: 'A maior agência de creators da América Latina',
    hero_fallback_cta:      'Conheça nossos Creators',
    about_somos:            'SoMos o',
    creators_mais:          'MAIS DE',
    creators_headline:      '200 CREATORS.',
    creators_sub:           'Centenas de comunidades.',
    creators_desc:          'Nosso casting reúne talentos que construíram comunidades reais em diferentes <strong>territórios</strong> da cultura digital.',
    tag_humor:              'HUMOR & CRIATIVIDADE',
    tag_gastro:             'GASTRONOMIA',
    tag_esportes:           'ESPORTES & GAMES',
    tag_moda:               'MODA & BELEZA',
    tag_lifestyle:          'LIFESTYLE',
    tag_paginas:            'PÁGINAS & COMUNIDADES',
    talents_heading:        'TALENTOS EM DESTAQUE',
    talents_sub:            'Conheça alguns dos creators que fazem parte da nossa curadoria.',
    talents_cta:            'CONHEÇA TODOS OS NOSSOS TALENTOS',
    talents_fallback:       'Talentos em breve.',
    how_label:              'COMO TRABALHAMOS',
    how_heading:            'COM MARCAS',
    how_sub:                'Um processo estruturado que combina curadoria humana, visão estratégica e execução impecável.',
    partners_heading:       'DE QUEM SOMOS PARCEIROS',
    partners_empty:         'Em breve nossos parceiros.',
    cta_label:              'VAMOS CO-CRIAR JUNTOS?',
    cta_fallback_label:     'VAMOS CO-CRIAR JUNTOS?',
    cta_fallback_btn:       'FALE COM O FAROL',
    footer_copy:            '© 2025 Grupo Farol. Todos os direitos reservados.',
  };

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function el(id) { return document.getElementById(id); }

  function setText(id, value) {
    var node = el(id);
    if (node && value !== undefined && value !== null) node.textContent = value;
  }

  function setHref(id, value) {
    var node = el(id);
    if (node && value) node.href = value;
  }

  function show(id) {
    var node = el(id);
    if (node) node.classList.remove('hidden');
  }

  function hide(id) {
    var node = el(id);
    if (node) node.classList.add('hidden');
  }

  /* ------------------------------------------------------------------ */
  /* Fetch                                                                */
  /* ------------------------------------------------------------------ */

  function fetchContent() {
    return fetch('/api/content')
      .then(function (res) {
        if (!res.ok) throw new Error('content ' + res.status);
        return res.json();
      });
  }

  function fetchCreators() {
    return fetch('/api/creators')
      .then(function (res) {
        if (!res.ok) throw new Error('creators ' + res.status);
        return res.json();
      });
  }

  function fetchPartners() {
    return fetch('/api/partners')
      .then(function (res) {
        if (!res.ok) throw new Error('partners ' + res.status);
        return res.json();
      });
  }

  /* ------------------------------------------------------------------ */
  /* Render — Hero (Issue 14)                                             */
  /* ------------------------------------------------------------------ */

  function renderHero(data) {
    hide('hero-skeleton');

    var headline    = data.hero_headline;
    var subheadline = data.hero_subheadline;
    var cta1Text    = data.hero_cta1_text;
    var cta1Url     = data.hero_cta1_url;
    var cta2Text    = data.hero_cta2_text;
    var cta2Url     = data.hero_cta2_url;

    if (!headline) {
      // Dados insuficientes — exibe fallback
      show('hero-fallback');
      return;
    }

    // Separa em duas partes pelo delimitador "|"
    // Ex: "A Maior Agência de Creators da|América Latina"
    var parts = headline.split('|');
    setText('hero-headline-part1', parts[0].trim());
    setText('hero-headline-part2', (parts[1] || '').trim());

    setText('hero-subheadline', subheadline || '');
    setText('hero-cta1-text',   cta1Text    || 'Conheça nossos Creators');
    setText('hero-cta2-text',   cta2Text    || 'Fale com o Farol');
    setHref('hero-cta1', cta1Url || '#talentos');
    setHref('hero-cta2', cta2Url || '#cta-final');

    show('hero-content');
  }

  function renderHeroFallback() {
    hide('hero-skeleton');
    show('hero-fallback');
  }

  /* ------------------------------------------------------------------ */
  /* Render — About (Issue 15)                                            */
  /* ------------------------------------------------------------------ */

  function renderAbout(data) {
    hide('about-skeleton-left');
    hide('about-stats-skeleton');

    var text    = data.about_text;
    var s1v     = data.about_stat1_value;
    var s1l     = data.about_stat1_label;
    var s2v     = data.about_stat2_value;
    var s2l     = data.about_stat2_label;
    var s3v     = data.about_stat3_value;
    var s3l     = data.about_stat3_label;

    // Texto institucional
    if (text) {
      var textNode = el('about-text');
      if (textNode) {
        // Parágrafos separados por quebra de linha dupla
        var paragraphs = text.split(/\n\n+/);
        textNode.innerHTML = paragraphs.map(function (p) {
          return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
        }).join('');
      }
    }

    // Stats
    setText('about-stat1-value', s1v || '+200');
    setText('about-stat1-label', s1l || 'Creators no Casting');
    setText('about-stat2-value', s2v || '+1000');
    setText('about-stat2-label', s2l || 'Projetos Realizados');
    setText('about-stat3-value', s3v || '+1000');
    setText('about-stat3-label', s3l || 'Clientes e Parceiros');

    show('about-content');
    show('about-stats');
  }

  function renderAboutFallback() {
    hide('about-skeleton-left');
    hide('about-stats-skeleton');
    // Exibe conteúdo com defaults já preenchidos
    setText('about-stat1-value', '+200');
    setText('about-stat1-label', 'Creators no Casting');
    setText('about-stat2-value', '+1000');
    setText('about-stat2-label', 'Projetos Realizados');
    setText('about-stat3-value', '+1000');
    setText('about-stat3-label', 'Clientes e Parceiros');
    show('about-content');
    show('about-stats');
  }

  /* ------------------------------------------------------------------ */
  /* Render — Creators Slider (Issue 17)                                  */
  /* ------------------------------------------------------------------ */

  function renderCreators(creators) {
    if (typeof window.initSlider === 'function') {
      window.initSlider(creators);
    }
  }

  function renderCreatorsFallback() {
    hide('slider-skeleton');
    show('slider-fallback');
  }

  /* ------------------------------------------------------------------ */
  /* Render — Partners (Issue 19)                                         */
  /* ------------------------------------------------------------------ */

  function renderPartners(partners) {
    hide('partners-skeleton');

    if (!partners || !partners.length) {
      show('partners-empty');
      return;
    }

    var grid = el('partners-grid');
    if (!grid) return;

    grid.innerHTML = partners.map(function (p) {
      return '<div class="flex items-center justify-center p-4 bg-white rounded-xl">' +
        '<img ' +
          'src="' + p.logo_url + '" ' +
          'alt="' + p.name + ' logo" ' +
          'class="max-h-12 max-w-full object-contain" ' +
          'loading="lazy" ' +
        '/>' +
      '</div>';
    }).join('');

    show('partners-grid');
  }

  function renderPartnersFallback() {
    hide('partners-skeleton');
    // Seção simplesmente não aparece — sem parceiros cadastrados ainda
    var section = document.getElementById('parceiros');
    if (section) section.classList.add('hidden');
  }

  /* ------------------------------------------------------------------ */
  /* Render — Final CTA (Issue 20)                                        */
  /* ------------------------------------------------------------------ */

  function renderCta(data) {
    hide('cta-skeleton');

    var text    = data.cta_final_text;
    var subtext = data.cta_final_subtext;
    var btnText = data.cta_final_btn_text;
    var btnUrl  = data.cta_final_btn_url;
    var contact = data.contact_url;

    if (!text && !btnText) {
      show('cta-fallback');
      return;
    }

    setText('cta-text',    text    || '');
    setText('cta-subtext', subtext || '');
    setText('cta-btn-text', btnText || 'FALE COM O FAROL');
    setHref('cta-btn', btnUrl || contact || '#');

    // Atualiza link de contato no footer também
    if (contact) setHref('footer-contact-link', contact);

    show('cta-content');
  }

  function renderCtaFallback() {
    hide('cta-skeleton');
    show('cta-fallback');
  }

  /* ------------------------------------------------------------------ */
  /* Inicialização — Promise.all                                          */
  /* ------------------------------------------------------------------ */

  function init() {
    var contentPromise  = fetchContent().catch(function (err) { console.warn('[farol] content:', err); return null; });
    var creatorsPromise = fetchCreators().catch(function (err) { console.warn('[farol] creators:', err); return null; });
    var partnersPromise = fetchPartners().catch(function (err) { console.warn('[farol] partners:', err); return null; });

    Promise.all([contentPromise, creatorsPromise, partnersPromise])
      .then(function (results) {
        var content  = results[0];
        var creators = results[1];
        var partners = results[2];

        // Hero
        if (content) renderHero(content);
        else         renderHeroFallback();

        // About
        if (content) renderAbout(content);
        else         renderAboutFallback();

        // CTA Final
        if (content) renderCta(content);
        else         renderCtaFallback();

        // Creators slider
        if (creators && creators.length) renderCreators(creators);
        else                              renderCreatorsFallback();

        // Partners
        if (partners !== null) renderPartners(partners);
        else                    renderPartnersFallback();
      });
  }

  // Aguarda o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
