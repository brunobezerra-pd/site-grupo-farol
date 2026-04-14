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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()

  const supabase = getSupabase()

  // GET — return creators ordered by position ASC
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('position', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // All write methods require a valid JWT
  const valid = await validateJWT(req.headers['authorization'])
  if (!valid) return res.status(401).json({ error: 'Unauthorized' })

  // POST — create new creator
  if (req.method === 'POST') {
    const { name, category, photo_url, instagram_url, youtube_url, tiktok_url, position } = req.body ?? {}

    if (!name || !category || !photo_url) {
      return res.status(400).json({ error: 'name, category and photo_url are required' })
    }

    const { data, error } = await supabase
      .from('creators')
      .insert({ name, category, photo_url, instagram_url, youtube_url, tiktok_url, position: position ?? 0 })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // PUT — update existing creator by id
  if (req.method === 'PUT') {
    const { id, ...fields } = req.body ?? {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const allowed = ['name', 'category', 'photo_url', 'instagram_url', 'youtube_url', 'tiktok_url', 'position']
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([k]) => allowed.includes(k))
    )

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' })
    }

    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Creator not found' })
    return res.status(200).json(data)
  }

  // DELETE — remove creator by id
  if (req.method === 'DELETE') {
    const { id } = req.body ?? {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const { error, count } = await supabase
      .from('creators')
      .delete({ count: 'exact' })
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    if (count === 0) return res.status(404).json({ error: 'Creator not found' })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
