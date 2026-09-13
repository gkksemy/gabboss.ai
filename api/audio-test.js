// api/audio-test.js
// GABBOSS.AI FILM
// ElevenLabs Scene 1 Audio Test
//
// ZERO Runway credits are used.
//
// Required Vercel Environment Variable:
// ELEVENLABS_API_KEY

export default async function handler(req, res) {
  try {
    console.log("====================================");
    console.log("ELEVENLABS AUDIO TEST STARTED");
    console.log("====================================");

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

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      console.error("ELEVENLABS_API_KEY is missing.");

      return res.status(500).json({
        success: false,
        error: "ELEVENLABS_API_KEY is not available to this Vercel function.",
        step: "environment"
      });
    }

    console.log("ElevenLabs API key detected.");

    // ---------------------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------------------
    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (error) {
        console.error("Request body JSON parsing failed.");

        return res.status(400).json({
          success: false,
          error: "Invalid JSON request body.",
          step: "request-body"
        });
      }
    }

    if (!body || typeof body !== "object") {
      body = {};
    }

    // ---------------------------------------------------------
    // TEXT
    // ---------------------------------------------------------
    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Please provide Scene 1 text.",
        step: "text"
      });
    }

    // ---------------------------------------------------------
    // VOICE
    // ---------------------------------------------------------
    const voiceId =
      typeof body.voiceId === "string" &&
      body.voiceId.trim()
        ? body.voiceId.trim()
        : "JBFqnCBsd6RMkjVDRZzb";

    // ---------------------------------------------------------
    // MODEL
    // ---------------------------------------------------------
    const modelId =
      typeof body.modelId === "string" &&
      body.modelId.trim()
        ? body.modelId.trim()
        : "eleven_multilingual_v2";

    console.log("Voice ID:", voiceId);
    console.log("Model ID:", modelId);
    console.log("Text length:", text.length);

    // ---------------------------------------------------------
    // ELEVENLABS URL
    // ---------------------------------------------------------
    const elevenLabsUrl =
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}`;

    console.log("Calling ElevenLabs...");
    console.log("Endpoint:", elevenLabsUrl);

    // ---------------------------------------------------------
    // ELEVENLABS REQUEST
    // ---------------------------------------------------------
    const elevenLabsResponse = await fetch(
      elevenLabsUrl,
      {
        method: "POST",

        headers: {
          "xi-api-key": apiKey.trim(),
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },

        body: JSON.stringify({
          text,
          model_id: modelId,

          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.25,
            use_speaker_boost: true
          }
        })
      }
    );

    console.log(
      "ElevenLabs response status:",
      elevenLabsResponse.status
    );

    // ---------------------------------------------------------
    // ELEVENLABS ERROR
    // ---------------------------------------------------------
    if (!elevenLabsResponse.ok) {
      const errorText =
        await elevenLabsResponse.text();

      console.error(
        "===================================="
      );

      console.error(
        "ELEVENLABS REQUEST FAILED"
      );

      console.error(
        "Status:",
        elevenLabsResponse.status
      );

      console.error(
        "Response:",
        errorText
      );

      console.error(
        "===================================="
      );

      return res.status(502).json({
        success: false,
        error: "ElevenLabs rejected the audio request.",
        step: "elevenlabs",
        elevenLabsStatus:
          elevenLabsResponse.status,
        details: errorText
      });
    }

    // ---------------------------------------------------------
    // READ AUDIO
    // ---------------------------------------------------------
    const audioArrayBuffer =
      await elevenLabsResponse.arrayBuffer();

    if (!audioArrayBuffer || audioArrayBuffer.byteLength === 0) {
      console.error(
        "ElevenLabs returned an empty audio response."
      );

      return res.status(502).json({
        success: false,
        error: "ElevenLabs returned an empty audio file.",
        step: "audio-response"
      });
    }

    console.log(
      "Audio bytes received:",
      audioArrayBuffer.byteLength
    );

    // ---------------------------------------------------------
    // SEND AUDIO
    // ---------------------------------------------------------
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
      "no-store"
    );

    res.setHeader(
      "Content-Length",
      String(audioArrayBuffer.byteLength)
    );

    console.log(
      "Sending audio back to browser."
    );

    return res.status(200).send(
      Buffer.from(audioArrayBuffer)
    );

  } catch (error) {
    // ---------------------------------------------------------
    // UNEXPECTED SERVER ERROR
    // ---------------------------------------------------------
    console.error(
      "===================================="
    );

    console.error(
      "AUDIO TEST FUNCTION CRASHED"
    );

    console.error(
      "Error:",
      error
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "===================================="
    );

    return res.status(500).json({
      success: false,
      error: "Audio test server error.",
      step: "server",
      details:
        error?.message ||
        String(error)
    });
  }
}
