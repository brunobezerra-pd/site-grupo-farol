const { createClient } = require('@supabase/supabase-js')

module.exports = async function handler(req, res) {
  // Only GET is expected (called by Vercel Cron)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Validate the shared cron secret
  const token = req.headers['x-cron-secret']
  if (!token || token !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error } = await supabase
    .from('content')
    .select('key')
    .limit(1)

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() })
}
