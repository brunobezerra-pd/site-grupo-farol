// Exposes only the public Supabase keys to the front-end.
// SUPABASE_SERVICE_ROLE_KEY and CRON_SECRET are never included here.
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=3600')

  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  })
}
