export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });

  try {
    const r = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` }
    });
    const data = await r.json();

    console.log('KIE raw:', JSON.stringify(data).slice(0, 500)); // check Vercel logs

    let videoUrl = null;
    let state = data.data?.state || 'generating';

    if (data.data?.resultJson) {
      try {
        const parsed = JSON.parse(data.data.resultJson);
        videoUrl = parsed.resultUrls?.[0] || parsed.resultUrl || null;
        if (videoUrl) state = 'success';
      } catch {}
    }

    // successFlag 1 = done, 0 = still going, 2/3 = failed
    if (data.data?.successFlag === 1 && videoUrl) state = 'success';
    if (data.data?.successFlag === 2 || data.data?.successFlag === 3) state = 'fail';

    return res.status(200).json({
      state,
      video_url: videoUrl,
      successFlag: data.data?.successFlag,
      rawState: data.data?.state,
      taskId
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
