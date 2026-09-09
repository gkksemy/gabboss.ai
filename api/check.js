export default async function handler(req, res) {
  const { taskId } = req.query;
  const apiKey = process.env.RUNWAY_API_KEY;
  const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'X-Runway-Version': '2024-11-06' }
  });
  const data = await r.json();
  return res.json(data);
}
