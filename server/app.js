import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory simulation cache for testing without live GoAPI key
const mockTasks = new Map();

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
    provider = 'suno', // 'suno' | 'udio'
    prompt,
    tags,
    title,
    isInstrumental = false,
    lyrics,
    apiKey,
    mock = false
  } = req.body;

  const keyToUse = apiKey || process.env.GOAPI_KEY;

  if (mock || !keyToUse) {
    const taskId = 'rhapsody_mock_' + Math.random().toString(36).substring(2, 10);
    const createdAt = Date.now();
    
    mockTasks.set(taskId, {
      taskId,
      provider,
      prompt: prompt || tags || 'Ambient Chill Beat',
      title: title || 'Rhapsody Generated Track',
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
    let targetEndpoint = 'https://api.goapi.ai/api/suno/v1/music';

    if (provider === 'udio') {
      targetEndpoint = 'https://api.goapi.ai/api/udio/v1/music';
    }

    const payload = {
      custom_mode: isCustomMode,
      input: isCustomMode ? {
        prompt: lyrics || prompt,
        tags: tags || 'lo-fi, chill, melodic',
        title: title || 'Rhapsody Project Stem',
        make_instrumental: isInstrumental
      } : {
        gpt_description_prompt: prompt,
        make_instrumental: isInstrumental
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
      data: data
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
      ? `https://api.goapi.ai/api/udio/v1/music/${taskId}`
      : `https://api.goapi.ai/api/suno/v1/music/${taskId}`;

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
 * Streams audio with permissive CORS
 */
router.get('/ai/proxy-audio', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });

    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Content-Length': response.headers['content-length'],
      'Access-Control-Allow-Origin': '*'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Audio proxy error:', error.message);
    res.status(502).send('Error streaming audio');
  }
});

// Mount on both /api and / to handle all routing environments seamlessly
app.use('/api', router);
app.use('/', router);

export default app;
