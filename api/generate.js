export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt } = req.body;
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ videoUrl: null, error: "No RUNWAY_API_KEY in Vercel env vars. Add it in Settings." });
  }

  try {
    // Start task
    const startRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt,
        model: 'gen3a_turbo',
        duration: 5,
        ratio: '16:9'
      })
    });

    const startData = await startRes.json();
    if (!startRes.ok) return res.status(200).json({ error: startData.message || "Runway error", raw: startData });

    let taskId = startData.id;
    let videoUrl = null;
    let tries = 0;

    // Poll for 90 seconds
    while (tries < 30 &&!videoUrl) {
      await new Promise(r => setTimeout(r, 3000));
      const checkRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' }
      });
      const checkData = await checkRes.json();
      if (checkData.status === 'SUCCEEDED') {
        videoUrl = checkData.output?.[0];
        break;
      }
      if (checkData.status === 'FAILED') {
        return res.status(200).json({ error: "Runway failed: " + (checkData.failure || "unknown"), raw: checkData });
      }
      tries++;
    }

    if (videoUrl) return res.status(200).json({ videoUrl });
    else return res.status(200).json({ error: "Still generating - Runway took >90 sec, check runwayml.com dashboard", taskId });

  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
