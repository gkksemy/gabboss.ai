export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { prompt } = req.body;
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) return res.status(200).json({ error: "Missing RUNWAY_API_KEY in Vercel" });

  try {
    // Use Gen-4 Turbo - from your account limits
    const startRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt,
        model: 'gen4_turbo', // <- YOUR MODEL FROM TABLE
        duration: 5,
        ratio: '1280:720'
      })
    });

    const startData = await startRes.json();
    if (!startRes.ok) {
      return res.status(200).json({ error: `Runway: ${startData.error || startData.message}`, raw: startData });
    }

    let taskId = startData.id;
    let videoUrl = null;

    // Poll 90 sec
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const checkRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' }
      });
      const checkData = await checkRes.json();
      if (checkData.status === 'SUCCEEDED') { videoUrl = checkData.output?.[0]; break; }
      if (checkData.status === 'FAILED') return res.status(200).json({ error: "Failed: " + JSON.stringify(checkData), raw: checkData });
    }

    if (videoUrl) return res.status(200).json({ videoUrl, taskId });
    return res.status(200).json({ error: `Still generating after 90s, taskId: ${taskId} - check https://app.runwayml.com`, taskId });

  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
