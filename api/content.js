const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── GET /api/content ───────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('content')
      .select('key, value')

    if (error) return res.status(500).json({ error: error.message })

    const result = {}
    for (const row of data) result[row.key] = row.value
    return res.status(200).json(result)
  }

  // ── POST /api/content ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

    const updates = req.body
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body must be a JSON object of { key: value } pairs' })
    }

    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value: String(value),
    }))

    if (rows.length === 0) return res.status(200).json({ ok: true })

    const { error } = await supabase
      .from('content')
      .upsert(rows, { onConflict: 'key' })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
