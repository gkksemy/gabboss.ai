```jsx
import { useState } from "react";

const DEFAULT_STORY = "family thanksgiving dinner in nashville Tn";

export default function App() {
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
          data.error || "Failed to build Character and World Bible."
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
    <div className="app">

      <header className="hero">
        <div className="heroInner">
          <h1>GABBOSS.AI FILM</h1>
          <p>AI Film Studio</p>
          <span>Powered by Runway Gen-4.5</span>
        </div>
      </header>

      <main className="container">

        <section className="card">
          <h2>Create Your Film</h2>

          <label>Story</label>

          <textarea
            value={story}
            onChange={(event) => setStory(event.target.value)}
            placeholder="Describe the story you want to turn into a film..."
            rows={5}
          />

          <label>Characters</label>

          <textarea
            value={characters}
            onChange={(event) =>
              setCharacters(event.target.value)
            }
            placeholder="Optional: John, Sarah, Michael..."
            rows={3}
          />

          <label>Visual Style</label>

          <div className="options">
            {["cinematic", "realistic", "anime"].map((option) => (
              <button
                key={option}
                type="button"
                className={
                  style === option
                    ? "option active"
                    : "option"
                }
                onClick={() => setStyle(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          <label>Runway Clip Length</label>

          <div className="options">
            {[5, 10].map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={
                  clipLength === seconds
                    ? "option active"
                    : "option"
                }
                onClick={() => setClipLength(seconds)}
              >
                {seconds} seconds
              </button>
            ))}
          </div>

          <div className="filmTarget">
            <strong>Film Length</strong>
            <span>5 minutes</span>
            <small>300 seconds total production time</small>
          </div>

          <div className="buttonRow">

            <button
              className="primary"
              type="button"
              onClick={buildBible}
              disabled={loadingBible}
            >
              {loadingBible
                ? "BUILDING..."
                : "BUILD CHARACTER & WORLD BIBLE"}
            </button>

            <button
              className={
                characterBible && worldBible
                  ? "secondary ready"
                  : "secondary"
              }
              type="button"
              onClick={buildFilmPlan}
              disabled={loadingPlan}
            >
              {loadingPlan
                ? "BUILDING..."
                : "BUILD FILM PLAN"}
            </button>

          </div>

          {characterBible && worldBible && !filmPlan && (
            <div className="readyMessage">
              Character Bible and World Bible are ready.
              Click BUILD FILM PLAN to create the 5-minute
              production plan.
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </section>

        {characterBible && (
          <section className="card">
            <h2>Character Bible</h2>

            <p className="description">
              These character rules will keep the cast
              consistent.
            </p>

            {(characterBible.characters || []).map(
              (character, index) => (
                <div
                  className="character"
                  key={character.id || index}
                >
                  <h3>{character.role}</h3>

                  <p>{character.description}</p>

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

            <h3>Character Continuity Rules</h3>

            <ul>
              {(
                characterBible.globalCharacterRules || []
              ).map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </section>
        )}

        {worldBible && (
          <section className="card">
            <h2>World Bible</h2>

            <p className="description">
              These rules keep the film world visually
              consistent.
            </p>

            <h3>LOCATION</h3>
            <p>{worldBible.primaryLocation}</p>

            <h3>EVENT</h3>
            <p>{worldBible.primaryEvent}</p>

            <h3>TIME</h3>
            <p>{worldBible.timeOfDay}</p>

            <h3>WEATHER</h3>
            <p>{worldBible.weather}</p>

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
                  {worldBible.environment.outdoorEnvironment}
                </p>

                <h3>ATMOSPHERE</h3>
                <p>
                  {worldBible.environment.atmosphere}
                </p>
              </>
            )}

            <h3>World Continuity Rules</h3>

            <ul>
              {(worldBible.globalWorldRules || []).map(
                (rule, index) => (
                  <li key={index}>{rule}</li>
                )
              )}
            </ul>
          </section>
        )}

        {filmPlan && (
          <section className="card">

            <h2>Film Plan</h2>

            <div className="planSummary">
              <strong>
                {filmPlan.sceneCount} scenes ×{" "}
                {filmPlan.sceneDuration} seconds ={" "}
                {filmPlan.duration} seconds planned
              </strong>

              <span>5-minute film</span>
            </div>

            <div className="zeroCredit">
              ZERO-CREDIT TEST — Runway has not been
              called and no credits have been used.
            </div>

            <div className="structureBox">
              <h3>Film Structure</h3>

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
                <strong>Format:</strong> 9:16 vertical
              </p>
            </div>

            <div className="sceneList">

              {(filmPlan.scenes || []).map((scene) => (
                <article
                  className="scene"
                  key={scene.sceneNumber}
                >

                  <div className="sceneHeader">
                    <h3>
                      Scene {scene.sceneNumber}:{" "}
                      {scene.title}
                    </h3>

                    <span>
                      {scene.duration} seconds
                    </span>
                  </div>

                  <p className="phase">
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
                    <strong>Runway Prompt:</strong>{" "}
                    {scene.runwayPrompt}
                  </p>

                  <button
                    type="button"
                    className="generateDisabled"
                    disabled
                  >
                    GENERATE SCENE {scene.sceneNumber}
                  </button>

                </article>
              ))}

            </div>

            <button
              type="button"
              className="generateAllDisabled"
              disabled
            >
              GENERATE ALL {filmPlan.sceneCount || 30} SCENES
            </button>

          </section>
        )}

      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #070b12;
          color: #f4f7fb;
        }

        button,
        textarea {
          font: inherit;
        }

        .app {
          min-height: 100vh;
        }

        .hero {
          padding: 55px 20px 45px;
          background: #101a2b;
          border-bottom: 1px solid #27344a;
        }

        .heroInner {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 4rem);
          letter-spacing: 0.04em;
        }

        .hero p {
          margin: 10px 0 4px;
          font-size: 1.3rem;
          color: #dce6f7;
        }

        .hero span {
          color: #9eb4d4;
        }

        .container {
          width: min(1100px, calc(100% - 32px));
          margin: 32px auto 80px;
        }

        .card {
          margin-bottom: 24px;
          padding: 28px;
          border-radius: 18px;
          background: #0f1623;
          border: 1px solid #263349;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .card h2 {
          margin-top: 0;
          font-size: 1.8rem;
        }

        .card h3 {
          margin-top: 24px;
        }

        label {
          display: block;
          margin: 20px 0 8px;
          font-weight: 700;
        }

        textarea {
          width: 100%;
          resize: vertical;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #334158;
          background: #080d16;
          color: white;
          outline: none;
        }

        textarea:focus {
          border-color: #7ea5dc;
        }

        .options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .option {
          border: 1px solid #34435b;
          background: #0b111d;
          color: #dce6f7;
          padding: 10px 16px;
          border-radius: 999px;
          cursor: pointer;
        }

        .option.active {
          background: #dce6f7;
          color: #0a101b;
          border-color: #dce6f7;
        }

        .filmTarget {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 24px;
          padding: 16px;
          border-radius: 12px;
          background: #151e2d;
          border: 1px solid #29364b;
        }

        .filmTarget strong {
          font-size: 1.15rem;
        }

        .filmTarget span {
          color: #dce6f7;
          font-size: 1.05rem;
        }

        .filmTarget small {
          color: #91a2bb;
        }

        .buttonRow {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .primary,
        .secondary,
        .generateDisabled,
        .generateAllDisabled {
          border: 0;
          border-radius: 10px;
          padding: 13px 18px;
          font-weight: 800;
        }

        .primary {
          background: #eef4ff;
          color: #08101d;
          cursor: pointer;
        }

        .secondary {
          background: #2a3952;
          color: white;
          cursor: pointer;
        }

        .secondary.ready {
          background: #eef4ff;
          color: #08101d;
        }

        .primary:disabled,
        .secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .readyMessage {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #10251b;
          border: 1px solid #245c3c;
          color: #a9e6bc;
          font-weight: 700;
        }

        .error {
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #35191d;
          border: 1px solid #69343a;
          color: #ffb4b4;
        }

        .description {
          color: #9eb0c9;
        }

        .character {
          margin: 20px 0;
          padding: 18px;
          border-radius: 12px;
          background: #111a28;
          border: 1px solid #263349;
        }

        .character h3 {
          margin-top: 0;
        }

        p,
        li {
          line-height: 1.65;
          color: #d6deeb;
        }

        ul {
          padding-left: 22px;
        }

        .planSummary {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 16px;
          margin: 16px 0;
          border-radius: 12px;
          background: #151e2d;
          font-size: 1.1rem;
        }

        .planSummary span {
          color: #9eb4d4;
        }

        .zeroCredit {
          margin-bottom: 20px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #10251b;
          border: 1px solid #245c3c;
          color: #a9e6bc;
          font-weight: 700;
        }

        .structureBox {
          margin-bottom: 24px;
          padding: 18px;
          border-radius: 12px;
          background: #111a28;
          border: 1px solid #263349;
        }

        .structureBox h3 {
          margin-top: 0;
        }

        .sceneList {
          display: grid;
          gap: 16px;
        }

        .scene {
          padding: 20px;
          border-radius: 14px;
          background: #0a101b;
          border: 1px solid #25334a;
        }

        .sceneHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }

        .sceneHeader h3 {
          margin: 0;
        }

        .sceneHeader span {
          white-space: nowrap;
          color: #9eb4d4;
          font-weight: 700;
        }

        .phase {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 999px;
          background: #182235;
          color: #b7c9e2;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .generateDisabled,
        .generateAllDisabled {
          background: #202b3c;
          color: #8190a7;
          cursor: not-allowed;
          margin-top: 8px;
        }

        .generateAllDisabled {
          width: 100%;
          margin-top: 22px;
          padding: 16px;
        }

        @media (max-width: 700px) {
          .card {
            padding: 20px;
          }

          .sceneHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .buttonRow {
            flex-direction: column;
          }

          .primary,
          .secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
```
