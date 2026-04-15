const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function requireAuth(req, res) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return user
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── GET /api/creators ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('position', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── POST /api/creators ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!await requireAuth(req, res)) return

    const { name, category, photo_url, instagram_url, youtube_url, tiktok_url, position } = req.body || {}

    if (!name || !category || !photo_url) {
      return res.status(400).json({ error: 'name, category and photo_url are required' })
    }

    const { data, error } = await supabase
      .from('creators')
      .insert({
        name,
        category,
        photo_url,
        instagram_url: instagram_url || null,
        youtube_url:   youtube_url   || null,
        tiktok_url:    tiktok_url    || null,
        position:      position ?? 0,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // ── PUT /api/creators ──────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    if (!await requireAuth(req, res)) return

    const { id, name, category, photo_url, instagram_url, youtube_url, tiktok_url, position } = req.body || {}

    if (!id) return res.status(400).json({ error: 'id is required' })

    const updates = {}
    if (name        !== undefined) updates.name          = name
    if (category    !== undefined) updates.category      = category
    if (photo_url   !== undefined) updates.photo_url     = photo_url
    if (instagram_url !== undefined) updates.instagram_url = instagram_url || null
    if (youtube_url   !== undefined) updates.youtube_url   = youtube_url   || null
    if (tiktok_url    !== undefined) updates.tiktok_url    = tiktok_url    || null
    if (position    !== undefined) updates.position      = position

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data)  return res.status(404).json({ error: 'Creator not found' })
    return res.status(200).json(data)
  }

  // ── DELETE /api/creators ───────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!await requireAuth(req, res)) return

    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { error } = await supabase
      .from('creators')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
