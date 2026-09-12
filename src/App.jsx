```jsx
import { useState } from 'react';

export default function App() {
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [clipDuration, setClipDuration] = useState(5);

  const [characterBible, setCharacterBible] = useState(null);
  const [worldBible, setWorldBible] = useState(null);
  const [scenes, setScenes] = useState([]);

  const [loadingBible, setLoadingBible] = useState(false);
  const [loadingScenes, setLoadingScenes] = useState(false);

  const [generatingScene, setGeneratingScene] = useState(null);
  const [sceneVideos, setSceneVideos] = useState({});

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function buildBible() {
    setError('');
    setMessage('');
    setLoadingBible(true);

    try {
      const response = await fetch('/api/bible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          story,
          characters,
          style
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to build Bible.');
      }

      setCharacterBible(data.characterBible);
      setWorldBible(data.worldBible);

      setMessage(
        'Character Bible and World Bible created successfully.'
      );
    } catch (err) {
      setError(err.message || 'Failed to build Bible.');
    } finally {
      setLoadingBible(false);
    }
  }

  async function buildFilmPlan() {
    setError('');
    setMessage('');
    setLoadingScenes(true);

    try {
      let currentCharacterBible = characterBible;
      let currentWorldBible = worldBible;

      /*
       * If the user has not built the Bible yet,
       * build it automatically first.
       */
      if (!currentCharacterBible || !currentWorldBible) {
        const bibleResponse = await fetch('/api/bible', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            story,
            characters,
            style
          })
        });

        const bibleData = await bibleResponse.json();

        if (!bibleResponse.ok) {
          throw new Error(
            bibleData.error || 'Failed to build Bible.'
          );
        }

        currentCharacterBible = bibleData.characterBible;
        currentWorldBible = bibleData.worldBible;

        setCharacterBible(currentCharacterBible);
        setWorldBible(currentWorldBible);
      }

      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          story,
          characters,
          style,
          clipDuration,
          characterBible: currentCharacterBible,
          worldBible: currentWorldBible
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to build film plan.'
        );
      }

      setScenes(data.scenes || []);

      if (data.characterBible) {
        setCharacterBible(data.characterBible);
      }

      if (data.worldBible) {
        setWorldBible(data.worldBible);
      }

      setMessage(
        `${data.totalScenes || 6}-scene film plan created successfully.`
      );
    } catch (err) {
      setError(err.message || 'Failed to build film plan.');
    } finally {
      setLoadingScenes(false);
    }
  }

  async function generateScene(scene) {
    if (generatingScene !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Generate Scene ${scene.id} with Runway?\n\n` +
      `This will use Runway credits.\n\n` +
      `Scene duration: ${scene.duration} seconds`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setMessage('');
    setGeneratingScene(scene.id);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: scene.prompt,
          duration: scene.duration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Runway generation failed.'
        );
      }

      const taskId = data.taskId;

      if (!taskId) {
        throw new Error(
          'Runway did not return a task ID.'
        );
      }

      let finished = false;

      while (!finished) {
        await new Promise(resolve =>
          setTimeout(resolve, 5000)
        );

        const statusResponse = await fetch(
          `/api/status?taskId=${encodeURIComponent(taskId)}`
        );

        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusData.error ||
              'Failed to check Runway status.'
          );
        }

        if (
          statusData.state === 'success' ||
          statusData.status === 'SUCCEEDED'
        ) {
          const videoUrl =
            statusData.video_url ||
            statusData.videoUrl;

          if (!videoUrl) {
            throw new Error(
              'Runway completed but no video URL was returned.'
            );
          }

          setSceneVideos(previous => ({
            ...previous,
            [scene.id]: videoUrl
          }));

          setMessage(
            `Scene ${scene.id} finished successfully.`
          );

          finished = true;
        } else if (
          statusData.state === 'fail' ||
          statusData.status === 'FAILED'
        ) {
          throw new Error(
            statusData.failReason ||
              'Runway generation failed.'
          );
        }
      }
    } catch (err) {
      setError(
        err.message ||
          `Failed to generate Scene ${scene.id}.`
      );
    } finally {
      setGeneratingScene(null);
    }
  }

  async function generateAllScenes() {
    if (!scenes.length) {
      setError(
        'Build the film plan before generating scenes.'
      );
      return;
    }

    const totalSeconds = scenes.reduce(
      (total, scene) =>
        total + Number(scene.duration || clipDuration),
      0
    );

    const confirmed = window.confirm(
      `WARNING: This will generate ALL ${scenes.length} scenes with Runway.\n\n` +
      `Total video: ${totalSeconds} seconds.\n\n` +
      `This will use Runway credits for every scene.\n\n` +
      `Continue?`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setMessage('');

    for (const scene of scenes) {
      try {
        setGeneratingScene(scene.id);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: scene.prompt,
            duration: scene.duration
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Runway generation failed.'
          );
        }

        const taskId = data.taskId;

        if (!taskId) {
          throw new Error(
            `Scene ${scene.id} did not return a task ID.`
          );
        }

        let finished = false;

        while (!finished) {
          await new Promise(resolve =>
            setTimeout(resolve, 5000)
          );

          const statusResponse = await fetch(
            `/api/status?taskId=${encodeURIComponent(
              taskId
            )}`
          );

          const statusData =
            await statusResponse.json();

          if (!statusResponse.ok) {
            throw new Error(
              statusData.error ||
                `Failed checking Scene ${scene.id}.`
            );
          }

          if (
            statusData.state === 'success' ||
            statusData.status === 'SUCCEEDED'
          ) {
            const videoUrl =
              statusData.video_url ||
              statusData.videoUrl;

            if (!videoUrl) {
              throw new Error(
                `Scene ${scene.id} completed without a video URL.`
              );
            }

            setSceneVideos(previous => ({
              ...previous,
              [scene.id]: videoUrl
            }));

            finished = true;
          } else if (
            statusData.state === 'fail' ||
            statusData.status === 'FAILED'
          ) {
            throw new Error(
              statusData.failReason ||
                `Scene ${scene.id} failed.`
            );
          }
        }
      } catch (err) {
        setError(
          err.message ||
            `Scene ${scene.id} failed.`
        );
        break;
      }
    }

    setGeneratingScene(null);
    setMessage('Scene generation process finished.');
  }

  function renderCharacterBible() {
    if (!characterBible) {
      return null;
    }

    return (
      <section className="panel">
        <h2>Character Bible</h2>

        <p className="section-description">
          These character rules will keep the cast
          consistent.
        </p>

        {Array.isArray(characterBible.characters) &&
          characterBible.characters.map(character => (
            <div
              key={character.id}
              className="character-card"
            >
              <h3>{character.role}</h3>

              <p>
                {character.description}
              </p>

              {character.appearance && (
                <p>
                  <strong>Appearance:</strong>{' '}
                  {character.appearance}
                </p>
              )}

              {character.clothing && (
                <p>
                  <strong>Clothing:</strong>{' '}
                  {character.clothing}
                </p>
              )}

              {character.personality && (
                <p>
                  <strong>Personality:</strong>{' '}
                  {character.personality}
                </p>
              )}

              {character.continuity && (
                <p>
                  <strong>Continuity:</strong>{' '}
                  {character.continuity}
                </p>
              )}
            </div>
          ))}

        {Array.isArray(
          characterBible.globalCharacterRules
        ) && (
          <div className="rules">
            <h3>Character Continuity Rules</h3>

            <ul>
              {characterBible.globalCharacterRules.map(
                (rule, index) => (
                  <li key={index}>{rule}</li>
                )
              )}
            </ul>
          </div>
        )}
      </section>
    );
  }

  function renderWorldBible() {
    if (!worldBible) {
      return null;
    }

    const environment =
      worldBible.environment || {};

    return (
      <section className="panel">
        <h2>World Bible</h2>

        <p className="section-description">
          These rules keep the film's world
          visually consistent.
        </p>

        <div className="world-details">
          <div className="world-item">
            <h3>LOCATION</h3>
            <p>
              {worldBible.primaryLocation ||
                environment.primaryLocation ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>EVENT</h3>
            <p>
              {worldBible.primaryEvent ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>TIME</h3>
            <p>
              {worldBible.timeOfDay ||
                environment.time ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>WEATHER</h3>
            <p>
              {worldBible.weather ||
                environment.weather ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>LIGHTING</h3>
            <p>
              {environment.lighting ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>ARCHITECTURE</h3>
            <p>
              {environment.architecture ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>INTERIOR DESIGN</h3>
            <p>
              {environment.interiorDesign ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>OUTDOOR ENVIRONMENT</h3>
            <p>
              {environment.outdoorEnvironment ||
                'Not specified'}
            </p>
          </div>

          <div className="world-item">
            <h3>ATMOSPHERE</h3>
            <p>
              {environment.atmosphere ||
                'Not specified'}
            </p>
          </div>
        </div>

        {Array.isArray(
          worldBible.globalWorldRules
        ) && (
          <div className="rules">
            <h3>World Continuity Rules</h3>

            <ul>
              {worldBible.globalWorldRules.map(
                (rule, index) => (
                  <li key={index}>{rule}</li>
                )
              )}
            </ul>
          </div>
        )}
      </section>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#fff',
        padding: '40px 20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        <header
          style={{
            marginBottom: '40px'
          }}
        >
          <h1
            style={{
              fontSize: '42px',
              marginBottom: '8px'
            }}
          >
            GABBOSS.AI FILM
          </h1>

          <p
            style={{
              color: '#aaa',
              fontSize: '18px'
            }}
          >
            AI Film Studio
          </p>

          <p
            style={{
              color: '#777',
              fontSize: '14px'
            }}
          >
            Powered by Runway Gen-4.5
          </p>
        </header>

        <section
          style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '14px',
            padding: '25px',
            marginBottom: '30px'
          }}
        >
          <h2>Create Your Film</h2>

          <label
            style={{
              display: 'block',
              marginTop: '20px',
              marginBottom: '8px'
            }}
          >
            Story
          </label>

          <textarea
            value={story}
            onChange={e =>
              setStory(e.target.value)
            }
            placeholder="Example: A family gathers for Thanksgiving dinner in Nashville..."
            rows={7}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#181818',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />

          <label
            style={{
              display: 'block',
              marginTop: '20px',
              marginBottom: '8px'
            }}
          >
            Characters
          </label>

          <input
            value={characters}
            onChange={e =>
              setCharacters(e.target.value)
            }
            placeholder="Optional: Marcus, Sarah, David..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#181818',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '16px'
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Visual Style
              </label>

              <select
                value={style}
                onChange={e =>
                  setStyle(e.target.value)
                }
                style={{
                  width: '100%',
                  background: '#181818',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '16px'
                }}
              >
                <option value="cinematic">
                  Cinematic
                </option>
                <option value="realistic">
                  Realistic
                </option>
                <option value="anime">
                  Anime
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px'
                }}
              >
                Runway Clip Length
              </label>

              <select
                value={clipDuration}
                onChange={e =>
                  setClipDuration(
                    Number(e.target.value)
                  )
                }
                style={{
                  width: '100%',
                  background: '#181818',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '16px'
                }}
              >
                <option value={5}>
                  5 seconds
                </option>
                <option value={10}>
                  10 seconds
                </option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '25px'
            }}
          >
            <button
              onClick={buildBible}
              disabled={
                loadingBible ||
                !story.trim()
              }
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor:
                  loadingBible ||
                  !story.trim()
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loadingBible
                ? 'BUILDING...'
                : 'BUILD CHARACTER & WORLD BIBLE'}
            </button>

            <button
              onClick={buildFilmPlan}
              disabled={
                loadingScenes ||
                !story.trim()
              }
              style={{
                padding: '14px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor:
                  loadingScenes ||
                  !story.trim()
                    ? 'not-allowed'
                    : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loadingScenes
                ? 'BUILDING...'
                : 'BUILD FILM PLAN'}
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                background: '#132013',
                border: '1px solid #294529',
                color: '#b8e6b8'
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                borderRadius: '8px',
                background: '#241313',
                border: '1px solid #522222',
                color: '#ffb4b4'
              }}
            >
              {error}
            </div>
          )}
        </section>

        {renderCharacterBible()}

        {renderWorldBible()}

        {scenes.length > 0 && (
          <section className="panel">
            <h2>Film Plan</h2>

            <p className="section-description">
              {scenes.length} scenes ×{' '}
              {clipDuration} seconds ={' '}
              {scenes.length * clipDuration}{' '}
              seconds planned.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '25px'
              }}
            >
              <button
                onClick={generateAllScenes}
                disabled={
                  generatingScene !== null
                }
                style={{
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: '1px solid #733',
                  background: '#241010',
                  color: '#fff',
                  cursor:
                    generatingScene !== null
                      ? 'not-allowed'
                      : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                GENERATE ALL SCENES
              </button>
            </div>

            {scenes.map(scene => (
              <div
                key={scene.id}
                style={{
                  background: '#111',
                  border: '1px solid #292929',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '18px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: '15px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <h3
                      style={{
                        marginTop: 0
                      }}
                    >
                      Scene {scene.id}:{' '}
                      {scene.title}
                    </h3>

                    <p
                      style={{
                        color: '#aaa'
                      }}
                    >
                      {scene.purpose}
                    </p>

                    <p
                      style={{
                        color: '#777'
                      }}
                    >
                      Duration:{' '}
                      {scene.duration} seconds
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      generateScene(scene)
                    }
                    disabled={
                      generatingScene !== null
                    }
                    style={{
                      height: 'fit-content',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor:
                        generatingScene !== null
                          ? 'not-allowed'
                          : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {generatingScene ===
                    scene.id
                      ? 'GENERATING...'
                      : `GENERATE SCENE ${scene.id}`}
                  </button>
                </div>

                {sceneVideos[scene.id] && (
                  <div
                    style={{
                      marginTop: '20px'
                    }}
                  >
                    <video
                      src={
                        sceneVideos[scene.id]
                      }
                      controls
                      playsInline
                      style={{
                        width: '100%',
                        maxWidth: '420px',
                        borderRadius: '10px'
                      }}
                    />

                    <p>
                      <a
                        href={
                          sceneVideos[scene.id]
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#fff'
                        }}
                      >
                        Open Scene {scene.id}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
```
