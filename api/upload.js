import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import { readFileSync } from 'fs'

const ALLOWED_BUCKETS = ['creators', 'partners']

// Disable Vercel's default body parser so formidable can handle the stream
export const config = { api: { bodyParser: false } }

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

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }) // 10MB server-side limit; 2MB enforced on front-end
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const valid = await validateJWT(req.headers['authorization'])
  if (!valid) return res.status(401).json({ error: 'Unauthorized' })

  let fields, files
  try {
    ;({ fields, files } = await parseForm(req))
  } catch (err) {
    return res.status(400).json({ error: `Failed to parse form: ${err.message}` })
  }

  // formidable v3 returns arrays for field values
  const bucket = Array.isArray(fields.bucket) ? fields.bucket[0] : fields.bucket
  const file = Array.isArray(files.file) ? files.file[0] : files.file

  if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
    return res.status(400).json({ error: `bucket must be one of: ${ALLOWED_BUCKETS.join(', ')}` })
  }

  if (!file) {
    return res.status(400).json({ error: 'file is required' })
  }

  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Only image files are allowed' })
  }

  const fileBuffer = readFileSync(file.filepath)
  const ext = file.originalFilename?.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = getSupabase()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, fileBuffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (uploadError) return res.status(500).json({ error: uploadError.message })

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return res.status(200).json({ url: data.publicUrl })
}
