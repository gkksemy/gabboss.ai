export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const API_KEY = process.env.GABBOSS_KIE_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key GABBOSS_KIE_KEY not found in Vercel env' });
  }

  try {
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'veo3_fast',
        input: {
          prompt: String(prompt).slice(0, 3000),
          aspect_ratio: "16:9"
        }
      })
    });

    const data = await r.json();
    console.log('KIE Response:', data);

    if (data.code !== 200) {
      return res.status(data.code || 400).json(data);
    }

    return res.status(200).json({ taskId: data.data.taskId });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
