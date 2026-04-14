import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

async function validateJWT(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false
  const token = authHeader.slice(7)
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser(token)
  return !error && !!data.user
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const supabase = getSupabase()

  // GET — return all content keys as { key: value }
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    const { data, error } = await supabase.from('content').select('key, value')
    if (error) return res.status(500).json({ error: error.message })
    const result = {}
    for (const row of data) result[row.key] = row.value
    return res.status(200).json(result)
  }

  // POST — upsert content fields (requires JWT)
  if (req.method === 'POST') {
    const valid = await validateJWT(req.headers['authorization'])
    if (!valid) return res.status(401).json({ error: 'Unauthorized' })

    const body = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Body must be a JSON object' })
    }

    const rows = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))
    if (rows.length === 0) return res.status(400).json({ error: 'No fields provided' })

    const { error } = await supabase
      .from('content')
      .upsert(rows, { onConflict: 'key' })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
