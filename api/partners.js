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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const supabase = getSupabase()

  // GET — return partners ordered by created_at ASC
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // All write methods require a valid JWT
  const valid = await validateJWT(req.headers['authorization'])
  if (!valid) return res.status(401).json({ error: 'Unauthorized' })

  // POST — create new partner
  if (req.method === 'POST') {
    const { name, logo_url } = req.body ?? {}

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

  // DELETE — remove partner by id
  if (req.method === 'DELETE') {
    const { id } = req.body ?? {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { error, count } = await supabase
      .from('partners')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    if (count === 0) return res.status(404).json({ error: 'Partner not found' })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
