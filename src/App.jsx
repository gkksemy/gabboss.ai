```jsx
import { useState } from "react";

const DEFAULT_STORY = "family thanksgiving dinner in nashville Tn";

const pageStyle = {
  minHeight: "100vh",
  background: "#070b12",
  color: "#f4f7fb",
  fontFamily: "Arial, sans-serif"
};

const heroStyle = {
  padding: "55px 20px 45px",
  background: "#101a2b",
  borderBottom: "1px solid #27344a"
};

const containerStyle = {
  width: "min(1100px, calc(100% - 32px))",
  margin: "32px auto 80px"
};

const cardStyle = {
  marginBottom: "24px",
  padding: "28px",
  borderRadius: "18px",
  background: "#0f1623",
  border: "1px solid #263349",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
};

const textareaStyle = {
  width: "100%",
  resize: "vertical",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #334158",
  background: "#080d16",
  color: "white",
  outline: "none",
  fontSize: "16px",
  lineHeight: "1.5"
};

const optionStyle = {
  border: "1px solid #34435b",
  background: "#0b111d",
  color: "#dce6f7",
  padding: "10px 16px",
  borderRadius: "999px",
  cursor: "pointer"
};

const activeOptionStyle = {
  ...optionStyle,
  background: "#eef4ff",
  color: "#08101d",
  borderColor: "#eef4ff"
};

const primaryButtonStyle = {
  border: "0",
  borderRadius: "10px",
  padding: "13px 18px",
  fontWeight: "800",
  background: "#eef4ff",
  color: "#08101d",
  cursor: "pointer"
};

const secondaryButtonStyle = {
  border: "0",
  borderRadius: "10px",
  padding: "13px 18px",
  fontWeight: "800",
  background: "#eef4ff",
  color: "#08101d",
  cursor: "pointer"
};

const disabledButtonStyle = {
  border: "0",
  borderRadius: "10px",
  padding: "13px 18px",
  fontWeight: "800",
  background: "#202b3c",
  color: "#8190a7",
  cursor: "not-allowed"
};

const labelStyle = {
  display: "block",
  margin: "20px 0 8px",
  fontWeight: "700"
};

const optionContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
};

const filmTargetStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginTop: "24px",
  padding: "16px",
  borderRadius: "12px",
  background: "#151e2d",
  border: "1px solid #29364b"
};

const messageStyle = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#10251b",
  border: "1px solid #245c3c",
  color: "#a9e6bc",
  fontWeight: "700"
};

const errorStyle = {
  marginTop: "18px",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#35191d",
  border: "1px solid #69343a",
  color: "#ffb4b4"
};

const characterStyle = {
  margin: "20px 0",
  padding: "18px",
  borderRadius: "12px",
  background: "#111a28",
  border: "1px solid #263349"
};

const structureStyle = {
  marginBottom: "24px",
  padding: "18px",
  borderRadius: "12px",
  background: "#111a28",
  border: "1px solid #263349"
};

const sceneStyle = {
  padding: "20px",
  borderRadius: "14px",
  background: "#0a101b",
  border: "1px solid #25334a"
};

const zeroCreditStyle = {
  marginBottom: "20px",
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#10251b",
  border: "1px solid #245c3c",
  color: "#a9e6bc",
  fontWeight: "700"
};

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
      setError("Please enter a story.");
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
          style
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to build Character and World Bible."
        );
      }

      if (!data.characterBible || !data.worldBible) {
        throw new Error(
          "Character Bible or World Bible was not returned."
        );
      }

      setCharacterBible(data.characterBible);
      setWorldBible(data.worldBible);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setCharacterBible(null);
      setWorldBible(null);
    } finally {
      setLoadingBible(false);
    }
  }

  async function buildFilmPlan() {
    setError("");

    if (!story.trim()) {
      setError("Please enter a story.");
      return;
    }

    if (!characterBible || !worldBible) {
      setError(
        "Please build the Character & World Bible first."
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
          characterBible,
          worldBible
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to build Film Plan."
        );
      }

      if (!data.filmPlan) {
        throw new Error(
          "Film Plan was not returned by the API."
        );
      }

      setFilmPlan(data.filmPlan);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoadingPlan(false);
    }
  }

  return (
    <div style={pageStyle}>
      <header style={heroStyle}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto"
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "0.04em"
            }}
          >
            GABBOSS.AI FILM
          </h1>

          <p
            style={{
              margin: "10px 0 4px",
              fontSize: "1.3rem",
              color: "#dce6f7"
            }}
          >
            AI Film Studio
          </p>

          <span style={{ color: "#9eb4d4" }}>
            Powered by Runway Gen-4.5
          </span>
        </div>
      </header>

      <main style={containerStyle}>
        <section style={cardStyle}>
          <h2>Create Your Film</h2>

          <label style={labelStyle}>
            Story
          </label>

          <textarea
            value={story}
            onChange={(event) =>
              setStory(event.target.value)
            }
            placeholder="Describe the story you want to turn into a film..."
            rows={5}
            style={textareaStyle}
          />

          <label style={labelStyle}>
            Characters
          </label>

          <textarea
            value={characters}
            onChange={(event) =>
              setCharacters(event.target.value)
            }
            placeholder="Optional: John, Sarah, Michael..."
            rows={3}
            style={textareaStyle}
          />

          <label style={labelStyle}>
            Visual Style
          </label>

          <div style={optionContainerStyle}>
            {["cinematic", "realistic", "anime"].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  style={
                    style === option
                      ? activeOptionStyle
                      : optionStyle
                  }
                  onClick={() => setStyle(option)}
                >
                  {option.charAt(0).toUpperCase() +
                    option.slice(1)}
                </button>
              )
            )}
          </div>

          <label style={labelStyle}>
            Runway Clip Length
          </label>

          <div style={optionContainerStyle}>
            {[5, 10].map((seconds) => (
              <button
                key={seconds}
                type="button"
                style={
                  clipLength === seconds
                    ? activeOptionStyle
                    : optionStyle
                }
                onClick={() => setClipLength(seconds)}
              >
                {seconds} seconds
              </button>
            ))}
          </div>

          <div style={filmTargetStyle}>
            <strong>Film Length</strong>

            <span>5 minutes</span>

            <small style={{ color: "#91a2bb" }}>
              300 seconds total production time
            </small>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "26px"
            }}
          >
            <button
              type="button"
              onClick={buildBible}
              disabled={loadingBible}
              style={{
                ...primaryButtonStyle,
                opacity: loadingBible ? 0.5 : 1
              }}
            >
              {loadingBible
                ? "BUILDING..."
                : "BUILD CHARACTER & WORLD BIBLE"}
            </button>

            <button
              type="button"
              onClick={buildFilmPlan}
              disabled={loadingPlan}
              style={{
                ...secondaryButtonStyle,
                opacity: loadingPlan ? 0.5 : 1
              }}
            >
              {loadingPlan
                ? "BUILDING..."
                : "BUILD FILM PLAN"}
            </button>
          </div>

          {characterBible && worldBible && !filmPlan && (
            <div style={messageStyle}>
              Character Bible and World Bible are ready.
              Click BUILD FILM PLAN to create the
              5-minute production plan.
            </div>
          )}

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}
        </section>

        {characterBible && (
          <section style={cardStyle}>
            <h2>Character Bible</h2>

            <p style={{ color: "#9eb0c9" }}>
              These character rules will keep the cast
              consistent throughout the film.
            </p>

            {(characterBible.characters || []).map(
              (character, index) => (
                <div
                  style={characterStyle}
                  key={character.id || index}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {character.role}
                  </h3>

                  <p>
                    {character.description}
                  </p>

                  <p>
                    <strong>Appearance:</strong>{" "}
                    {character.appearance}
                  </p>

                  <p>
                    <strong>Clothing:</strong>{" "}
                    {character.clothing}
                  </p>

                  <p>
                    <strong>Personality:</strong>{" "}
                    {character.personality}
                  </p>

                  <p>
                    <strong>Continuity:</strong>{" "}
                    {character.continuity}
                  </p>
                </div>
              )
            )}

            <h3>
              Character Continuity Rules
            </h3>

            <ul style={{ paddingLeft: "22px" }}>
              {(
                characterBible.globalCharacterRules ||
                []
              ).map((rule, index) => (
                <li
                  key={index}
                  style={{
                    lineHeight: 1.65,
                    color: "#d6deeb"
                  }}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        )}

        {worldBible && (
          <section style={cardStyle}>
            <h2>World Bible</h2>

            <p style={{ color: "#9eb0c9" }}>
              These rules keep the film world visually
              consistent.
            </p>

            <h3>LOCATION</h3>

            <p>
              {worldBible.primaryLocation}
            </p>

            <h3>EVENT</h3>

            <p>
              {worldBible.primaryEvent}
            </p>

            <h3>TIME</h3>

            <p>
              {worldBible.timeOfDay}
            </p>

            <h3>WEATHER</h3>

            <p>
              {worldBible.weather}
            </p>

            {worldBible.environment && (
              <>
                <h3>LIGHTING</h3>

                <p>
                  {worldBible.environment.lighting}
                </p>

                <h3>ARCHITECTURE</h3>

                <p>
                  {worldBible.environment.architecture}
                </p>

                <h3>INTERIOR DESIGN</h3>

                <p>
                  {worldBible.environment.interiorDesign}
                </p>

                <h3>OUTDOOR ENVIRONMENT</h3>

                <p>
                  {worldBible.environment
                    .outdoorEnvironment}
                </p>

                <h3>ATMOSPHERE</h3>

                <p>
                  {worldBible.environment.atmosphere}
                </p>
              </>
            )}

            <h3>
              World Continuity Rules
            </h3>

            <ul style={{ paddingLeft: "22px" }}>
              {(
                worldBible.globalWorldRules || []
              ).map((rule, index) => (
                <li
                  key={index}
                  style={{
                    lineHeight: 1.65,
                    color: "#d6deeb"
                  }}
                >
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        )}

        {filmPlan && (
          <section style={cardStyle}>
            <h2>Film Plan</h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "16px",
                margin: "16px 0",
                borderRadius: "12px",
                background: "#151e2d"
              }}
            >
              <strong>
                {filmPlan.sceneCount} scenes ×{" "}
                {filmPlan.sceneDuration} seconds ={" "}
                {filmPlan.duration} seconds
              </strong>

              <span style={{ color: "#9eb4d4" }}>
                5-minute film
              </span>
            </div>

            <div style={zeroCreditStyle}>
              ZERO-CREDIT TEST — Runway has NOT been
              called and NO credits have been used.
            </div>

            <div style={structureStyle}>
              <h3 style={{ marginTop: 0 }}>
                Film Structure
              </h3>

              <p>
                Opening → Setup → Development →
                Conflict → Climax → Resolution
              </p>

              <p>
                <strong>Total scenes:</strong>{" "}
                {filmPlan.sceneCount}
              </p>

              <p>
                <strong>Clip length:</strong>{" "}
                {filmPlan.sceneDuration} seconds
              </p>

              <p>
                <strong>Total duration:</strong>{" "}
                {filmPlan.duration} seconds
              </p>

              <p>
                <strong>Format:</strong>{" "}
                9:16 vertical
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: "16px"
              }}
            >
              {(filmPlan.scenes || []).map(
                (scene) => (
                  <article
                    style={sceneStyle}
                    key={scene.sceneNumber}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "16px",
                        alignItems: "center"
                      }}
                    >
                      <h3 style={{ margin: 0 }}>
                        Scene {scene.sceneNumber}:{" "}
                        {scene.title}
                      </h3>

                      <span
                        style={{
                          whiteSpace: "nowrap",
                          color: "#9eb4d4",
                          fontWeight: "700"
                        }}
                      >
                        {scene.duration} seconds
                      </span>
                    </div>

                    <p
                      style={{
                        display: "inline-block",
                        padding: "5px 9px",
                        borderRadius: "999px",
                        background: "#182235",
                        color: "#b7c9e2",
                        fontSize: "0.85rem",
                        fontWeight: "700"
                      }}
                    >
                      {scene.phase}
                    </p>

                    <p>
                      <strong>Action:</strong>{" "}
                      {scene.action}
                    </p>

                    <p>
                      <strong>Emotion:</strong>{" "}
                      {scene.emotion}
                    </p>

                    <p>
                      <strong>Camera:</strong>{" "}
                      {scene.camera}
                    </p>

                    <p>
                      <strong>Location:</strong>{" "}
                      {scene.location}
                    </p>

                    <p>
                      <strong>
                        Runway Prompt:
                      </strong>{" "}
                      {scene.runwayPrompt}
                    </p>

                    <button
                      type="button"
                      disabled
                      style={disabledButtonStyle}
                    >
                      GENERATE SCENE{" "}
                      {scene.sceneNumber}
                    </button>
                  </article>
                )
              )}
            </div>

            <button
              type="button"
              disabled
              style={{
                ...disabledButtonStyle,
                width: "100%",
                marginTop: "22px",
                padding: "16px"
              }}
            >
              GENERATE ALL{" "}
              {filmPlan.sceneCount || 30} SCENES
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
```
