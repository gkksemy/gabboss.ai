export default async function handler(req, res) {
  const { taskId } = req.query;
  const apiKey = process.env.KIE_API_KEY;

  if (!taskId) return res.status(400).json({ error: 'taskId required' });

  const statusRes = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });

  const statusData = await statusRes.json();
  console.log('KIE status:', statusData);

  if (statusData.data?.state === 'success' && statusData.data?.resultJson) {
    const result = JSON.parse(statusData.data.resultJson);
    const videoUrl = result.resultUrls?.[0] || result.resultUrl;
    return res.json({ state: 'success', video_url: videoUrl, raw: statusData });
  }

  return res.json(statusData); // still generating or failed
}
