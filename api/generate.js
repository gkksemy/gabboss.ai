// api/generate.js
// GABBOSS.AI FILM - Runway Gen-4.5 video generation

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const { prompt, duration } = req.body || {};

  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({
      error: 'Missing prompt'
    });
  }

  const API_KEY = process.env.RUNWAY_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: 'RUNWAY_API_KEY not found in Vercel environment variables'
    });
  }

  // Gen-4.5 currently supports 2–10 seconds.
  const requestedDuration = Number(duration) || 5;

  const safeDuration =
    requestedDuration <= 5 ? 5 : 10;

  try {
    const runwayResponse = await fetch(
      'https://api.dev.runwayml.com/v1/text_to_video',
      {
        method: 'POST',

        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06'
        },

        body: JSON.stringify({
          model: 'gen4.5',

          promptText: String(prompt).slice(0, 1000),

          duration: safeDuration,

          // Vertical format for GABBOSS.AI FILM / Shorts
          ratio: '720:1280'
        })
      }
    );

    const data = await runwayResponse.json();

    console.log('RUNWAY CREATE RESPONSE:', data);

    if (!runwayResponse.ok) {
      return res.status(runwayResponse.status).json({
        error:
          data?.error ||
          data?.message ||
          'Runway generation request failed',
        runway: data
      });
    }

    if (!data.id) {
      return res.status(500).json({
        error: 'Runway did not return a task ID',
        runway: data
      });
    }

    return res.status(200).json({
      success: true,
      taskId: data.id,
      duration: safeDuration
    });

  } catch (error) {
    console.error('RUNWAY GENERATE ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Failed to contact Runway'
    });
  }
}
