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

      setCharacterBible(data.characterBible);
      setWorldBible(data.worldBible);
      setFilmPlan(null);
    } catch (err) {
      setError(err.message || "Something went wrong.");
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
      setError("Build the Character & World Bible first.");
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

          // IMPORTANT:
          // The actual film is 5 minutes = 300 seconds.
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
        <div className="hero-inner">
          <h1>GABBOSS.AI FILM</h1>
          <p>AI Film Studio</p>
          <span>Powered by Runway Gen-4.5</span>
        </div>
      </header>

      <main className="container">

        {/* CREATE FILM */}
        <section className="card">
          <h2>Create Your Film</h2>

          <label>Story</label>

          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Describe the story you want to turn into a film..."
            rows={5}
          />

          <label>Characters</label>

          <textarea
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
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
                {option.charAt(0).toUpperCase() +
                  option.slice(1)}
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

          <div className="film-target">
            <strong>Film Length</strong>
            <span>5 minutes</span>
            <small>
              300 seconds total production time
            </small>
          </div>

          <div className="button-row">

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
              className="secondary"
              type="button"
              onClick={buildFilmPlan}
              disabled={
                loadingPlan ||
                !characterBible ||
                !worldBible
              }
            >
              {loadingPlan
                ? "BUILDING..."
                : "BUILD FILM PLAN"}
            </button>

          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </section>

        {/* CHARACTER BIBLE */}
        {characterBible && (
          <section className="card">
            <h2>Character Bible</h2>

            <p className="description">
              These character rules will keep the cast
              consistent.
            </p>

            {(characterBible.characters || []).map(
              (character) => (
                <div
                  className="character"
                  key={character.id}
                >
                  <h3>{character.role}</h3>

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

            <h3>Character Continuity Rules</h3>

            <ul>
              {(
                characterBible.globalCharacterRules ||
                []
              ).map((rule, index) => (
                <li key={index}>
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* WORLD BIBLE */}
        {worldBible && (
          <section className="card">
            <h2>World Bible</h2>

            <p className="description">
              These rules keep the film&apos;s world
              visually consistent.
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
                  <li key={index}>
                    {rule}
                  </li>
                )
              )}
            </ul>
          </section>
        )}

        {/* FILM PLAN */}
        {filmPlan && (
          <section className="card">

            <h2>Film Plan</h2>

            <div className="plan-summary">
              <strong>
                {filmPlan.sceneCount} scenes ×{" "}
                {filmPlan.sceneDuration} seconds ={" "}
                {filmPlan.duration} seconds planned
              </strong>

              <span>
                5-minute film
              </span>
            </div>

            <div className="zero-credit">
              ZERO-CREDIT TEST — Runway has not
              been called and no credits have been used.
            </div>

            <div className="structure-box">
              <h3>Film Structure</h3>

              <p>
                Opening → Setup → Development →
                Conflict → Climax → Resolution
              </p>

              <p>
                <strong>
                  Total scenes:
                </strong>{" "}
                {filmPlan.sceneCount}
              </p>

              <p>
                <strong>
                  Clip length:
                </strong>{" "}
                {filmPlan.sceneDuration} seconds
              </p>

              <p>
                <strong>
                  Total duration:
                </strong>{" "}
                {filmPlan.duration} seconds
              </p>

              <p>
                <strong>
                  Format:
                </strong>{" "}
                9:16 vertical
              </p>
            </div>

            <div className="scene-list">

              {(filmPlan.scenes || []).map(
                (scene) => (
                  <article
                    className="scene"
                    key={scene.sceneNumber}
                  >

                    <div className="scene-header">

                      <h3>
                        Scene{" "}
                        {scene.sceneNumber}:{" "}
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
                      <strong>
                        Action:
                      </strong>{" "}
                      {scene.action}
                    </p>

                    <p>
                      <strong>
                        Emotion:
                      </strong>{" "}
                      {scene.emotion}
                    </p>

                    <p>
                      <strong>
                        Camera:
                      </strong>{" "}
                      {scene.camera}
                    </p>

                    <p>
                      <strong>
                        Location:
                      </strong>{" "}
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
                      className="generate-disabled"
                      disabled
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
              className="generate-all-disabled"
              disabled
            >
              GENERATE ALL 30 SCENES
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
          font-family:
            Inter,
            Arial,
            sans-serif;

          background:
            radial-gradient(
              circle at top,
              #18243a 0%,
              #090d16 45%,
              #05070c 100%
            );

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
          padding:
            56px
            20px
            44px;

          background:
            linear-gradient(
              135deg,
              rgba(39, 64, 102, 0.9),
              rgba(9, 13, 22, 0.95)
            );

          border-bottom:
            1px solid
            rgba(255,255,255,0.08);
        }

        .hero-inner {
          width:
            min(1100px, 100%);

          margin:
            0 auto;
        }

        .hero h1 {
          margin: 0;

          font-size:
            clamp(
              2rem,
              5vw,
              4rem
            );

          letter-spacing:
            0.04em;
        }

        .hero p {
          margin:
            10px 0 4px;

          font-size:
            1.3rem;

          color:
            #dce6f7;
        }

        .hero span {
          color:
            #9eb4d4;
        }

        .container {
          width:
            min(
              1100px,
              calc(100% - 32px)
            );

          margin:
            32px auto 80px;
        }

        .card {
          margin-bottom:
            24px;

          padding:
            28px;

          border-radius:
            18px;

          background:
            rgba(
              15,
              22,
              35,
              0.92
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );

          box-shadow:
            0 20px 60px
            rgba(
              0,
              0,
              0,
              0.25
            );
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

          margin:
            20px 0 8px;

          font-weight: 700;
        }

        textarea {
          width: 100%;

          resize: vertical;

          padding: 14px;

          border-radius: 12px;

          border:
            1px solid
            #334158;

          background:
            #080d16;

          color: white;

          outline: none;
        }

        textarea:focus {
          border-color:
            #7ea5dc;
        }

        .options {
          display: flex;

          flex-wrap: wrap;

          gap: 10px;
        }

        .option {
          border:
            1px solid
            #34435b;

          background:
            #0b111d;

          color:
            #dce6f7;

          padding:
            10px 16px;

          border-radius:
            999px;

          cursor: pointer;
        }

        .option.active {
          background:
            #dce6f7;

          color:
            #0a101b;

          border-color:
            #dce6f7;
        }

        .film-target {
          display: flex;

          flex-direction: column;

          gap: 4px;

          margin-top: 24px;

          padding: 16px;

          border-radius: 12px;

          background:
            rgba(
              255,
              255,
              255,
              0.045
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .film-target strong {
          font-size: 1.15rem;
        }

        .film-target span {
          color:
            #dce6f7;

          font-size: 1.05rem;
        }

        .film-target small {
          color:
            #91a2bb;
        }

        .button-row {
          display: flex;

          flex-wrap: wrap;

          gap: 12px;

          margin-top: 26px;
        }

        .primary,
        .secondary,
        .generate-disabled,
        .generate-all-disabled {
          border: 0;

          border-radius: 10px;

          padding:
            13px 18px;

          font-weight: 800;
        }

        .primary {
          background:
            #eef4ff;

          color:
            #08101d;

          cursor:
            pointer;
        }

        .secondary {
          background:
            #2a3952;

          color: white;

          cursor:
            pointer;
        }

        .primary:disabled,
        .secondary:disabled {
          opacity: 0.5;

          cursor:
            not-allowed;
        }

        .error {
          margin-top: 18px;

          padding:
            12px 14px;

          border-radius:
            10px;

          background:
            rgba(
              180,
              50,
              50,
              0.16
            );

          border:
            1px solid
            rgba(
              255,
              100,
              100,
              0.25
            );

          color:
            #ffb4b4;
        }

        .description {
          color:
            #9eb0c9;
        }

        .character {
          margin:
            20px 0;

          padding:
            18px;

          border-radius:
            12px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .character h3 {
          margin-top: 0;
        }

        p,
        li {
          line-height:
            1.65;

          color:
            #d6deeb;
        }

        ul {
          padding-left:
            22px;
        }

        .plan-summary {
          display: flex;

          flex-direction: column;

          gap: 5px;

          padding: 16px;

          margin:
            16px 0;

          border-radius:
            12px;

          background:
            rgba(
              255,
              255,
              255,
              0.045
            );

          font-size:
            1.1rem;
        }

        .plan-summary span {
          color:
            #9eb4d4;
        }

        .zero-credit {
          margin-bottom:
            20px;

          padding:
            12px 14px;

          border-radius:
            10px;

          background:
            rgba(
              80,
              170,
              120,
              0.12
            );

          border:
            1px solid
            rgba(
              100,
              200,
              140,
              0.25
            );

          color:
            #a9e6bc;

          font-weight:
            700;
        }

        .structure-box {
          margin-bottom:
            24px;

          padding:
            18px;

          border-radius:
            12px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .structure-box h3 {
          margin-top: 0;
        }

        .scene-list {
          display: grid;

          gap: 16px;
        }

        .scene {
          padding:
            20px;

          border-radius:
            14px;

          background:
            #0a101b;

          border:
            1px solid
            #25334a;
        }

        .scene-header {
          display: flex;

          justify-content:
            space-between;

          gap: 16px;

          align-items:
            center;
        }

        .scene-header h3 {
          margin: 0;
        }

        .scene-header span {
          white-space:
            nowrap;

          color:
            #9eb4d4;

          font-weight:
            700;
        }

        .phase {
          display:
            inline-block;

          padding:
            5px 9px;

          border-radius:
            999px;

          background:
            rgba(
              255,
              255,
              255,
              0.06
            );

          color:
            #b7c9e2;

          font-size:
            0.85rem;

          font-weight:
            700;
        }

        .generate-disabled,
        .generate-all-disabled {
          background:
            #202b3c;

          color:
            #8190a7;

          cursor:
            not-allowed;

          margin-top:
            8px;
        }

        .generate-all-disabled {
          width: 100%;

          margin-top:
            22px;

          padding:
            16px;
        }

        @media (max-width: 700px) {

          .card {
            padding:
              20px;
          }

          .scene-header {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .button-row {
            flex-direction:
              column;
          }

          .primary,
          .secondary {
            width:
              100%;
          }
        }

      `}</style>
    </div>
  );
}
