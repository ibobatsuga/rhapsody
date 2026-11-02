import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '64kb' })); // Reject payload bombs

// ==========================================
// 1. RATE LIMITING SHIELD (Sliding Window)
// ==========================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function rateLimiter(req, res, next) {
  // Use IP or x-forwarded-for
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown_ip';
  const now = Date.now();

  let clientRecord = rateLimitMap.get(clientIp);
  if (!clientRecord || now - clientRecord.startTime > RATE_LIMIT_WINDOW_MS) {
    clientRecord = { startTime: now, count: 1 };
    rateLimitMap.set(clientIp, clientRecord);
    return next();
  }

  clientRecord.count++;
  if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      hint: 'Rate limit exceeded. Please wait a moment before sending more requests.'
    });
  }

  next();
}

// Clean up expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS).unref();

app.use(rateLimiter);

// ==========================================
// 2. SSRF MITIGATION ENGINE
// ==========================================
const PRIVATE_IP_REGEX = /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|0\.|localhost|\[::1\]|::1)/i;

function validateAudioUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, reason: 'Missing or invalid URL parameter' };
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (e) {
    return { valid: false, reason: 'Malformed URL format' };
  }

  // Strict protocol whitelist: HTTP and HTTPS only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'Forbidden: Only HTTP and HTTPS protocols are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block loopback, internal cloud metadata (169.254.169.254), and private RFC1918 networks
  if (PRIVATE_IP_REGEX.test(hostname)) {
    return { valid: false, reason: 'Forbidden: Private or loopback address access is denied' };
  }

  return { valid: true, url: parsed.toString() };
}

// ==========================================
// 3. TASK CACHE WITH AUTOMATIC EXPIRATION
// ==========================================
const mockTasks = new Map();
const TASK_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes TTL

function cleanupExpiredTasks() {
  const now = Date.now();
  for (const [taskId, task] of mockTasks.entries()) {
    if (now - task.createdAt > TASK_EXPIRATION_MS) {
      mockTasks.delete(taskId);
    }
  }
}

// ==========================================
// 4. API ROUTING & SECURE DISPATCH
// ==========================================
const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Rhapsody AI Studio Relay',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /ai/generate
 * Dispatches a music generation task to GoAPI (Suno or Udio),
 * or falls back to simulated audio if mockMode is enabled.
 */
router.post('/ai/generate', async (req, res) => {
  const {
    provider = 'suno',
    prompt,
    tags,
    title,
    isInstrumental = false,
    lyrics,
    apiKey,
    mock = false
  } = req.body || {};

  // Input Validation: Provider check
  if (provider !== 'suno' && provider !== 'udio') {
    return res.status(400).json({
      success: false,
      error: "Invalid provider. Supported providers are strictly 'suno' or 'udio'."
    });
  }

  // Input Validation: Prompt bounds check
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Prompt parameter is required and must not be empty.'
    });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({
      success: false,
      error: 'Prompt exceeds maximum permitted limit of 2,000 characters.'
    });
  }

  // Bounds checks on secondary fields
  if (tags && typeof tags === 'string' && tags.length > 300) {
    return res.status(400).json({ success: false, error: 'Tags exceed maximum limit of 300 characters.' });
  }
  if (title && typeof title === 'string' && title.length > 150) {
    return res.status(400).json({ success: false, error: 'Title exceeds maximum limit of 150 characters.' });
  }
  if (lyrics && typeof lyrics === 'string' && lyrics.length > 4000) {
    return res.status(400).json({ success: false, error: 'Lyrics exceed maximum limit of 4,000 characters.' });
  }

  const keyToUse = apiKey || process.env.GOAPI_KEY;

  cleanupExpiredTasks();

  if (mock || !keyToUse) {
    const taskId = 'rhapsody_mock_' + Math.random().toString(36).substring(2, 10);
    const createdAt = Date.now();
    
    mockTasks.set(taskId, {
      taskId,
      provider,
      prompt: prompt.slice(0, 200),
      title: (title || 'Rhapsody Generated Track').slice(0, 100),
      isInstrumental,
      status: 'processing',
      createdAt,
      completeAt: createdAt + 8000
    });

    return res.json({
      success: true,
      mode: 'simulation',
      taskId,
      message: 'Task created in simulation mode (real GoAPI key can be added in Settings)'
    });
  }

  try {
    const isCustomMode = Boolean(lyrics || tags);
    const targetEndpoint = provider === 'udio'
      ? 'https://api.goapi.ai/api/udio/v1/music'
      : 'https://api.goapi.ai/api/suno/v1/music';

    const payload = {
      custom_mode: isCustomMode,
      input: isCustomMode ? {
        prompt: (lyrics || prompt).slice(0, 2000),
        tags: (tags || 'lo-fi, chill, melodic').slice(0, 300),
        title: (title || 'Rhapsody Project Stem').slice(0, 150),
        make_instrumental: Boolean(isInstrumental)
      } : {
        gpt_description_prompt: prompt.slice(0, 2000),
        make_instrumental: Boolean(isInstrumental)
      }
    };

    const response = await axios.post(targetEndpoint, payload, {
      headers: {
        'X-API-Key': keyToUse,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;
    const taskId = data.data?.task_id || data.task_id;

    res.json({
      success: true,
      mode: 'live',
      taskId,
      data
    });
  } catch (error) {
    console.error('GoAPI generation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      hint: 'Verify your GoAPI X-API-Key in Rhapsody Settings'
    });
  }
});

/**
 * GET /ai/status/:taskId
 * Checks the status of a generation task.
 */
router.get('/ai/status/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const apiKey = req.headers['x-api-key'] || process.env.GOAPI_KEY;
  const provider = req.query.provider || 'suno';

  if (!taskId || taskId.length > 100) {
    return res.status(400).json({ success: false, error: 'Invalid task identifier' });
  }

  if (mockTasks.has(taskId)) {
    const task = mockTasks.get(taskId);
    const now = Date.now();

    if (now >= task.completeAt) {
      task.status = 'completed';
      task.audioUrls = [
        'https://actions.google.com/sounds/v1/music/ambient_hum.ogg',
        'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg'
      ];
      task.vocalStemUrl = 'https://actions.google.com/sounds/v1/human_voices/applause_cheering.ogg';
      task.instrumentalStemUrl = 'https://actions.google.com/sounds/v1/music/acoustic_guitar_duet.ogg';
      task.duration = 32.5;
    }

    return res.json({
      success: true,
      taskId,
      status: task.status,
      audioUrls: task.audioUrls || [],
      vocalStemUrl: task.vocalStemUrl,
      instrumentalStemUrl: task.instrumentalStemUrl,
      title: task.title,
      duration: task.duration || 30
    });
  }

  try {
    const endpoint = provider === 'udio'
      ? `https://api.goapi.ai/api/udio/v1/music/${encodeURIComponent(taskId)}`
      : `https://api.goapi.ai/api/suno/v1/music/${encodeURIComponent(taskId)}`;

    const response = await axios.get(endpoint, {
      headers: {
        'X-API-Key': apiKey
      },
      timeout: 10000
    });

    const result = response.data.data || response.data;
    
    const audioUrls = [];
    if (result.audio_url) audioUrls.push(result.audio_url);
    if (Array.isArray(result.clips)) {
      result.clips.forEach(c => c.audio_url && audioUrls.push(c.audio_url));
    }

    res.json({
      success: true,
      taskId,
      status: result.status,
      audioUrls,
      title: result.title,
      duration: result.duration,
      raw: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
});

/**
 * GET /ai/proxy-audio
 * Hardened Audio Stream Proxy with SSRF Protection
 */
router.get('/ai/proxy-audio', async (req, res) => {
  const { url } = req.query;
  const validation = validateAudioUrl(url);

  if (!validation.valid) {
    return res.status(403).json({
      success: false,
      error: validation.reason
    });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: validation.url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      timeout: 15000,
      maxContentLength: 50 * 1024 * 1024 // Cap at 50 MB to prevent decompression bombs
    });

    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Content-Length': response.headers['content-length'],
      'Access-Control-Allow-Origin': '*'
    });

    response.data.pipe(res);
  } catch (error) {
    const status = error.response?.status || 502;
    res.status(status).json({
      success: false,
      error: 'Upstream audio fetch failed: ' + (error.message || 'Network error')
    });
  }
});

app.use('/api', router);
app.use('/', router);

export default app;
