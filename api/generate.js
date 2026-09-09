export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt } = req.body;
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      demo: true,
      message: "Add RUNWAY_API_KEY in Vercel settings"
    });
  }

  try {
    // Runway Gen-3 Turbo - Text to Video
    const response = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06'
      },
      body: JSON.stringify({
        promptText: prompt || "A talking red apple with gold chain and sunglasses driving a black Mercedes G-Wagon G63 at night in Istanbul, cinematic, gangster vibe",
        model: 'gen3a_turbo',
        duration: 5,
        ratio: '16:9'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(200).json({
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        error: data.message || 'Runway error - using demo',
        raw: data
      });
    }

    // Runway returns task ID, we need to poll
    // For now return task id, frontend will poll
    return res.status(200).json({
      taskId: data.id,
      videoUrl: data.output? data.output[0] : null,
      status: 'generating',
      message: 'GABBOSS is rendering your G-Wagon... ~90 sec'
    });

  } catch (err) {
    console.error(err);
    return res.status(200).json({
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      error: err.message
    });
  }
}
