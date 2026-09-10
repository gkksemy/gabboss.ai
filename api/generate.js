export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt, duration } = req.body;
  
  try {
    const r = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt,
        model: 'gen4_turbo',
        ratio: '16:9',
        duration: Math.min(duration || 5, 10) // Runway max 10s per clip, we will extend later
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    // data.id is taskId
    return res.status(200).json({ taskId: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
