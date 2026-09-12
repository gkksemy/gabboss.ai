```javascript
// api/audio-test.js
// ElevenLabs Scene 1 audio test
// ZERO Runway credits are used here.
//
// Required Vercel Environment Variable:
// ELEVENLABS_API_KEY

export default async function handler(req, res) {
  try {
    // ---------------------------------------------------------
    // METHOD CHECK
    // ---------------------------------------------------------
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed. Use POST."
      });
    }

    // ---------------------------------------------------------
    // API KEY CHECK
    // ---------------------------------------------------------
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error("ELEVENLABS_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        error: "ELEVENLABS_API_KEY is not configured in Vercel."
      });
    }

    // ---------------------------------------------------------
    // READ REQUEST BODY
    // ---------------------------------------------------------
    let body = req.body;

    // Some Vercel configurations can provide the body as a string.
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON request body."
        });
      }
    }

    body = body || {};

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const voiceId =
      typeof body.voiceId === "string" && body.voiceId.trim()
        ? body.voiceId.trim()
        : "JBFqnCBsd6RMkjVDRZzb";

    const modelId =
      typeof body.modelId === "string" && body.modelId.trim()
        ? body.modelId.trim()
        : "eleven_multilingual_v2";

    // ---------------------------------------------------------
    // TEXT CHECK
    // ---------------------------------------------------------
    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Please provide Scene 1 text."
      });
    }

    console.log("Starting ElevenLabs Scene 1 audio test.");
    console.log("Voice ID:", voiceId);
    console.log("Model:", modelId);
    console.log("Text length:", text.length);

    // ---------------------------------------------------------
    // ELEVENLABS REQUEST
    // ---------------------------------------------------------
    const elevenLabsUrl =
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}`;

    const elevenLabsResponse = await fetch(elevenLabsUrl, {
      method: "POST",

      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },

      body: JSON.stringify({
        text: text,

        model_id: modelId,

        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    });

    // ---------------------------------------------------------
    // ELEVENLABS ERROR
    // ---------------------------------------------------------
    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();

      console.error(
        "ElevenLabs returned an error:",
        elevenLabsResponse.status,
        errorText
      );

      return res.status(502).json({
        success: false,
        error: "ElevenLabs audio generation failed.",
        elevenLabsStatus: elevenLabsResponse.status,
        details: errorText
      });
    }

    // ---------------------------------------------------------
    // AUDIO RESPONSE
    // ---------------------------------------------------------
    const audioArrayBuffer =
      await elevenLabsResponse.arrayBuffer();

    const audioBuffer =
      Buffer.from(audioArrayBuffer);

    console.log(
      "ElevenLabs audio generated successfully.",
      "Bytes:",
      audioBuffer.length
    );

    res.setHeader(
      "Content-Type",
      "audio/mpeg"
    );

    res.setHeader(
      "Content-Disposition",
      'inline; filename="scene-1-audio.mp3"'
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );

    res.setHeader(
      "Content-Length",
      audioBuffer.length
    );

    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error(
      "AUDIO TEST FUNCTION CRASHED:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Audio test server error.",
      details:
        error && error.message
          ? error.message
          : String(error)
    });
  }
}
```
