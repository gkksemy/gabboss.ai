export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt } = req.body;
  const apiKey = process.env.KIE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'KIE_API_KEY missing in Vercel env vars' });
  }

  try {
    const genRes = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'veo3_fast',
        prompt: prompt,
        generationType: 'TEXT_2_VIDEO',
        aspectRatio: '16:9'
      })
    });

    const genData = await genRes.json();
    console.log('KIE generate:', genData);

    if (!genData.data?.taskId) {
      return res.status(500).json({ error: 'Failed to start', details: genData });
    }

    return res.status(200).json({ taskId: genData.data.taskId });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
