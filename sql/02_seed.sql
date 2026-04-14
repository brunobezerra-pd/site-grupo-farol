-- =============================================================
-- Grupo Farol — Initial seed for content table
-- Run AFTER 01_schema.sql
-- Replace placeholder values with real content before going live
-- =============================================================

INSERT INTO content (key, value) VALUES

  -- Hero section
  ('hero_headline',    'A Maior Agência de Creators da América Latina'),
  ('hero_subheadline', 'Conectamos marcas e talentos para criar histórias que engajam.'),
  ('hero_cta1_text',   'Conheça Nossos Creators'),
  ('hero_cta1_url',    '#creators'),
  ('hero_cta2_text',   'Fale com o Farol'),
  ('hero_cta2_url',    ''),   -- ⚠️ Open decision D01: define destination (WhatsApp, email or URL)

  -- About section
  ('about_text',        'O Grupo Farol é a maior agência de creators da América Latina. Trabalhamos com marcas e talentos para criar conexões autênticas e campanhas de alto impacto.'),
  ('about_stat1_value', '+200'),
  ('about_stat1_label', 'Creators no Casting'),
  ('about_stat2_value', '+1000'),
  ('about_stat2_label', 'Projetos Realizados'),
  ('about_stat3_value', '+1000'),
  ('about_stat3_label', 'Clientes Atendidos'),

  -- Final CTA section
  ('cta_final_text',     'Pronto para criar algo incrível?'),
  ('cta_final_subtext',  'Fale com nossa equipe e descubra como o Farol pode impulsionar sua marca.'),
  ('cta_final_btn_text', 'Fale com o Farol'),
  ('cta_final_btn_url',  ''),  -- ⚠️ Same as D01 — fill in after client decision

  -- Settings
  ('contact_url', '')          -- ⚠️ Open decision D01

ON CONFLICT (key) DO NOTHING;
