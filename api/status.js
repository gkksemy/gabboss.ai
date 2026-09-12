export default async function handler(req, res) {
  const { taskId } = req.query;
  const API_KEY = process.env.RUNWAY_API_KEY;

  const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-Runway-Version': '2024-11-06'
    }
  });
  const data = await r.json();

  console.log('STATUS:', data.status);

  // Convert Runway format to your frontend format
  if (data.status === 'SUCCEEDED' && data.output && data.output[0]) {
    return res.status(200).json({
      status: 'SUCCEEDED',
      videoUrl: data.output[0],
      progress: 100
    });
  }

  if (data.status === 'FAILED') {
    return res.status(200).json({ status: 'FAILED', failReason: data.failure || data.error });
  }

  // Still running
  return res.status(200).json({
    status: 'PROCESSING',
    progress: data.progress? Math.round(data.progress * 100) : 92
  });
}
