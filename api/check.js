// api/check.js - Poll veo3.1 task
export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'Missing taskId' });
  const KIE_API_KEY = process.env.KIE_API_KEY;
  try {
    const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
    });
    const data = await r.json();
    const state = data.data?.state;
    if (state === 'success') {
      const videoUrl = JSON.parse(data.data.resultJson).resultUrls?.[0];
      return res.status(200).json({ status: 'done', videoUrl });
    }
    if (state === 'fail') return res.status(200).json({ status: 'failed' });
    return res.status(200).json({ status: 'generating' });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}
