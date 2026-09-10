export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });
  try {
    const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'X-Runway-Version': '2024-11-06'
      }
    });
    const data = await r.json();
    const videoUrl = data.output?.[0] || null;
    const state = data.status === 'SUCCEEDED' ? 'success' : data.status === 'FAILED' ? 'fail' : 'generating';
    return res.status(200).json({ state, video_url: videoUrl, rawState: data.status, taskId });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
