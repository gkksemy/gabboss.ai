export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.RUNWAY_API_KEY;
  const r = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
    body: JSON.stringify({ promptText: prompt, model: 'gen4.5', duration: 5, ratio: '1280:720' })
  });
  const data = await r.json();
  if (!r.ok) return res.json({ error: data.message, raw: data });
  return res.json({ taskId: data.id, status: 'STARTED' });
}
