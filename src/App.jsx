import { useState } from "react";

const DEFAULT_STORY =
  "family thanksgiving dinner in nashville Tn";

function App() {
  const [story, setStory] = useState(DEFAULT_STORY);
  const [characters, setCharacters] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [clipLength, setClipLength] = useState(10);

  const [characterBible, setCharacterBible] = useState(null);
  const [worldBible, setWorldBible] = useState(null);
  const [filmPlan, setFilmPlan] = useState(null);

  const [loadingBible, setLoadingBible] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState("");

  async function buildBible() {
    setError("");
    setFilmPlan(null);

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

  async function buildFilmPlan() {
    setError("");

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

  function resetProject() {
    setCharacterBible(null);
    setWorldBible(null);
    setFilmPlan(null);
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
            characters, locations, scenes, and
            cinematic direction.
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
            Zero-credit testing mode
          </div>

          <div
            style={{
              color: "#aaa",
              lineHeight: 1.5,
              fontSize: "14px"
            }}
          >
            This version does not call Runway.
            We are testing the story, Bible, and
            5-minute film-plan structure first.
            No video-generation credits are used.
          </div>
        </div>

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
            Describe the story you want to turn into
            a 5-minute film.
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
                  const key = entry[0];
                  const value = entry[1];

                  return (
                    <BibleCard
                      key={key}
                      title={formatTitle(key)}
                      value={value}
                    />
                  );
                }
              )}
            </div>
          </section>
        )}

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
                  const key = entry[0];
                  const value = entry[1];

                  return (
                    <BibleCard
                      key={key}
                      title={formatTitle(key)}
                      value={value}
                    />
                  );
                }
              )}
            </div>
          </section>
        )}

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

        {filmPlan && (
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
              STEP 4
            </div>

            <h2
              style={{
                margin: "0 0 10px",
                fontSize: "24px"
              }}
            >
              Video Generation
            </h2>

            <p
              style={{
                color: "#999",
                lineHeight: 1.6,
                marginBottom: "20px"
              }}
            >
              The film plan is ready for video
              generation. Runway generation is
              intentionally disabled during structural
              testing so no credits are used.
            </p>

            <button
              type="button"
              disabled
              style={{
                width: "100%",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "16px",
                background: "#0b0b0b",
                color: "#555",
                fontWeight: 800,
                fontSize: "15px",
                cursor: "not-allowed"
              }}
            >
              Runway Generation — Waiting for Credits
            </button>

            <div
              style={{
                marginTop: "14px",
                textAlign: "center",
                color: "#666",
                fontSize: "13px"
              }}
            >
              Runway API calls: 0
              <br />
              Credits used: 0
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

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

function FilmPlanDisplay(props) {
  const filmPlan = props.filmPlan;

  const scenes = Array.isArray(filmPlan.scenes)
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
              key={scene.id || index}
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
                "Scene " + (index + 1)}
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
          {String(scene.duration || 10) + "s"}
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
