export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const API_KEY = process.env.RUNWAY_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'RUNWAY_API_KEY not found' });
  }

  try {
    const r = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: String(prompt).slice(0, 1000),
        model: 'gen3a_turbo',
        duration: 5,
        ratio: '1280:720'
      })
    });

    const data = await r.json();
    console.log('RUNWAY Response:', data);

    if (!r.ok) {
      return res.status(r.status).json(data);
    }

    return res.status(200).json({ taskId: data.id });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
