import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({error:'POST only'});

  const { prompt, duration } = req.body;
  const apiKey = process.env.KIE_API_KEY || process.env.VITE_KIE_API_KEY;

  try {
    // 1. START GENERATION
    const genRes = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'veo3_fast', // or 'veo3' for highest quality
        prompt: prompt,
        generationType: 'TEXT_2_VIDEO',
        aspectRatio: '16:9'
      })
    });

    const genData = await genRes.json();
    console.log('KIE generate:', genData);

    if (!genData.data?.taskId) {
      return res.status(500).json(genData);
    }

    const taskId = genData.data.taskId;

    // 2. POLL FOR RESULT (veo takes 1-3 mins)
    let videoUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 10000)); // wait 10s

      const statusRes = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      const statusData = await statusRes.json();
      console.log('KIE status:', statusData);

      if (statusData.data?.state === 'success' && statusData.data?.resultJson) {
        const result = JSON.parse(statusData.data.resultJson);
        videoUrl = result.resultUrls?.[0] || result.resultUrl;
        break;
      }
      if (statusData.data?.state === 'fail') {
        return res.status(500).json({ error: 'Generation failed', details: statusData });
      }
    }

    if (videoUrl) {
      res.json({ video_url: videoUrl, taskId });
    } else {
      res.json({ message: 'Still generating, check later', taskId });
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
