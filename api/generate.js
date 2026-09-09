// api/generate.js - Vercel Serverless - veo3.1 with sound
export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt, duration = 8, style = 'cinematic', characterName } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  const KIE_API_KEY = process.env.KIE_API_KEY;
  if (!KIE_API_KEY) return res.status(500).json({ error: 'Missing KIE_API_KEY in Vercel env' });
  const fullPrompt = `${style} style, ${characterName || ''} - ${prompt}, with voice and sound, lip-sync, no subtitles`.trim();
  try {
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'veo3.1', input: { prompt: fullPrompt, duration, aspect_ratio: '16:9', generate_audio: true } })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.msg || 'Kie error', details: data });
    return res.status(200).json({ taskId: data.data?.taskId || data.taskId, status: 'generating' });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
