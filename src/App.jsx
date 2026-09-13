import { useState } from "react";

const DEFAULT_STORY =
  "family thanksgiving dinner in nashville Tn";

const DEFAULT_AUDIO_TEXT =
  "The house was full of laughter, warm food, and the sound of family coming together for Thanksgiving dinner.";

function App() {
  const [story, setStory] = useState(DEFAULT_STORY);
  const [characters, setCharacters] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [clipLength, setClipLength] = useState(10);

  const [characterBible, setCharacterBible] = useState(null);
  const [worldBible, setWorldBible] = useState(null);
  const [filmPlan, setFilmPlan] = useState(null);
  const [generationQueue, setGenerationQueue] = useState(null);

  const [loadingBible, setLoadingBible] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // ---------------------------------------------------------
  // ELEVENLABS AUDIO TEST STATE
  // ---------------------------------------------------------
  const [audioText, setAudioText] =
    useState(DEFAULT_AUDIO_TEXT);

  const [audioGenerating, setAudioGenerating] =
    useState(false);

  const [audioStatus, setAudioStatus] =
    useState("READY");

  const [audioUrl, setAudioUrl] =
    useState("");

  // ---------------------------------------------------------
  // RUNWAY TEST STATE
  // ---------------------------------------------------------
  const [testGenerating, setTestGenerating] =
    useState(false);

  const [testStatus, setTestStatus] =
    useState("READY");

  const [testProgress, setTestProgress] =
    useState(0);

  const [testTaskId, setTestTaskId] =
    useState("");

  const [testVideoUrl, setTestVideoUrl] =
    useState("");

  const [runwayApiCalls, setRunwayApiCalls] =
    useState(0);

  const [creditsUsed, setCreditsUsed] =
    useState(0);

  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // BUILD CHARACTER + WORLD BIBLE
  // ---------------------------------------------------------
  async function buildBible() {
    setError("");
    setFilmPlan(null);
    setGenerationQueue(null);
    setTestVideoUrl("");
    setTestStatus("READY");
    setTestProgress(0);
    setTestTaskId("");

    if (!story.trim()) {
      setError("Please enter a story idea.");
      return;
    }

    setLoadingBible(true);

    try {
      const response = await fetch("/api/bible", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          story: story.trim(),
          characters: characters.trim(),
          style: style
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to build Character & World Bible."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "Bible generation failed."
        );
      }

      setCharacterBible(data.characterBible);
      setWorldBible(data.worldBible);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoadingBible(false);
    }
  }

  // ---------------------------------------------------------
  // BUILD 5-MINUTE FILM PLAN
  // ---------------------------------------------------------
  async function buildFilmPlan() {
    setError("");
    setGenerationQueue(null);
    setTestVideoUrl("");
    setTestStatus("READY");
    setTestProgress(0);
    setTestTaskId("");

    if (!characterBible || !worldBible) {
      setError(
        "Build the Character & World Bible first."
      );
      return;
    }

    setLoadingPlan(true);

    try {
      const response = await fetch("/api/film-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          story: story.trim(),
          duration: 300,
          clipLength: Number(clipLength),
          characterBible: characterBible,
          worldBible: worldBible
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to build the film plan."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "Film plan generation failed."
        );
      }

      setFilmPlan(data.filmPlan);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoadingPlan(false);
    }
  }

  // ---------------------------------------------------------
  // BUILD GENERATION QUEUE
  // ---------------------------------------------------------
  async function buildGenerationQueue() {
    setError("");

    if (!filmPlan) {
      setError(
        "Build the 5-Minute Film Plan first."
      );
      return;
    }

    setLoadingQueue(true);

    try {
      const response = await fetch(
        "/api/generation-queue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            filmPlan: filmPlan
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to build the Generation Queue."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "Generation Queue creation failed."
        );
      }

      setGenerationQueue(data.queue);

      setTestVideoUrl("");
      setTestStatus("READY");
      setTestProgress(0);
      setTestTaskId("");
      setRunwayApiCalls(0);
      setCreditsUsed(0);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoadingQueue(false);
    }
  }

  // ---------------------------------------------------------
  // ELEVENLABS AUDIO TEST
  // ZERO RUNWAY CREDITS
  // ---------------------------------------------------------
  async function generateSceneOneAudio() {
    setError("");
    setAudioUrl("");
    setAudioStatus("STARTING");

    if (!audioText.trim()) {
      setError(
        "Please enter some Scene 1 text for the audio test."
      );
      setAudioStatus("ERROR");
      return;
    }

    setAudioGenerating(true);

    try {
      setAudioStatus("GENERATING");

      const response = await fetch(
        "/api/audio-test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: audioText.trim()
          })
        }
      );

      if (!response.ok) {
        let errorMessage =
          "ElevenLabs audio generation failed.";

        try {
          const data =
            await response.json();

          if (data && data.error) {
            errorMessage = data.error;
          }

          if (
            data &&
            data.details
          ) {
            errorMessage +=
              " " +
              String(data.details);
          }
        } catch (jsonError) {
          // The server may return non-JSON errors.
        }

        throw new Error(errorMessage);
      }

      const audioBlob =
        await response.blob();

      if (
        !audioBlob ||
        audioBlob.size === 0
      ) {
        throw new Error(
          "ElevenLabs returned an empty audio file."
        );
      }

      const objectUrl =
        URL.createObjectURL(audioBlob);

      setAudioUrl(objectUrl);
      setAudioStatus("SUCCEEDED");
    } catch (err) {
      setAudioStatus("FAILED");

      setError(
        err.message ||
          "Scene 1 audio generation failed."
      );
    } finally {
      setAudioGenerating(false);
    }
  }

  // ---------------------------------------------------------
  // RUNWAY TEST
  // DO NOT USE UNTIL CREDITS ARE AVAILABLE
  // ---------------------------------------------------------
  async function generateTestSceneOne() {
    setError("");
    setTestVideoUrl("");
    setTestTaskId("");
    setTestProgress(0);
    setTestStatus("STARTING");
    setRunwayApiCalls(0);
    setCreditsUsed(0);

    if (!filmPlan) {
      setError(
        "Build the 5-Minute Film Plan first."
      );
      setTestStatus("ERROR");
      return;
    }

    const scenes = Array.isArray(
      filmPlan.scenes
    )
      ? filmPlan.scenes
      : [];

    if (!scenes.length) {
      setError(
        "No scenes were found in the film plan."
      );
      setTestStatus("ERROR");
      return;
    }

    const scene = scenes[0];

    if (!scene) {
      setError(
        "Scene 1 could not be found."
      );
      setTestStatus("ERROR");
      return;
    }

    const prompt =
      scene.runwayPrompt ||
      buildFallbackRunwayPrompt(
        scene,
        filmPlan,
        characterBible,
        worldBible
      );

    if (!prompt) {
      setError(
        "Scene 1 does not contain a usable Runway prompt."
      );
      setTestStatus("ERROR");
      return;
    }

    setTestGenerating(true);

    try {
      setTestStatus(
        "CALLING RUNWAY"
      );

      const response = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            duration: 10
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Runway generation request failed."
        );
      }

      if (!data.success || !data.taskId) {
        throw new Error(
          data.error ||
            "Runway did not return a task ID."
        );
      }

      setRunwayApiCalls(1);
      setTestTaskId(data.taskId);
      setTestStatus("GENERATING");
      setTestProgress(5);

      await pollTestScene(
        data.taskId
      );
    } catch (err) {
      setTestStatus("FAILED");

      setError(
        err.message ||
          "Scene 1 generation failed."
      );

      setTestGenerating(false);
    }
  }

  async function pollTestScene(taskId) {
    let attempts = 0;
    const maxAttempts = 120;

    while (attempts < maxAttempts) {
      attempts += 1;

      try {
        const response = await fetch(
          "/api/status?taskId=" +
            encodeURIComponent(taskId)
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to check Runway status."
          );
        }

        if (
          typeof data.progress ===
          "number"
        ) {
          setTestProgress(
            Math.max(
              5,
              Math.min(
                99,
                data.progress
              )
            )
          );
        }

        if (
          data.state === "success" ||
          data.status === "SUCCEEDED"
        ) {
          if (
            !data.video_url &&
            !data.videoUrl
          ) {
            throw new Error(
              "Runway finished, but no video URL was returned."
            );
          }

          setTestVideoUrl(
            data.video_url ||
              data.videoUrl
          );

          setTestProgress(100);
          setTestStatus("SUCCEEDED");

          if (
            typeof data.creditsUsed ===
            "number"
          ) {
            setCreditsUsed(
              data.creditsUsed
            );
          } else if (
            typeof data.credits ===
            "number"
          ) {
            setCreditsUsed(
              data.credits
            );
          }

          setTestGenerating(false);
          return;
        }

        if (
          data.state === "fail" ||
          data.status === "FAILED"
        ) {
          throw new Error(
            data.failReason ||
              data.error ||
              "Runway generation failed."
          );
        }

        setTestStatus(
          data.status ||
            "GENERATING"
        );

        await wait(5000);
      } catch (err) {
        setTestStatus("FAILED");

        setError(
          err.message ||
            "Unable to check Scene 1 status."
        );

        setTestGenerating(false);
        return;
      }
    }

    setTestStatus("TIMEOUT");

    setError(
      "Scene 1 generation is taking longer than expected. Check the Runway task status before starting another generation."
    );

    setTestGenerating(false);
  }

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------
  function resetProject() {
    setCharacterBible(null);
    setWorldBible(null);
    setFilmPlan(null);
    setGenerationQueue(null);

    setAudioUrl("");
    setAudioStatus("READY");
    setAudioText(DEFAULT_AUDIO_TEXT);

    setTestGenerating(false);
    setTestStatus("READY");
    setTestProgress(0);
    setTestTaskId("");
    setTestVideoUrl("");
    setRunwayApiCalls(0);
    setCreditsUsed(0);

    setError("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #050505 0%, #0d0d0d 45%, #050505 100%)",
        color: "#ffffff",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        padding: "40px 20px 80px"
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <header
          style={{
            marginBottom: "40px",
            textAlign: "center"
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: "999px",
              background: "#171717",
              border: "1px solid #333",
              color: "#aaa",
              fontSize: "12px",
              letterSpacing: "1px",
              marginBottom: "18px"
            }}
          >
            GABBOSS.AI FILM
          </div>

          <h1
            style={{
              fontSize:
                "clamp(36px, 6vw, 64px)",
              lineHeight: 1,
              margin: "0 0 18px",
              fontWeight: 800,
              letterSpacing: "-2px"
            }}
          >
            AI Film Studio
          </h1>

          <p
            style={{
              color: "#aaa",
              maxWidth: "700px",
              margin: "0 auto",
              fontSize: "17px",
              lineHeight: 1.6
            }}
          >
            Turn a story idea into a structured
            5-minute AI film plan with consistent
            characters, locations, scenes, audio,
            and cinematic direction.
          </p>
        </header>

        <div
          style={{
            background:
              "linear-gradient(135deg, #111, #171717)",
            border: "1px solid #333",
            borderRadius: "16px",
            padding: "18px 20px",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: "6px"
            }}
          >
            Controlled production test mode
          </div>

          <div
            style={{
              color: "#aaa",
              lineHeight: 1.5,
              fontSize: "14px"
            }}
          >
            Planning, story structure, scene
            organization, and ElevenLabs audio
            testing can be performed without using
            Runway video credits. Runway remains
            locked until you are ready.
          </div>
        </div>

        {/* -------------------------------------------------
            STEP 1
        -------------------------------------------------- */}
        <section
          style={{
            background: "#101010",
            border: "1px solid #292929",
            borderRadius: "20px",
            padding: "26px",
            marginBottom: "24px"
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "24px"
            }}
          >
            1. Create Your Film
          </h2>

          <p
            style={{
              margin: "0 0 22px",
              color: "#999",
              lineHeight: 1.5
            }}
          >
            Describe the story you want to turn
            into a 5-minute film.
          </p>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            Story idea
          </label>

          <textarea
            value={story}
            onChange={function (e) {
              setStory(e.target.value);
            }}
            placeholder="Describe your film..."
            rows={7}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              background: "#080808",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "15px",
              lineHeight: 1.6,
              outline: "none",
              marginBottom: "20px"
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            Characters
          </label>

          <input
            value={characters}
            onChange={function (e) {
              setCharacters(e.target.value);
            }}
            placeholder="Optional: John, Sarah, Michael..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#080808",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "15px",
              outline: "none",
              marginBottom: "20px"
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "22px"
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 700,
                  fontSize: "14px"
                }}
              >
                Visual style
              </label>

              <select
                value={style}
                onChange={function (e) {
                  setStyle(e.target.value);
                }}
                style={{
                  width: "100%",
                  background: "#080808",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "15px"
                }}
              >
                <option value="cinematic">
                  Cinematic Live Action
                </option>

                <option value="realistic">
                  Realistic
                </option>

                <option value="cartoon">
                  Animated
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 700,
                  fontSize: "14px"
                }}
              >
                Clip length
              </label>

              <select
                value={clipLength}
                onChange={function (e) {
                  setClipLength(
                    Number(e.target.value)
                  );

                  setFilmPlan(null);
                  setGenerationQueue(null);
                  setTestVideoUrl("");
                  setTestStatus("READY");
                  setTestProgress(0);
                  setTestTaskId("");
                }}
                style={{
                  width: "100%",
                  background: "#080808",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "15px"
                }}
              >
                <option value={10}>
                  10 seconds — 30 scenes
                </option>

                <option value={5}>
                  5 seconds — 60 scenes
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              onClick={buildBible}
              disabled={loadingBible}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "14px 22px",
                background:
                  loadingBible ? "#333" : "#fff",
                color:
                  loadingBible ? "#888" : "#000",
                fontWeight: 800,
                fontSize: "15px",
                cursor: loadingBible
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {loadingBible
                ? "Building Bible..."
                : "Build Character & World Bible"}
            </button>

            <button
              type="button"
              onClick={resetProject}
              style={{
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "14px 20px",
                background: "transparent",
                color: "#ccc",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>
        </section>

        {/* -------------------------------------------------
            ERROR
        -------------------------------------------------- */}
        {error && (
          <div
            style={{
              background: "#210f0f",
              border: "1px solid #713030",
              color: "#ffb5b5",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "24px",
              lineHeight: 1.5
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* -------------------------------------------------
            STEP 2 CHARACTER BIBLE
        -------------------------------------------------- */}
        {characterBible && (
          <section
            style={{
              background: "#101010",
              border: "1px solid #292929",
              borderRadius: "20px",
              padding: "26px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "20px"
              }}
            >
              <div>
                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    marginBottom: "6px"
                  }}
                >
                  STEP 2
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "24px"
                  }}
                >
                  Character Bible
                </h2>
              </div>

              <div
                style={{
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "#142014",
                  border: "1px solid #294329",
                  color: "#9be49b",
                  fontSize: "12px",
                  fontWeight: 700
                }}
              >
                READY
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "14px"
              }}
            >
              {Object.entries(characterBible).map(
                function (entry) {
                  return (
                    <BibleCard
                      key={entry[0]}
                      title={formatTitle(entry[0])}
                      value={entry[1]}
                    />
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* -------------------------------------------------
            WORLD BIBLE
        -------------------------------------------------- */}
        {worldBible && (
          <section
            style={{
              background: "#101010",
              border: "1px solid #292929",
              borderRadius: "20px",
              padding: "26px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  color: "#777",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  marginBottom: "6px"
                }}
              >
                WORLD CONTINUITY
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "24px"
                }}
              >
                World Bible
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "14px"
              }}
            >
              {Object.entries(worldBible).map(
                function (entry) {
                  return (
                    <BibleCard
                      key={entry[0]}
                      title={formatTitle(entry[0])}
                      value={entry[1]}
                    />
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* -------------------------------------------------
            STEP 3 FILM PLAN
        -------------------------------------------------- */}
        {characterBible && worldBible && (
          <section
            style={{
              background: "#101010",
              border: "1px solid #292929",
              borderRadius: "20px",
              padding: "26px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  color: "#777",
                  fontSize: "12px",
                  letterSpacing: "1px",
                  marginBottom: "6px"
                }}
              >
                STEP 3
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "24px"
                }}
              >
                Build 5-Minute Film Plan
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#999",
                  lineHeight: 1.5
                }}
              >
                This creates the complete scene
                structure without generating any
                video.
              </p>
            </div>

            <button
              type="button"
              onClick={buildFilmPlan}
              disabled={loadingPlan}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                background:
                  loadingPlan ? "#333" : "#fff",
                color:
                  loadingPlan ? "#888" : "#000",
                fontWeight: 800,
                fontSize: "16px",
                cursor: loadingPlan
                  ? "not-allowed"
                  : "pointer",
                marginBottom: "24px"
              }}
            >
              {loadingPlan
                ? "Building 5-Minute Film Plan..."
                : "Build 5-Minute Film Plan"}
            </button>

            {filmPlan && (
              <FilmPlanDisplay
                filmPlan={filmPlan}
              />
            )}
          </section>
        )}

        {/* -------------------------------------------------
            STEP 4 GENERATION QUEUE
        -------------------------------------------------- */}
        {filmPlan && (
          <section
            style={{
              background:
                "linear-gradient(135deg, #111, #191919)",
              border: "1px solid #333",
              borderRadius: "20px",
              padding: "26px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                color: "#777",
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "8px"
              }}
            >
              STEP 4
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "24px"
              }}
            >
              Generation Queue
            </h2>

            <p
              style={{
                color: "#999",
                lineHeight: 1.6,
                marginBottom: "20px"
              }}
            >
              Organize every scene into a production
              queue before video generation. This
              step itself uses zero Runway credits.
            </p>

            <button
              type="button"
              onClick={buildGenerationQueue}
              disabled={loadingQueue}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "12px",
                padding: "16px",
                background:
                  loadingQueue ? "#333" : "#fff",
                color:
                  loadingQueue ? "#888" : "#000",
                fontWeight: 800,
                fontSize: "16px",
                cursor: loadingQueue
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {loadingQueue
                ? "Building Generation Queue..."
                : "Build Generation Queue"}
            </button>

            {generationQueue && (
              <GenerationQueueDisplay
                queue={generationQueue}
              />
            )}
          </section>
        )}

        {/* -------------------------------------------------
            STEP 5 ELEVENLABS AUDIO TEST
        -------------------------------------------------- */}
        {generationQueue && (
          <section
            style={{
              background:
                "linear-gradient(135deg, #101010, #181818)",
              border: "1px solid #333",
              borderRadius: "20px",
              padding: "26px",
              marginBottom: "24px"
            }}
          >
            <div
              style={{
                color: "#777",
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "8px"
              }}
            >
              STEP 5
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "24px"
              }}
            >
              Scene 1 Audio Test
            </h2>

            <p
              style={{
                color: "#999",
                lineHeight: 1.6,
                marginBottom: "20px"
              }}
            >
              Test the ElevenLabs voice generation
              before spending any Runway video
              credits. This test uses the
              <strong style={{ color: "#fff" }}>
                {" "}ElevenLabs API only.
              </strong>
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginBottom: "20px"
              }}
            >
              <InfoBox
                label="Test"
                value="Scene 1 Audio"
              />

              <InfoBox
                label="Provider"
                value="ElevenLabs"
              />

              <InfoBox
                label="Model"
                value="Multilingual v2"
              />

              <InfoBox
                label="Runway Credits"
                value="0"
              />
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 700,
                fontSize: "14px"
              }}
            >
              Scene 1 narration / dialogue
            </label>

            <textarea
              value={audioText}
              onChange={function (e) {
                setAudioText(e.target.value);
                setAudioUrl("");
                setAudioStatus("READY");
              }}
              rows={6}
              placeholder="Enter the dialogue or narration you want ElevenLabs to speak..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                background: "#080808",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "15px",
                lineHeight: 1.6,
                outline: "none",
                marginBottom: "16px"
              }}
            />

            <button
              type="button"
              onClick={generateSceneOneAudio}
              disabled={audioGenerating}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "12px",
                padding: "17px",
                background:
                  audioGenerating
                    ? "#333"
                    : "#fff",
                color:
                  audioGenerating
                    ? "#888"
                    : "#000",
                fontWeight: 800,
                fontSize: "16px",
                cursor: audioGenerating
                  ? "not-allowed"
                  : "pointer"
              }}
            >
              {audioGenerating
                ? "Generating ElevenLabs Audio..."
                : "Generate Scene 1 Audio"}
            </button>

            <div
              style={{
                marginTop: "18px",
                background: "#080808",
                border: "1px solid #292929",
                borderRadius: "14px",
                padding: "16px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    letterSpacing: "0.8px"
                  }}
                >
                  AUDIO STATUS
                </span>

                <span
                  style={{
                    color:
                      audioStatus ===
                      "SUCCEEDED"
                        ? "#9be49b"
                        : audioStatus ===
                            "FAILED" ||
                          audioStatus ===
                            "ERROR"
                        ? "#ff9b9b"
                        : "#aaa",
                    fontWeight: 800,
                    fontSize: "12px"
                  }}
                >
                  {audioStatus}
                </span>
              </div>

              <div
                style={{
                  color: "#777",
                  fontSize: "13px",
                  lineHeight: 1.5
                }}
              >
                {audioStatus ===
                  "READY" &&
                  "Ready to generate the Scene 1 voice test."}

                {audioStatus ===
                  "STARTING" &&
                  "Starting ElevenLabs request..."}

                {audioStatus ===
                  "GENERATING" &&
                  "ElevenLabs is generating the MP3 audio..."}

                {audioStatus ===
                  "SUCCEEDED" &&
                  "Audio generated successfully. Use the player below to listen."}

                {(audioStatus ===
                  "FAILED" ||
                  audioStatus ===
                    "ERROR") &&
                  "The audio test failed. Check the error message above and your Vercel ElevenLabs configuration."}
              </div>
            </div>

            {audioUrl && (
              <div
                style={{
                  marginTop: "20px",
                  background: "#080808",
                  border: "1px solid #292929",
                  borderRadius: "16px",
                  padding: "18px"
                }}
              >
                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    marginBottom: "10px"
                  }}
                >
                  SCENE 1 AUDIO RESULT
                </div>

                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "20px"
                  }}
                >
                  ElevenLabs Voice Test
                </h3>

                <audio
                  src={audioUrl}
                  controls
                  style={{
                    width: "100%"
                  }}
                />

                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px",
                    background: "#142014",
                    border: "1px solid #294329",
                    borderRadius: "12px",
                    color: "#9be49b",
                    lineHeight: 1.5,
                    fontSize: "13px",
                    textAlign: "center"
                  }}
                >
                  Scene 1 audio generated successfully.
                  <br />
                  This test used zero Runway credits.
                </div>
              </div>
            )}
          </section>
        )}

        {/* -------------------------------------------------
            STEP 6 RUNWAY TEST
        -------------------------------------------------- */}
        {generationQueue && (
          <section
            style={{
              background:
                "linear-gradient(135deg, #111, #191919)",
              border: "1px solid #333",
              borderRadius: "20px",
              padding: "26px"
            }}
          >
            <div
              style={{
                color: "#777",
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "8px"
              }}
            >
              STEP 6
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "24px"
              }}
            >
              Video Generation Test
            </h2>

            <div
              style={{
                background: "#211b0d",
                border: "1px solid #6b5521",
                borderRadius: "12px",
                padding: "15px",
                marginBottom: "20px",
                color: "#e6d19a",
                lineHeight: 1.6,
                fontSize: "14px"
              }}
            >
              <strong>
                Runway test locked.
              </strong>
              <br />
              The Scene 1 Runway button is being
              kept available in the application, but
              do not press it until Runway credits
              have been added and verified.
            </div>

            <p
              style={{
                color: "#999",
                lineHeight: 1.6,
                marginBottom: "20px"
              }}
            >
              When Runway credits are available,
              we will test only Scene 1 first. This
              creates one 10-second video and does
              not start Scenes 2–30.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
                marginBottom: "20px"
              }}
            >
              <InfoBox
                label="Test Scene"
                value="Scene 1 only"
              />

              <InfoBox
                label="Duration"
                value="10 seconds"
              />

              <InfoBox
                label="Runway Calls"
                value={String(
                  runwayApiCalls
                )}
              />

              <InfoBox
                label="Credits Used"
                value={String(
                  creditsUsed
                )}
              />
            </div>

            <button
              type="button"
              onClick={generateTestSceneOne}
              disabled={true}
              style={{
                width: "100%",
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "17px",
                background: "#222",
                color: "#777",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "not-allowed"
              }}
            >
              Runway Test Locked — Add Credits First
            </button>

            <div
              style={{
                marginTop: "18px",
                background: "#080808",
                border: "1px solid #292929",
                borderRadius: "14px",
                padding: "16px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "10px"
                }}
              >
                <span
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    letterSpacing: "0.8px"
                  }}
                >
                  TEST STATUS
                </span>

                <span
                  style={{
                    color:
                      testStatus ===
                      "SUCCEEDED"
                        ? "#9be49b"
                        : testStatus ===
                            "FAILED"
                        ? "#ff9b9b"
                        : "#aaa",
                    fontWeight: 800,
                    fontSize: "12px"
                  }}
                >
                  {testStatus}
                </span>
              </div>

              <div
                style={{
                  height: "8px",
                  background: "#202020",
                  borderRadius: "999px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width:
                      String(
                        testProgress
                      ) + "%",
                    height: "100%",
                    background: "#fff",
                    transition:
                      "width 0.5s ease"
                  }}
                />
              </div>

              <div
                style={{
                  color: "#666",
                  fontSize: "12px",
                  marginTop: "9px"
                }}
              >
                Progress: {testProgress}%
              </div>

              {testTaskId && (
                <div
                  style={{
                    marginTop: "12px",
                    color: "#666",
                    fontSize: "11px",
                    wordBreak: "break-all"
                  }}
                >
                  Task ID: {testTaskId}
                </div>
              )}
            </div>

            {testVideoUrl && (
              <div
                style={{
                  marginTop: "24px",
                  background: "#080808",
                  border: "1px solid #292929",
                  borderRadius: "16px",
                  padding: "18px"
                }}
              >
                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    letterSpacing: "1px",
                    marginBottom: "12px"
                  }}
                >
                  SCENE 1 RESULT
                </div>

                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "20px"
                  }}
                >
                  Your 10-Second Test Video
                </h3>

                <video
                  src={testVideoUrl}
                  controls
                  playsInline
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "700px",
                    margin: "0 auto",
                    background: "#000",
                    borderRadius: "12px"
                  }}
                />

                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px",
                    background: "#142014",
                    border: "1px solid #294329",
                    borderRadius: "12px",
                    color: "#9be49b",
                    lineHeight: 1.5,
                    fontSize: "13px",
                    textAlign: "center"
                  }}
                >
                  Scene 1 completed successfully.
                  <br />
                  No additional scenes were
                  generated.
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// RUNWAY FALLBACK PROMPT
// ---------------------------------------------------------
function buildFallbackRunwayPrompt(
  scene,
  filmPlan,
  characterBible,
  worldBible
) {
  const parts = [];

  if (scene && scene.action) {
    parts.push(
      String(scene.action)
    );
  }

  if (scene && scene.camera) {
    parts.push(
      "Camera: " +
        String(scene.camera)
    );
  }

  if (scene && scene.lighting) {
    parts.push(
      "Lighting: " +
        String(scene.lighting)
    );
  }

  if (scene && scene.atmosphere) {
    parts.push(
      "Atmosphere: " +
        String(scene.atmosphere)
    );
  }

  if (scene && scene.emotion) {
    parts.push(
      "Emotion: " +
        String(scene.emotion)
    );
  }

  if (
    scene &&
    scene.visualStyle
  ) {
    parts.push(
      "Visual style: " +
        String(scene.visualStyle)
    );
  }

  if (
    scene &&
    scene.continuityInstructions
  ) {
    parts.push(
      "Continuity: " +
        String(
          scene.continuityInstructions
        )
    );
  }

  if (filmPlan) {
    parts.push(
      "Create a cinematic vertical 9:16 video."
    );
  }

  if (characterBible) {
    parts.push(
      "Maintain consistent character appearance."
    );
  }

  if (worldBible) {
    parts.push(
      "Maintain consistent location and environment."
    );
  }

  return parts.join(" ");
}

// ---------------------------------------------------------
// WAIT
// ---------------------------------------------------------
function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

// ---------------------------------------------------------
// BIBLE CARD
// ---------------------------------------------------------
function BibleCard(props) {
  return (
    <div
      style={{
        background: "#080808",
        border: "1px solid #242424",
        borderRadius: "14px",
        padding: "16px"
      }}
    >
      <div
        style={{
          color: "#777",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
          marginBottom: "8px"
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          color: "#ddd",
          lineHeight: 1.6,
          fontSize: "14px",
          whiteSpace: "pre-wrap"
        }}
      >
        {renderValue(props.value)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// FILM PLAN DISPLAY
// ---------------------------------------------------------
function FilmPlanDisplay(props) {
  const filmPlan = props.filmPlan;

  const scenes = Array.isArray(
    filmPlan.scenes
  )
    ? filmPlan.scenes
    : [];

  return (
    <div>
      <div
        style={{
          background: "#080808",
          border: "1px solid #292929",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px"
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: "22px"
          }}
        >
          {filmPlan.title ||
            "5-Minute Film Plan"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px"
          }}
        >
          <InfoBox
            label="Duration"
            value={
              String(
                filmPlan.duration || 300
              ) + " seconds"
            }
          />

          <InfoBox
            label="Clip Length"
            value={
              String(
                filmPlan.sceneDuration || 10
              ) + " seconds"
            }
          />

          <InfoBox
            label="Scenes"
            value={String(
              filmPlan.sceneCount ||
                scenes.length
            )}
          />

          <InfoBox
            label="Format"
            value="Vertical 9:16"
          />
        </div>
      </div>

      {filmPlan.storyStructure && (
        <div
          style={{
            background: "#080808",
            border: "1px solid #292929",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <h3
            style={{
              margin: "0 0 14px",
              fontSize: "19px"
            }}
          >
            Story Structure
          </h3>

          <div
            style={{
              color: "#aaa",
              lineHeight: 1.6
            }}
          >
            {renderValue(
              filmPlan.storyStructure
            )}
          </div>
        </div>
      )}

      <h3
        style={{
          margin: "0 0 14px",
          fontSize: "21px"
        }}
      >
        Scenes
      </h3>

      <div
        style={{
          display: "grid",
          gap: "14px"
        }}
      >
        {scenes.map(function (scene, index) {
          return (
            <SceneCard
              key={
                scene.sceneNumber ||
                index
              }
              scene={scene}
              index={index}
            />
          );
        })}
      </div>

      {filmPlan.continuityRules && (
        <div
          style={{
            background: "#080808",
            border: "1px solid #292929",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "24px"
          }}
        >
          <h3
            style={{
              margin: "0 0 12px",
              fontSize: "19px"
            }}
          >
            Continuity Rules
          </h3>

          <div
            style={{
              color: "#aaa",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap"
            }}
          >
            {renderValue(
              filmPlan.continuityRules
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// GENERATION QUEUE DISPLAY
// ---------------------------------------------------------
function GenerationQueueDisplay(props) {
  const queue = props.queue;

  const jobs = Array.isArray(queue.jobs)
    ? queue.jobs
    : [];

  return (
    <div
      style={{
        marginTop: "24px",
        background: "#080808",
        border: "1px solid #292929",
        borderRadius: "16px",
        padding: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "18px"
        }}
      >
        <div>
          <div
            style={{
              color: "#777",
              fontSize: "11px",
              letterSpacing: "1px",
              marginBottom: "5px"
            }}
          >
            PRODUCTION QUEUE
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "22px"
            }}
          >
            {queue.totalScenes} Scene Jobs
          </h3>
        </div>

        <div
          style={{
            padding: "7px 12px",
            borderRadius: "999px",
            background: "#142014",
            border: "1px solid #294329",
            color: "#9be49b",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          {queue.status || "READY"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "22px"
        }}
      >
        <InfoBox
          label="Scenes"
          value={String(
            queue.totalScenes
          )}
        />

        <InfoBox
          label="Waiting"
          value={String(
            queue.waitingScenes
          )}
        />

        <InfoBox
          label="Completed"
          value={String(
            queue.completedScenes
          )}
        />

        <InfoBox
          label="Credits"
          value={String(
            queue.creditsUsed
          )}
        />
      </div>

      <div
        style={{
          background: "#111",
          border: "1px solid #252525",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "20px",
          color: "#aaa",
          lineHeight: 1.6,
          fontSize: "14px"
        }}
      >
        <strong
          style={{
            color: "#fff"
          }}
        >
          Queue status:
        </strong>{" "}
        {queue.safety &&
        queue.safety.zeroCreditMode
          ? "Runway has not been called by the queue builder. All scene jobs remain waiting."
          : "Queue created."}
      </div>

      <div
        style={{
          display: "grid",
          gap: "10px"
        }}
      >
        {jobs.map(function (job, index) {
          return (
            <div
              key={
                job.jobId ||
                "job-" + index
              }
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "12px",
                padding: "13px 15px",
                background: "#101010",
                border: "1px solid #252525",
                borderRadius: "10px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: 0
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    flexShrink: 0,
                    borderRadius: "8px",
                    background: "#202020",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "12px"
                  }}
                >
                  {job.sceneNumber}
                </div>

                <div
                  style={{
                    minWidth: 0
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {job.title ||
                      "Scene " +
                        job.sceneNumber}
                  </div>

                  <div
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      marginTop: "3px"
                    }}
                  >
                    {String(
                      job.duration ||
                        queue.sceneDuration ||
                        10
                    ) + " seconds"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  padding: "5px 9px",
                  borderRadius: "999px",
                  border: "1px solid #444",
                  color: "#aaa",
                  fontSize: "11px",
                  fontWeight: 700
                }}
              >
                {job.status ||
                  "WAITING"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SCENE CARD
// ---------------------------------------------------------
function SceneCard(props) {
  const scene = props.scene;
  const index = props.index;

  return (
    <div
      style={{
        background: "#080808",
        border: "1px solid #292929",
        borderRadius: "16px",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          padding: "15px 18px",
          background: "#111",
          borderBottom: "1px solid #242424"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "#202020",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "13px"
            }}
          >
            {index + 1}
          </div>

          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "16px"
              }}
            >
              {scene.title ||
                "Scene " +
                  (index + 1)}
            </div>

            {scene.phase && (
              <div
                style={{
                  color: "#777",
                  fontSize: "12px",
                  marginTop: "3px"
                }}
              >
                {scene.phase}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            color: "#777",
            fontSize: "12px"
          }}
        >
          {String(
            scene.duration || 10
          ) + "s"}
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          display: "grid",
          gap: "16px"
        }}
      >
        {scene.action && (
          <SceneField
            label="Action"
            value={scene.action}
          />
        )}

        {scene.dialogue && (
          <SceneField
            label="Dialogue"
            value={scene.dialogue}
          />
        )}

        {scene.camera && (
          <SceneField
            label="Camera"
            value={scene.camera}
          />
        )}

        {scene.lighting && (
          <SceneField
            label="Lighting"
            value={scene.lighting}
          />
        )}

        {scene.atmosphere && (
          <SceneField
            label="Atmosphere"
            value={scene.atmosphere}
          />
        )}

        {scene.emotion && (
          <SceneField
            label="Emotion"
            value={scene.emotion}
          />
        )}

        {scene.visualStyle && (
          <SceneField
            label="Visual Style"
            value={scene.visualStyle}
          />
        )}

        {scene.continuityInstructions && (
          <SceneField
            label="Continuity"
            value={
              scene.continuityInstructions
            }
          />
        )}

        {scene.runwayPrompt && (
          <div
            style={{
              background: "#111",
              border: "1px solid #252525",
              borderRadius: "12px",
              padding: "14px"
            }}
          >
            <div
              style={{
                color: "#777",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.7px",
                marginBottom: "8px"
              }}
            >
              Future Runway Prompt
            </div>

            <div
              style={{
                color: "#aaa",
                lineHeight: 1.6,
                fontSize: "13px"
              }}
            >
              {scene.runwayPrompt}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// SCENE FIELD
// ---------------------------------------------------------
function SceneField(props) {
  return (
    <div>
      <div
        style={{
          color: "#777",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
          marginBottom: "5px"
        }}
      >
        {props.label}
      </div>

      <div
        style={{
          color: "#ccc",
          lineHeight: 1.55,
          fontSize: "14px",
          whiteSpace: "pre-wrap"
        }}
      >
        {renderValue(props.value)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// INFO BOX
// ---------------------------------------------------------
function InfoBox(props) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #252525",
        borderRadius: "12px",
        padding: "13px"
      }}
    >
      <div
        style={{
          color: "#666",
          fontSize: "11px",
          textTransform: "uppercase",
          marginBottom: "5px"
        }}
      >
        {props.label}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: "14px"
        }}
      >
        {props.value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// FORMAT TITLE
// ---------------------------------------------------------
function formatTitle(value) {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(
      /^./,
      function (char) {
        return char.toUpperCase();
      }
    )
    .trim();
}

// ---------------------------------------------------------
// RENDER VALUE
// ---------------------------------------------------------
function renderValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map(function (item) {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          return Object.entries(item)
            .map(function (entry) {
              return (
                formatTitle(entry[0]) +
                ": " +
                renderValue(entry[1])
              );
            })
            .join(" | ");
        }

        return String(item);
      })
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(function (entry) {
        return (
          formatTitle(entry[0]) +
          ": " +
          renderValue(entry[1])
        );
      })
      .join("\n");
  }

  return String(value);
}

export default App;
