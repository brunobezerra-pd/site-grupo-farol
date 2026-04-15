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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── GET /api/partners ──────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── POST /api/partners ─────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!await requireAuth(req, res)) return

    const { name, logo_url } = req.body || {}

    if (!name || !logo_url) {
      return res.status(400).json({ error: 'name and logo_url are required' })
    }

    const { data, error } = await supabase
      .from('partners')
      .insert({ name, logo_url })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // ── DELETE /api/partners ───────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!await requireAuth(req, res)) return

    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
