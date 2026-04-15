const { createClient } = require('@supabase/supabase-js')
const { formidable } = require('formidable')
const fs = require('fs')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const VALID_BUCKETS = new Set(['creators', 'partners', 'content'])

// Disable Vercel's built-in body parser — we handle the body ourselves
// (formidable for multipart POST; manual stream read for JSON DELETE)
const config = { api: { bodyParser: false } }
module.exports.config = config

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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw)) }
      catch { reject(new Error('Invalid JSON body')) }
    })
    req.on('error', reject)
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // ── POST /api/upload ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    if (!await requireAuth(req, res)) return

    // Parse multipart/form-data
    const form = formidable({ maxFileSize: 2 * 1024 * 1024 }) // 2 MB
    let fields, files
    try {
      ;[fields, files] = await form.parse(req)
    } catch (err) {
      return res.status(400).json({ error: `Upload parse error: ${err.message}` })
    }

    const bucket = Array.isArray(fields.bucket) ? fields.bucket[0] : fields.bucket
    const fileObj = Array.isArray(files.file)   ? files.file[0]   : files.file

    if (!bucket || !VALID_BUCKETS.has(bucket)) {
      return res.status(400).json({ error: `Invalid bucket. Must be one of: ${[...VALID_BUCKETS].join(', ')}` })
    }
    if (!fileObj) {
      return res.status(400).json({ error: 'No file provided (field name must be "file")' })
    }

    // Read file buffer from the temp path formidable wrote to
    const fileBuffer = fs.readFileSync(fileObj.filepath)

    // Sanitise filename and make it unique
    const safeName = (fileObj.originalFilename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${Date.now()}-${safeName}`

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: fileObj.mimetype || 'application/octet-stream',
        upsert: false,
      })

    // Clean up temp file
    try { fs.unlinkSync(fileObj.filepath) } catch {}

    if (uploadError) return res.status(500).json({ error: uploadError.message })

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return res.status(200).json({ url: publicUrl })
  }

  // ── DELETE /api/upload ─────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!await requireAuth(req, res)) return

    let body
    try {
      body = await readJsonBody(req)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }

    const { bucket, path: filePath } = body || {}

    if (!bucket || !VALID_BUCKETS.has(bucket)) {
      return res.status(400).json({ error: `Invalid bucket. Must be one of: ${[...VALID_BUCKETS].join(', ')}` })
    }
    if (!filePath) {
      return res.status(400).json({ error: 'path is required' })
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
