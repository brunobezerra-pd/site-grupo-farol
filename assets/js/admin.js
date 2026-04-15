// admin.js — Dashboard panel logic
// Covers: auth, tabs, toast, image slots, and all section forms (ISSUES 09–12).

// ── Module-level state ──────────────────────────────────────────────────────
let _supabase = null
let _contentData = {}

// ── Helpers: Auth ───────────────────────────────────────────────────────────

async function getSession() {
  const { data: { session } } = await _supabase.auth.getSession()
  return session
}

async function authHeaders() {
  const session = await getSession()
  if (!session) { location.href = '/admin/'; return null }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

// ── Helpers: Content API ────────────────────────────────────────────────────

async function loadContent() {
  const res = await fetch('/api/content')
  if (!res.ok) throw new Error('Failed to load content')
  _contentData = await res.json()
  return _contentData
}

async function saveContent(updates) {
  const headers = await authHeaders()
  if (!headers) return
  const res = await fetch('/api/content', {
    method: 'POST',
    headers,
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Erro ao salvar')
  }
  Object.assign(_contentData, updates)
}

// ── Toast ───────────────────────────────────────────────────────────────────

let _toastTimer = null

function showToast(msg, type = 'success') {
  const el = document.getElementById('toast')
  if (!el) return
  if (_toastTimer) clearTimeout(_toastTimer)
  el.textContent = msg
  el.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 toast-${type} toast-visible`
  _toastTimer = setTimeout(() => {
    el.classList.remove('toast-visible')
    el.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none')
  }, 3500)
}

// ── Tabs ────────────────────────────────────────────────────────────────────

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'))

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab))

    tab.addEventListener('keydown', (e) => {
      let target = null
      if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length]
      if (e.key === 'ArrowLeft')  target = tabs[(i - 1 + tabs.length) % tabs.length]
      if (e.key === 'Home')       target = tabs[0]
      if (e.key === 'End')        target = tabs[tabs.length - 1]
      if (target) { target.click(); target.focus(); e.preventDefault() }
    })
  })

  // Activate the first tab on load
  if (tabs.length) activateTab(tabs[0].dataset.tab)
}

function activateTab(tabId) {
  document.querySelectorAll('[role="tab"]').forEach(t => {
    const active = t.dataset.tab === tabId
    t.setAttribute('aria-selected', String(active))
  })
  document.querySelectorAll('[role="tabpanel"]').forEach(p => {
    p.hidden = p.id !== `panel-${tabId}`
  })
}

// ── Field builder helpers ───────────────────────────────────────────────────

function fieldHTML({ id, label, type = 'text', value = '', placeholder = '' }) {
  const val = (value ?? '').replace(/"/g, '&quot;')
  if (type === 'textarea') {
    return `
      <div class="admin-field">
        <label for="${id}">${label}</label>
        <textarea id="${id}" placeholder="${placeholder}">${val}</textarea>
      </div>`
  }
  return `
    <div class="admin-field">
      <label for="${id}">${label}</label>
      <input type="${type}" id="${id}" value="${val}" placeholder="${placeholder}" />
    </div>`
}

function val(id) {
  const el = document.getElementById(id)
  return el ? el.value.trim() : ''
}

function setSaving(btnId, saving) {
  const btn = document.getElementById(btnId)
  if (!btn) return
  btn.disabled = saving
  btn.textContent = saving ? 'Salvando…' : btn.dataset.label || btn.textContent
  if (!saving && !btn.dataset.label) btn.dataset.label = btn.textContent
}

// ── Image Slot Component ────────────────────────────────────────────────────
// createImageSlot({ containerId, contentKey, label, bucket? })
// Renders into the element with `containerId`.
// Manages its own upload/remove logic against /api/upload and /api/content.

function createImageSlot({ containerId, contentKey, label, bucket = 'content' }) {
  const container = document.getElementById(containerId)
  if (!container) return

  let currentUrl = _contentData[contentKey] || ''

  render()

  function render() {
    container.innerHTML = `
      <div class="image-slot">
        <span class="image-slot-label">${label}</span>
        <div class="image-slot-preview" id="${containerId}-preview">
          ${previewHTML()}
        </div>
        <div class="image-slot-actions">
          <label class="image-slot-upload-label" for="${containerId}-input">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4-4m0 0L8 10m4-4v12"/>
            </svg>
            Enviar imagem
            <input
              type="file"
              id="${containerId}-input"
              accept="image/*"
              class="sr-only"
              aria-label="Enviar imagem para ${label}"
            />
          </label>
          <button
            type="button"
            id="${containerId}-remove"
            class="image-slot-remove-btn ${currentUrl ? '' : 'hidden'}"
            aria-label="Remover imagem de ${label}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5"/>
            </svg>
            Remover
          </button>
        </div>
        <p class="mt-2 text-xs text-gray-400">JPEG, PNG, WebP ou GIF · Máx. 2MB</p>
      </div>`

    wireEvents()
  }

  function previewHTML() {
    if (currentUrl) {
      return `<img src="${currentUrl}" alt="${label}" />`
    }
    return `
      <div class="image-slot-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="text-xs">Sem imagem</span>
      </div>`
  }

  function wireEvents() {
    const input  = document.getElementById(`${containerId}-input`)
    const remove = document.getElementById(`${containerId}-remove`)

    input.addEventListener('change', async () => {
      const file = input.files[0]
      if (!file) return
      input.value = ''

      if (!file.type.startsWith('image/')) {
        showToast('Apenas arquivos de imagem são permitidos.', 'error'); return
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 2MB.', 'error'); return
      }

      try {
        const session = await getSession()
        if (!session) return

        // Upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)
        const upRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error || 'Falha no upload')

        // Persist URL
        await saveContent({ [contentKey]: upData.url })
        currentUrl = upData.url
        updatePreview()
        showToast('Imagem salva com sucesso.')
      } catch (err) {
        showToast(err.message || 'Erro ao enviar imagem.', 'error')
      }
    })

    remove.addEventListener('click', async () => {
      if (!currentUrl) return
      try {
        const session = await getSession()
        if (!session) return

        // Extract storage path from public URL
        // URL format: https://{ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
        const marker = `/object/public/${bucket}/`
        const url    = new URL(currentUrl)
        const path   = url.pathname.slice(url.pathname.indexOf(marker) + marker.length)

        await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bucket, path }),
        })

        await saveContent({ [contentKey]: '' })
        currentUrl = ''
        updatePreview()
        showToast('Imagem removida.')
      } catch (err) {
        showToast(err.message || 'Erro ao remover imagem.', 'error')
      }
    })
  }

  function updatePreview() {
    const preview = document.getElementById(`${containerId}-preview`)
    const remove  = document.getElementById(`${containerId}-remove`)
    if (preview) preview.innerHTML = previewHTML()
    if (remove)  remove.classList.toggle('hidden', !currentUrl)
  }
}

// ── Hero tab ────────────────────────────────────────────────────────────────
function initHeroTab() {
  const c = _contentData
  document.getElementById('hero-fields').innerHTML = `
    ${fieldHTML({ id: 'hero_headline',     label: 'Título principal',   value: c.hero_headline,     placeholder: 'Ex: Somos a maior agência de creators da América Latina' })}
    ${fieldHTML({ id: 'hero_subheadline',  label: 'Subtítulo',          value: c.hero_subheadline,  placeholder: 'Ex: Conectamos marcas e talentos...' })}
    <fieldset class="border border-gray-200 rounded-xl p-4">
      <legend class="text-sm font-semibold text-gray-700 px-1">CTA 1</legend>
      <div class="space-y-4 mt-2">
        ${fieldHTML({ id: 'hero_cta1_text', label: 'Texto do botão', value: c.hero_cta1_text, placeholder: 'Ex: Conheça Nossos Creators' })}
        ${fieldHTML({ id: 'hero_cta1_url',  label: 'URL / âncora',   value: c.hero_cta1_url,  placeholder: 'Ex: #talentos ou https://...' })}
      </div>
    </fieldset>
    <fieldset class="border border-gray-200 rounded-xl p-4">
      <legend class="text-sm font-semibold text-gray-700 px-1">CTA 2</legend>
      <div class="space-y-4 mt-2">
        ${fieldHTML({ id: 'hero_cta2_text', label: 'Texto do botão', value: c.hero_cta2_text, placeholder: 'Ex: Fale com o Farol' })}
        ${fieldHTML({ id: 'hero_cta2_url',  label: 'URL / âncora',   value: c.hero_cta2_url,  placeholder: 'Ex: #contato ou https://wa.me/...' })}
      </div>
    </fieldset>`

  document.getElementById('save-hero').addEventListener('click', async () => {
    setSaving('save-hero', true)
    try {
      await saveContent({
        hero_headline:    val('hero_headline'),
        hero_subheadline: val('hero_subheadline'),
        hero_cta1_text:   val('hero_cta1_text'),
        hero_cta1_url:    val('hero_cta1_url'),
        hero_cta2_text:   val('hero_cta2_text'),
        hero_cta2_url:    val('hero_cta2_url'),
      })
      showToast('Hero salvo com sucesso.')
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setSaving('save-hero', false)
    }
  })
}

// ── About tab ────────────────────────────────────────────────────────────────
function initAboutTab() {
  const c = _contentData
  document.getElementById('about-fields').innerHTML = `
    ${fieldHTML({ id: 'about_text', label: 'Texto institucional', type: 'textarea', value: c.about_text, placeholder: 'Escreva o texto da seção Sobre...' })}
    <fieldset class="border border-gray-200 rounded-xl p-4">
      <legend class="text-sm font-semibold text-gray-700 px-1">Números em destaque</legend>
      <div class="space-y-5 mt-2">
        <div class="grid grid-cols-2 gap-4">
          ${fieldHTML({ id: 'about_stat1_value', label: 'Número 1', value: c.about_stat1_value, placeholder: 'Ex: +200' })}
          ${fieldHTML({ id: 'about_stat1_label', label: 'Rótulo 1', value: c.about_stat1_label, placeholder: 'Ex: Creators' })}
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${fieldHTML({ id: 'about_stat2_value', label: 'Número 2', value: c.about_stat2_value, placeholder: 'Ex: +1000' })}
          ${fieldHTML({ id: 'about_stat2_label', label: 'Rótulo 2', value: c.about_stat2_label, placeholder: 'Ex: Projetos' })}
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${fieldHTML({ id: 'about_stat3_value', label: 'Número 3', value: c.about_stat3_value, placeholder: 'Ex: +1000' })}
          ${fieldHTML({ id: 'about_stat3_label', label: 'Rótulo 3', value: c.about_stat3_label, placeholder: 'Ex: Clientes' })}
        </div>
      </div>
    </fieldset>`

  // Image slot
  createImageSlot({
    containerId: 'slot-about-image',
    contentKey:  'about_image_url',
    label:       'Imagem da seção Sobre',
  })

  document.getElementById('save-about').addEventListener('click', async () => {
    setSaving('save-about', true)
    try {
      await saveContent({
        about_text:         val('about_text'),
        about_stat1_value:  val('about_stat1_value'),
        about_stat1_label:  val('about_stat1_label'),
        about_stat2_value:  val('about_stat2_value'),
        about_stat2_label:  val('about_stat2_label'),
        about_stat3_value:  val('about_stat3_value'),
        about_stat3_label:  val('about_stat3_label'),
      })
      showToast('Sobre salvo com sucesso.')
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setSaving('save-about', false)
    }
  })
}

// ── Talents tab ─────────────────────────────────────────────────────────────
function initTalentsTab() {
  const root = document.getElementById('talents-content')

  // State
  let creators        = []
  let editingId       = null   // null = add mode, UUID = edit mode
  let editingPhotoUrl = ''     // current photo when editing

  // ── Fetch & render list ──────────────────────────────────────────────────
  async function loadCreators() {
    const res = await fetch('/api/creators')
    creators  = res.ok ? await res.json() : []
    renderAll()
  }

  function renderAll() {
    root.innerHTML = listHTML() + formHTML()
    wireForm()
  }

  // ── List HTML ────────────────────────────────────────────────────────────
  function listHTML() {
    const rows = creators.length
      ? creators.map(c => `
          <div class="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
            <span class="w-7 text-center text-xs font-semibold text-gray-400">${c.position}</span>
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              ${c.photo_url
                ? `<img src="${c.photo_url}" alt="Foto de ${c.name}" class="w-full h-full object-cover" />`
                : `<div class="w-full h-full flex items-center justify-center text-gray-300">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                   </div>`}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-800 truncate">${c.name}</p>
              <p class="text-xs text-gray-400 truncate">${c.category}</p>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
              ${c.instagram_url ? `<span title="Instagram">IG</span>` : ''}
              ${c.youtube_url   ? `<span title="YouTube">YT</span>`  : ''}
              ${c.tiktok_url    ? `<span title="TikTok">TK</span>`   : ''}
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                data-action="edit-creator"
                data-id="${c.id}"
                class="text-xs font-medium text-gray-500 hover:text-farol-burning-red focus:outline-none transition"
              >Editar</button>
              <button
                type="button"
                data-action="delete-creator"
                data-id="${c.id}"
                data-name="${c.name.replace(/"/g, '&quot;')}"
                class="text-xs font-medium text-gray-400 hover:text-red-500 focus:outline-none transition"
              >Remover</button>
            </div>
          </div>`).join('')
      : `<p class="text-sm text-gray-400 py-4">Nenhum creator cadastrado ainda.</p>`

    return `
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-700">Creators cadastrados</h3>
          <button id="add-creator-btn" type="button" class="admin-save-btn text-xs">+ Adicionar creator</button>
        </div>
        <div id="creators-list">${rows}</div>
      </div>`
  }

  // ── Form HTML ────────────────────────────────────────────────────────────
  function formHTML() {
    return `
      <div id="creator-form-wrap" class="bg-white border border-gray-200 rounded-xl p-5 hidden">
        <h3 id="creator-form-title" class="font-semibold text-gray-700 mb-5">Adicionar creator</h3>

        <!-- Photo upload -->
        <div class="mb-5">
          <span class="block text-sm font-medium text-gray-700 mb-2">Foto</span>
          <div class="flex items-start gap-4">
            <div id="creator-photo-preview"
              class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div>
              <label class="image-slot-upload-label" for="creator-photo-input">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4-4m0 0L8 10m4-4v12"/></svg>
                Selecionar foto
                <input type="file" id="creator-photo-input" accept="image/*" class="sr-only" />
              </label>
              <p class="mt-1.5 text-xs text-gray-400">JPEG, PNG, WebP · Máx. 2MB</p>
              <p id="creator-photo-name" class="mt-1 text-xs text-farol-burning-red hidden"></p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          ${fieldHTML({ id: 'creator-name',     label: 'Nome *',     placeholder: 'Ex: Ana Lima' })}
          ${fieldHTML({ id: 'creator-category', label: 'Categoria *', placeholder: 'Ex: Gastronomia' })}
          ${fieldHTML({ id: 'creator-position', label: 'Posição (ordem de exibição) *', type: 'number', placeholder: '1' })}
          ${fieldHTML({ id: 'creator-instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' })}
          ${fieldHTML({ id: 'creator-youtube',   label: 'YouTube URL',   placeholder: 'https://youtube.com/...' })}
          ${fieldHTML({ id: 'creator-tiktok',    label: 'TikTok URL',    placeholder: 'https://tiktok.com/@...' })}
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button id="save-creator-btn" type="button" class="admin-save-btn">Salvar creator</button>
          <button id="cancel-creator-btn" type="button"
            class="text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition">
            Cancelar
          </button>
        </div>
      </div>`
  }

  // ── Wire form events ─────────────────────────────────────────────────────
  function wireForm() {
    root.addEventListener('click', async (e) => {
      if (e.target.closest('#add-creator-btn'))    openForm(null)
      if (e.target.closest('#cancel-creator-btn')) closeForm()
      if (e.target.closest('[data-action="edit-creator"]')) {
        const btn = e.target.closest('[data-action="edit-creator"]')
        const creator = creators.find(c => c.id === btn.dataset.id)
        if (creator) openForm(creator)
      }
      if (e.target.closest('[data-action="delete-creator"]')) {
        const btn = e.target.closest('[data-action="delete-creator"]')
        await handleDelete(btn.dataset.id, btn.dataset.name)
      }
      if (e.target.closest('#save-creator-btn')) await handleSave()
    }, { once: false })

    // Photo preview on file select
    root.addEventListener('change', (e) => {
      if (e.target.id !== 'creator-photo-input') return
      const file = e.target.files[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        showToast('Apenas imagens são permitidas.', 'error')
        e.target.value = ''; return
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 2MB.', 'error')
        e.target.value = ''; return
      }
      const preview  = document.getElementById('creator-photo-preview')
      const nameEl   = document.getElementById('creator-photo-name')
      const reader   = new FileReader()
      reader.onload  = () => {
        preview.innerHTML = `<img src="${reader.result}" alt="Prévia" class="w-full h-full object-cover" />`
      }
      reader.readAsDataURL(file)
      nameEl.textContent = file.name
      nameEl.classList.remove('hidden')
    })
  }

  // ── Open / close form ────────────────────────────────────────────────────
  function openForm(creator) {
    editingId       = creator ? creator.id : null
    editingPhotoUrl = creator ? (creator.photo_url || '') : ''

    const wrap  = document.getElementById('creator-form-wrap')
    const title = document.getElementById('creator-form-title')
    wrap.classList.remove('hidden')
    title.textContent = creator ? 'Editar creator' : 'Adicionar creator'

    document.getElementById('creator-name').value      = creator ? creator.name          : ''
    document.getElementById('creator-category').value  = creator ? creator.category      : ''
    document.getElementById('creator-position').value  = creator ? creator.position      : ''
    document.getElementById('creator-instagram').value = creator ? (creator.instagram_url || '') : ''
    document.getElementById('creator-youtube').value   = creator ? (creator.youtube_url  || '') : ''
    document.getElementById('creator-tiktok').value    = creator ? (creator.tiktok_url   || '') : ''

    const preview = document.getElementById('creator-photo-preview')
    if (editingPhotoUrl) {
      preview.innerHTML = `<img src="${editingPhotoUrl}" alt="Foto atual" class="w-full h-full object-cover" />`
    } else {
      preview.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`
    }
    document.getElementById('creator-photo-name').classList.add('hidden')
    document.getElementById('creator-photo-input').value = ''

    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function closeForm() {
    document.getElementById('creator-form-wrap').classList.add('hidden')
    editingId = null
  }

  // ── Save (add or edit) ───────────────────────────────────────────────────
  async function handleSave() {
    const name     = val('creator-name')
    const category = val('creator-category')
    const position = parseInt(document.getElementById('creator-position').value, 10)
    const fileInput = document.getElementById('creator-photo-input')
    const file      = fileInput.files[0]

    if (!name || !category) {
      showToast('Nome e categoria são obrigatórios.', 'error'); return
    }
    if (!editingId && !file) {
      showToast('A foto é obrigatória para novos creators.', 'error'); return
    }
    if (isNaN(position)) {
      showToast('Posição deve ser um número.', 'error'); return
    }

    const btn = document.getElementById('save-creator-btn')
    btn.disabled = true; btn.textContent = 'Salvando…'

    try {
      const session = await getSession()
      if (!session) return

      let photoUrl = editingPhotoUrl

      // Upload new photo if provided
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'creators')
        const upRes  = await fetch('/api/upload', {
          method:  'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body:    formData,
        })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error || 'Falha no upload da foto')
        photoUrl = upData.url
      }

      const payload = {
        name,
        category,
        photo_url:     photoUrl,
        position,
        instagram_url: val('creator-instagram') || null,
        youtube_url:   val('creator-youtube')   || null,
        tiktok_url:    val('creator-tiktok')    || null,
      }

      const headers = { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }

      if (editingId) {
        const res = await fetch('/api/creators', {
          method: 'PUT', headers,
          body: JSON.stringify({ id: editingId, ...payload }),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
        showToast('Creator atualizado.')
      } else {
        const res = await fetch('/api/creators', {
          method: 'POST', headers,
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
        showToast('Creator adicionado.')
      }

      closeForm()
      await loadCreators()
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
      btn.disabled = false; btn.textContent = 'Salvar creator'
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(id, name) {
    if (!confirm(`Remover "${name}"? Esta ação não pode ser desfeita.`)) return
    try {
      const session = await getSession()
      if (!session) return
      const res = await fetch('/api/creators', {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      showToast('Creator removido.')
      await loadCreators()
    } catch (err) {
      showToast(err.message || 'Erro ao remover.', 'error')
    }
  }

  // ── Boot ─────────────────────────────────────────────────────────────────
  loadCreators()
}

// ── Partners tab ────────────────────────────────────────────────────────────
function initPartnersTab() {
  const root = document.getElementById('partners-content')
  let partners = []

  async function loadPartners() {
    const res = await fetch('/api/partners')
    partners  = res.ok ? await res.json() : []
    render()
  }

  function render() {
    root.innerHTML = `
      <!-- Add partner form -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 class="font-semibold text-gray-700 mb-4">Adicionar parceiro</h3>
        <div class="space-y-4">
          ${fieldHTML({ id: 'partner-name', label: 'Nome da marca *', placeholder: 'Ex: Nestlé' })}
          <div class="admin-field">
            <label for="partner-logo-input">Logo *</label>
            <div class="flex items-start gap-4 mt-1">
              <div id="partner-logo-preview"
                class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300 border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <label class="image-slot-upload-label" for="partner-logo-input">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 10l-4-4m0 0L8 10m4-4v12"/>
                  </svg>
                  Selecionar logo
                  <input type="file" id="partner-logo-input" accept="image/*" class="sr-only" aria-label="Selecionar logo do parceiro" />
                </label>
                <p class="mt-1.5 text-xs text-gray-400">JPEG, PNG, WebP, SVG · Máx. 2MB</p>
                <p id="partner-logo-name" class="mt-1 text-xs text-farol-burning-red hidden"></p>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5">
          <button id="add-partner-btn" type="button" class="admin-save-btn">Adicionar parceiro</button>
        </div>
      </div>

      <!-- Partner grid -->
      <div class="bg-white border border-gray-200 rounded-xl p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Parceiros cadastrados</h3>
        ${partners.length ? `
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            ${partners.map(p => `
              <div class="border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2">
                <div class="w-full h-16 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                  <img src="${p.logo_url}" alt="${p.name} logo" class="max-h-full max-w-full object-contain" />
                </div>
                <p class="text-xs font-medium text-gray-600 text-center truncate w-full">${p.name}</p>
                <button
                  type="button"
                  data-action="delete-partner"
                  data-id="${p.id}"
                  data-name="${p.name.replace(/"/g, '&quot;')}"
                  class="text-xs text-red-400 hover:text-red-600 focus:outline-none transition"
                >Remover</button>
              </div>`).join('')}
          </div>` : `<p class="text-sm text-gray-400">Nenhum parceiro cadastrado ainda.</p>`}
      </div>`

    // Preview on file select
    const logoInput = document.getElementById('partner-logo-input')
    logoInput.addEventListener('change', () => {
      const file = logoInput.files[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        showToast('Apenas imagens são permitidas.', 'error'); logoInput.value = ''; return
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 2MB.', 'error'); logoInput.value = ''; return
      }
      const reader  = new FileReader()
      reader.onload = () => {
        document.getElementById('partner-logo-preview').innerHTML =
          `<img src="${reader.result}" alt="Prévia" class="max-h-full max-w-full object-contain p-1" />`
      }
      reader.readAsDataURL(file)
      const nameEl = document.getElementById('partner-logo-name')
      nameEl.textContent = file.name
      nameEl.classList.remove('hidden')
    })

    // Add partner
    document.getElementById('add-partner-btn').addEventListener('click', async () => {
      const name      = val('partner-name')
      const logoInput = document.getElementById('partner-logo-input')
      const file      = logoInput.files[0]

      if (!name)  { showToast('O nome da marca é obrigatório.', 'error'); return }
      if (!file)  { showToast('O logo é obrigatório.', 'error'); return }

      const btn = document.getElementById('add-partner-btn')
      btn.disabled = true; btn.textContent = 'Salvando…'

      try {
        const session = await getSession()
        if (!session) return

        // Upload logo
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'partners')
        const upRes  = await fetch('/api/upload', {
          method:  'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body:    formData,
        })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error || 'Falha no upload do logo')

        // Create partner
        const res = await fetch('/api/partners', {
          method:  'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, logo_url: upData.url }),
        })
        if (!res.ok) { const e = await res.json(); throw new Error(e.error) }

        showToast('Parceiro adicionado.')
        await loadPartners()
      } catch (err) {
        showToast(err.message || 'Erro ao adicionar parceiro.', 'error')
        btn.disabled = false; btn.textContent = 'Adicionar parceiro'
      }
    })

    // Delete partner — delegated; handler is re-registered on each render()
    // so we mark the container to avoid stacking listeners across re-renders
    if (!root.dataset.deleteWired) {
      root.dataset.deleteWired = '1'
      root.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action="delete-partner"]')
        if (!btn) return
        if (!confirm(`Remover parceiro "${btn.dataset.name}"?`)) return
        try {
          const session = await getSession()
          if (!session) return
          const res = await fetch('/api/partners', {
            method:  'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id: btn.dataset.id }),
          })
          if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
          showToast('Parceiro removido.')
          await loadPartners()
        } catch (err) {
          showToast(err.message || 'Erro ao remover.', 'error')
        }
      })
    }
  }

  loadPartners()
}

// ── Final CTA tab ────────────────────────────────────────────────────────────
function initCtaTab() {
  const c = _contentData
  document.getElementById('cta-fields').innerHTML = `
    ${fieldHTML({ id: 'cta_final_text',     label: 'Título',            value: c.cta_final_text,     placeholder: 'Ex: Pronto para criar algo incrível?' })}
    ${fieldHTML({ id: 'cta_final_subtext',  label: 'Subtítulo',         value: c.cta_final_subtext,  placeholder: 'Ex: Fale com o nosso time...' })}
    <fieldset class="border border-gray-200 rounded-xl p-4">
      <legend class="text-sm font-semibold text-gray-700 px-1">Botão</legend>
      <div class="space-y-4 mt-2">
        ${fieldHTML({ id: 'cta_final_btn_text', label: 'Texto do botão', value: c.cta_final_btn_text, placeholder: 'Ex: Fale com o Farol' })}
        ${fieldHTML({ id: 'cta_final_btn_url',  label: 'URL do botão',   value: c.cta_final_btn_url,  placeholder: 'Ex: https://wa.me/... ou #contato' })}
      </div>
    </fieldset>`

  createImageSlot({
    containerId: 'slot-cta-image',
    contentKey:  'cta_final_image_url',
    label:       'Imagem do CTA Final (coluna direita)',
  })

  document.getElementById('save-cta').addEventListener('click', async () => {
    setSaving('save-cta', true)
    try {
      await saveContent({
        cta_final_text:     val('cta_final_text'),
        cta_final_subtext:  val('cta_final_subtext'),
        cta_final_btn_text: val('cta_final_btn_text'),
        cta_final_btn_url:  val('cta_final_btn_url'),
      })
      showToast('CTA Final salvo com sucesso.')
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setSaving('save-cta', false)
    }
  })
}

// ── Settings tab ─────────────────────────────────────────────────────────────
function initSettingsTab() {
  const c = _contentData
  document.getElementById('settings-fields').innerHTML = `
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
      <p class="text-sm text-yellow-800">
        <strong>Destino do botão "Fale com o Farol"</strong><br />
        Cole aqui o link do WhatsApp, e-mail (<code>mailto:</code>) ou qualquer URL externa.
        Este link é usado no Hero e no CTA Final.
      </p>
    </div>
    ${fieldHTML({ id: 'contact_url', label: 'URL de contato', value: c.contact_url, placeholder: 'Ex: https://wa.me/5511999999999 ou mailto:contato@grupofarol.com.br' })}`

  document.getElementById('save-settings').addEventListener('click', async () => {
    setSaving('save-settings', true)
    try {
      await saveContent({ contact_url: val('contact_url') })
      showToast('Configurações salvas.')
    } catch (err) {
      showToast(err.message || 'Erro ao salvar.', 'error')
    } finally {
      setSaving('save-settings', false)
    }
  })
}

// ── Boot ────────────────────────────────────────────────────────────────────

async function init() {
  // Load public config + init Supabase
  let cfg
  try {
    cfg = await fetch('/api/config').then(r => r.json())
    _supabase = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  } catch {
    document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Não foi possível conectar ao servidor.</p>'
    return
  }

  // Auth guard
  const session = await getSession()
  if (!session) { location.href = '/admin/'; return }

  // Load all content first so image slots and form fields can pre-fill
  try {
    await loadContent()
  } catch {
    showToast('Erro ao carregar conteúdo. Tente recarregar a página.', 'error')
  }

  // Sign out
  document.getElementById('signout-btn').addEventListener('click', async () => {
    await _supabase.auth.signOut()
    location.href = '/admin/'
  })

  // Tabs
  setupTabs()

  // Init tab sections (those that are ready now)
  initHeroTab()
  initAboutTab()
  initTalentsTab()
  initPartnersTab()
  initCtaTab()
  initSettingsTab()
}

document.addEventListener('DOMContentLoaded', init)
