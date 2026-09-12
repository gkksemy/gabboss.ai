export default async function handler(req, res) {
  const { taskId } = req.query;
  try {
    const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` }
    });
    const data = await r.json();
    const d = data.data || {};
    // Veo 3.1 structure
    const state = d.state || d.status;
    const videoUrl = d.resultJson? JSON.parse(d.resultJson).resultUrls?.[0] : d.video_url || null;
    let finalState = 'generating';
    if (state === 'success' || d.successFlag === 1) finalState = 'success';
    if (state === 'fail' || d.successFlag === 2 || d.failCode) finalState = 'fail';
    return res.status(200).json({ state: finalState, video_url: videoUrl, raw: d, failReason: d.failMsg || d.failCode });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
