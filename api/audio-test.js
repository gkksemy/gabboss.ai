```javascript
// api/audio-test.js
// ElevenLabs Scene 1 audio test
// Uses ZERO Runway credits.
// Requires ELEVENLABS_API_KEY in Vercel Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "ELEVENLABS_API_KEY is not configured."
      });
    }

    const {
      text,
      voiceId,
      modelId = "eleven_multilingual_v2"
    } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide Scene 1 text."
      });
    }

    // Default ElevenLabs voice.
    // This can be changed later when we choose the final voice.
    const selectedVoiceId =
      voiceId || "JBFqnCBsd6RMkjVDRZzb";

    const elevenLabsUrl =
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

    const elevenLabsResponse = await fetch(elevenLabsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();

      console.error(
        "ElevenLabs error:",
        elevenLabsResponse.status,
        errorText
      );

      return res.status(elevenLabsResponse.status).json({
        success: false,
        error: "ElevenLabs audio generation failed.",
        details: errorText
      });
    }

    const audioBuffer = Buffer.from(
      await elevenLabsResponse.arrayBuffer()
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="scene-1-audio.mp3"'
    );
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(audioBuffer);

  } catch (error) {
    console.error("Audio test error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while generating Scene 1 audio.",
      details: error.message
    });
  }
}
```
