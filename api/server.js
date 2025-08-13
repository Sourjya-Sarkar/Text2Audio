import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config(); // Load ELEVENLABS_API_KEY

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-project.vercel.app', // Replace with your actual Vercel domain
        'https://your-custom-domain.com'   // Replace with your custom domain if any
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/generate-voice', async (req, res) => {
  // Check API Key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('Missing ELEVENLABS_API_KEY environment variable');
    return res.status(500).json({ error: 'Server configuration error. Please contact support.' });
  }

  // Validate payload
  const { prompt, voiceId } = req.body || {};
  if (
    !prompt || typeof prompt !== 'string' ||
    !voiceId || typeof voiceId !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid request. Please supply both prompt and voiceId as strings.' });
  }

  // Rate limiting check (basic implementation)
  const clientIP = req.ip || req.connection.remoteAddress;
  console.log(`[${new Date().toISOString()}] Generating voice for IP: ${clientIP}, prompt: ${prompt.slice(0, 40)}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30-second timeout for production

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!elevenRes.ok) {
      const errorMsg = await elevenRes.text().catch(() => 'Unknown error');
      console.error(`[${new Date().toISOString()}] ElevenLabs API error: ${elevenRes.status} - ${errorMsg}`);
      return res.status(500).json({ error: 'Failed to generate voice', details: errorMsg });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    if (!audioBuffer || (audioBuffer.byteLength || 0) === 0) {
      return res.status(502).json({ error: 'Received empty audio from ElevenLabs.' });
    }

    // Set proper headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /api/generate-voice:`, error);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request to ElevenLabs API timed out.' });
    }
    return res.status(500).json({ error: 'Internal server error', details: error.message || 'Unknown error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server (only if not in Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Express server running at http://localhost:${PORT}`);
  });
}

export default app;
