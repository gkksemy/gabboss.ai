// api/status.js
// GABBOSS.AI FILM - Runway task polling

export default async function handler(req, res) {
  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({
      error: 'Missing taskId'
    });
  }

  const API_KEY = process.env.RUNWAY_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({
      error: 'RUNWAY_API_KEY not found'
    });
  }

  try {
    const runwayResponse = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'GET',

        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-Runway-Version': '2024-11-06'
        }
      }
    );

    const data = await runwayResponse.json();

    console.log('RUNWAY STATUS RESPONSE:', data);

    if (!runwayResponse.ok) {
      return res.status(runwayResponse.status).json({
        error:
          data?.error ||
          data?.message ||
          'Unable to retrieve Runway task',
        runway: data
      });
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    if (
      data.status === 'SUCCEEDED' &&
      Array.isArray(data.output) &&
      data.output.length > 0
    ) {
      const videoUrl = data.output[0];

      return res.status(200).json({
        state: 'success',
        status: 'SUCCEEDED',
        video_url: videoUrl,
        videoUrl: videoUrl,
        progress: 100
      });
    }

    // -----------------------------
    // FAILED
    // -----------------------------

    if (
      data.status === 'FAILED' ||
      data.status === 'CANCELLED'
    ) {
      return res.status(200).json({
        state: 'fail',
        status: data.status,
        failReason:
          data.failure ||
          data.error ||
          'Runway video generation failed'
      });
    }

    // -----------------------------
    // STILL GENERATING
    // -----------------------------

    let progress = 50;

    if (typeof data.progress === 'number') {
      progress =
        data.progress <= 1
          ? Math.round(data.progress * 100)
          : Math.round(data.progress);
    }

    return res.status(200).json({
      state: 'generating',
      status: data.status || 'PROCESSING',
      progress
    });

  } catch (error) {
    console.error('RUNWAY STATUS ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Failed to check Runway task'
    });
  }
}
