import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState('');
  const [duration, setDuration] = useState(5);
  const [style, setStyle] = useState('cinematic');

  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);

  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [scenes, setScenes] = useState([]);
  const [sceneStatus, setSceneStatus] = useState('idle');

  const intervalRef = useRef(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ---------------------------------------------
  // CREATE FILM SCENES
  // ---------------------------------------------

  const createScenes = async () => {
    if (!story.trim()) {
      alert('Enter your story first.');
      return;
    }

    setSceneStatus('generating');
    setScenes([]);
    setErrorMsg('');

    try {
      const response = await fetch('/api/scenes', {
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

      console.log('SCENE PLAN:', data);

      if (!response.ok) {
        throw new Error(
          data.error || 'Unable to create scenes.'
        );
      }

      setScenes(data.scenes || []);
      setSceneStatus('done');

    } catch (error) {
      console.error(error);

      setSceneStatus('fail');
      setErrorMsg(
        error.message ||
        'Unable to create film scenes.'
      );
    }
  };

  // ---------------------------------------------
  // GENERATE ONE RUNWAY CLIP
  // ---------------------------------------------

  const generateScene = async (scene) => {
    stopPolling();

    setStatus('generating');
    setProgress(5);
    setVideoUrl(null);
    setCurrentTaskId(null);
    setErrorMsg('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          prompt: scene.prompt,
          duration
        })
      });

      const data = await response.json();

      console.log(
        'RUNWAY GENERATE:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Runway could not start generation.'
        );
      }

      if (!data.taskId) {
        throw new Error(
          'Runway did not return a task ID.'
        );
      }

      const taskId = data.taskId;

      setCurrentTaskId(taskId);

      localStorage.setItem(
        'lastRunwayTaskId',
        taskId
      );

      setProgress(10);

      // -----------------------------------------
      // POLL RUNWAY
      // -----------------------------------------

      intervalRef.current = setInterval(
        async () => {
          try {
            const response = await fetch(
              `/api/status?taskId=${encodeURIComponent(taskId)}`
            );

            const data =
              await response.json();

            console.log(
              'RUNWAY STATUS:',
              data
            );

            if (!response.ok) {
              throw new Error(
                data.error ||
                'Unable to check Runway status.'
              );
            }

            // DONE
            if (
              data.state === 'success' &&
              data.video_url
            ) {
              stopPolling();

              setVideoUrl(
                data.video_url
              );

              setStatus('done');
              setProgress(100);

              return;
            }

            // FAILED
            if (
              data.state === 'fail'
            ) {
              stopPolling();

              setStatus('fail');

              setErrorMsg(
                data.failReason ||
                'Runway generation failed.'
              );

              return;
            }

            // GENERATING
            if (
              typeof data.progress ===
              'number'
            ) {
              setProgress(
                Math.min(
                  Math.max(
                    data.progress,
                    10
                  ),
                  95
                )
              );
            } else {
              setProgress(prev =>
                Math.min(
                  prev + 3,
                  95
                )
              );
            }

          } catch (error) {
            console.error(
              'Polling error:',
              error
            );

            stopPolling();

            setStatus('fail');

            setErrorMsg(
              error.message
            );
          }
        },
        5000
      );

    } catch (error) {
      console.error(
        'Generation error:',
        error
      );

      stopPolling();

      setStatus('fail');

      setErrorMsg(
        error.message ||
        'Something went wrong.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black">
            GABBOSS.AI FILM
          </h1>

          <p className="text-gray-400 mt-2">
            AI Film Studio
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Powered by Runway Gen-4.5
          </p>

        </div>

        {/* STORY INPUT */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-5">
            Create Your Film
          </h2>

          <label className="block text-sm font-semibold mb-2">
            Story
          </label>

          <textarea
            value={story}
            onChange={e =>
              setStory(e.target.value)
            }
            placeholder="Write your movie idea or story..."
            className="w-full h-36 p-4 bg-black border border-zinc-800 rounded-xl text-white outline-none resize-none"
          />

          <label className="block text-sm font-semibold mt-5 mb-2">
            Characters
          </label>

          <input
            value={characters}
            onChange={e =>
              setCharacters(e.target.value)
            }
            placeholder="Example: Marcus — 30-year-old man, black jacket, white shirt"
            className="w-full p-4 bg-black border border-zinc-800 rounded-xl text-white outline-none"
          />

          <div className="grid md:grid-cols-2 gap-4 mt-5">

            <div>

              <label className="block text-sm font-semibold mb-2">
                Visual Style
              </label>

              <select
                value={style}
                onChange={e =>
                  setStyle(e.target.value)
                }
                className="w-full p-4 bg-black border border-zinc-800 rounded-xl"
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

              <label className="block text-sm font-semibold mb-2">
                Runway Clip Length
              </label>

              <select
                value={duration}
                onChange={e =>
                  setDuration(
                    Number(e.target.value)
                  )
                }
                className="w-full p-4 bg-black border border-zinc-800 rounded-xl"
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

          {/* PLAN BUTTON */}

          <button
            onClick={createScenes}
            disabled={
              sceneStatus === 'generating'
            }
            className="w-full mt-6 py-4 bg-white text-black font-black rounded-xl disabled:opacity-50"
          >

            {sceneStatus === 'generating'
              ? 'BUILDING FILM PLAN...'
              : 'BUILD FILM PLAN'}

          </button>

        </div>

        {/* SCENES */}

        {scenes.length > 0 && (

          <div className="mt-8">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-2xl font-black">
                  Your Film
                </h2>

                <p className="text-gray-500 text-sm">
                  {scenes.length} scenes •{' '}
                  {scenes.length * 5} seconds
                </p>

              </div>

            </div>

            <div className="space-y-4">

              {scenes.map(scene => (

                <div
                  key={scene.sceneNumber}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Scene {scene.sceneNumber}
                      </p>

                      <h3 className="text-xl font-bold mt-1">
                        {scene.title}
                      </h3>

                      <p className="text-gray-400 text-sm mt-2">
                        {scene.purpose}
                      </p>

                    </div>

                    <span className="text-xs bg-zinc-800 px-3 py-2 rounded-lg whitespace-nowrap">
                      {scene.duration}s
                    </span>

                  </div>

                  <details className="mt-4">

                    <summary className="cursor-pointer text-sm text-gray-400">
                      View Runway prompt
                    </summary>

                    <p className="mt-3 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
                      {scene.prompt}
                    </p>

                  </details>

                  {/* GENERATE THIS SCENE */}

                  <button
                    onClick={() =>
                      generateScene(scene)
                    }
                    disabled={
                      status === 'generating'
                    }
                    className="mt-5 w-full py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50"
                  >

                    Generate Scene {scene.sceneNumber}

                  </button>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* GENERATION STATUS */}

        {(status === 'generating' ||
          status === 'done' ||
          status === 'fail') && (

          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Runway Generation
            </h2>

            {status === 'generating' && (

              <>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">

                  <div
                    className="bg-white h-2 rounded-full"
                    style={{
                      width: `${progress}%`
                    }}
                  />

                </div>

                <p className="text-center text-gray-500 text-sm mt-3">
                  Runway is generating Scene...
                  {' '}
                  {progress}%
                </p>
              </>

            )}

            {currentTaskId && (

              <p className="text-xs text-gray-600 break-all mt-4">
                Task ID: {currentTaskId}
              </p>

            )}

            {status === 'fail' && (

              <div className="bg-red-950/30 border border-red-900 rounded-xl p-4">

                <p className="text-red-400 font-bold">
                  Generation failed
                </p>

                <p className="text-red-300 text-sm mt-2 break-words">
                  {errorMsg}
                </p>

              </div>

            )}

            {videoUrl && (

              <div className="mt-5">

                <p className="text-green-400 font-bold mb-3">
                  ✓ Scene generated successfully
                </p>

                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                />

                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center mt-3 bg-zinc-800 py-3 rounded-xl text-sm font-bold"
                >
                  Open Video
                </a>

              </div>

            )}

          </div>

        )}

        {/* FOOTER */}

        <p className="text-center text-gray-600 text-xs mt-10">
          GABBOSS.AI FILM
        </p>

      </div>

    </div>
  );
}
