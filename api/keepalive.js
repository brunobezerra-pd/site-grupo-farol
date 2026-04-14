import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase.from('content').select('key').limit(1)
  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() })
}
