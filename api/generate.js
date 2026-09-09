export default async function handler(req, res) {
  const { prompt, duration } = req.body;
  const apiKey = process.env.KIE_API_KEY;
  
  // KIE veo3.1 API call
  const response = await fetch('https://api.kie.ai/api/v1/veo3/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      duration: parseInt(duration),
      model: 'veo3.1',
      with_audio: true
    })
  });
  
  const data = await response.json();
  res.json(data);
}
