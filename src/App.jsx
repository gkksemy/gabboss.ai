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

  const intervalRef = useRef(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const generateReal = async () => {
    if (!story.trim()) {
      alert('Enter your story or scene idea first.');
      return;
    }

    stopPolling();

    setStatus('generating');
    setProgress(5);
    setVideoUrl(null);
    setCurrentTaskId(null);
    setErrorMsg('');

    try {
      const fullPrompt = `
${style} cinematic film scene.

Story:
${story.trim()}

${characters.trim()
  ? `Characters:
${characters.trim()}`
  : ''
}

Professional cinematic composition.
Natural realistic movement.
Consistent characters and environment.
Detailed lighting.
High production value.
Smooth camera movement.
No subtitles.
No text on screen.
No watermark.
      `.trim();

      console.log('Sending prompt to Runway:', fullPrompt);

      // ----------------------------------
      // CREATE RUNWAY TASK
      // ----------------------------------

      const response = await fetch('/api/generate', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          prompt: fullPrompt,
          duration
        })
      });

      const data = await response.json();

      console.log('Generate response:', data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Runway could not start the video'
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

      console.log(
        'Runway task created:',
        taskId
      );

      // ----------------------------------
      // POLL RUNWAY
      // ----------------------------------

      intervalRef.current = setInterval(
        async () => {
          try {
            const statusResponse = await fetch(
              `/api/status?taskId=${encodeURIComponent(taskId)}`
            );

            const statusData =
              await statusResponse.json();

            console.log(
              'Runway status:',
              statusData
            );

            if (!statusResponse.ok) {
              throw new Error(
                statusData.error ||
                'Unable to check Runway status'
              );
            }

            // -----------------------------
            // VIDEO COMPLETE
            // -----------------------------

            if (
              statusData.state === 'success' &&
              statusData.video_url
            ) {
              stopPolling();

              setVideoUrl(
                statusData.video_url
              );

              setStatus('done');
              setProgress(100);

              console.log(
                'VIDEO READY:',
                statusData.video_url
              );

              return;
            }

            // -----------------------------
            // VIDEO FAILED
            // -----------------------------

            if (
              statusData.state === 'fail'
            ) {
              stopPolling();

              setStatus('fail');

              setErrorMsg(
                statusData.failReason ||
                'Runway video generation failed.'
              );

              return;
            }

            // -----------------------------
            // STILL GENERATING
            // -----------------------------

            if (
              typeof statusData.progress ===
              'number'
            ) {
              setProgress(
                Math.min(
                  Math.max(
                    statusData.progress,
                    10
                  ),
                  95
                )
              );
            } else {
              setProgress(prev =>
                Math.min(prev + 3, 95)
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
              error.message ||
              'Could not check generation status.'
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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">

      <div className="w-full max-w-3xl">

        {/* HEADER */}

        <div className="text-center mb-8">

          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            GABBOSS.AI FILM
          </h1>

          <p className="text-gray-400 mt-2">
            AI Film Studio
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Powered by Runway Gen-4.5
          </p>

        </div>

        {/* MAIN CARD */}

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-5">

          {/* STORY */}

          <div>

            <label className="block text-sm font-semibold mb-2">
              Story / Scene
            </label>

            <textarea
              value={story}
              onChange={e =>
                setStory(e.target.value)
              }
              placeholder="Example: A young African filmmaker walks through downtown Nashville at night after a long day at work. He receives a mysterious phone call that changes everything..."
              className="w-full p-4 bg-black border border-zinc-800 rounded-xl h-32 outline-none focus:border-white resize-none"
            />

          </div>

          {/* CHARACTERS */}

          <div>

            <label className="block text-sm font-semibold mb-2">
              Characters
            </label>

            <input
              value={characters}
              onChange={e =>
                setCharacters(e.target.value)
              }
              placeholder="Example: Marcus — 30-year-old man, black jacket, white shirt"
              className="w-full p-4 bg-black border border-zinc-800 rounded-xl outline-none focus:border-white"
            />

          </div>

          {/* DURATION */}

          <div>

            <label className="block text-sm font-semibold mb-2">
              Clip Length
            </label>

            <div className="flex gap-3">

              {[5, 10].map(seconds => (

                <button
                  key={seconds}
                  type="button"
                  onClick={() =>
                    setDuration(seconds)
                  }
                  className={
                    `px-6 py-3 rounded-xl font-bold transition ${
                      duration === seconds
                        ? 'bg-white text-black'
                        : 'bg-zinc-800 text-white'
                    }`
                  }
                >
                  {seconds} seconds
                </button>

              ))}

            </div>

            <p className="text-xs text-gray-500 mt-2">
              Runway Gen-4.5 generates individual clips.
              Longer films will be assembled from multiple clips.
            </p>

          </div>

          {/* STYLE */}

          <div>

            <label className="block text-sm font-semibold mb-2">
              Visual Style
            </label>

            <select
              value={style}
              onChange={e =>
                setStyle(e.target.value)
              }
              className="w-full p-4 bg-black border border-zinc-800 rounded-xl outline-none"
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

          {/* GENERATE */}

          <button
            onClick={generateReal}
            disabled={status === 'generating'}
            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'generating'
              ? `GENERATING ${progress}%`
              : 'GENERATE FILM CLIP'}
          </button>

          {/* PROGRESS */}

          {status === 'generating' && (

            <div className="space-y-2">

              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">

                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`
                  }}
                />

              </div>

              <p className="text-center text-xs text-gray-500">
                Runway is generating your video...
              </p>

            </div>

          )}

          {/* TASK ID */}

          {currentTaskId && (

            <div className="bg-black border border-zinc-800 rounded-xl p-3">

              <p className="text-xs text-gray-500 mb-1">
                Runway Task ID
              </p>

              <p className="text-xs text-gray-300 break-all">
                {currentTaskId}
              </p>

            </div>

          )}

          {/* ERROR */}

          {errorMsg && (

            <div className="bg-red-950/30 border border-red-900 rounded-xl p-4">

              <p className="text-red-400 text-sm font-semibold">
                Generation failed
              </p>

              <p className="text-red-300 text-sm mt-1 break-words">
                {errorMsg}
              </p>

            </div>

          )}

          {/* VIDEO */}

          {videoUrl && (

            <div className="space-y-3">

              <p className="text-green-400 font-bold">
                ✓ Video ready
              </p>

              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full rounded-xl border border-zinc-800"
              />

              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-semibold"
              >
                Open Video
              </a>

            </div>

          )}

        </div>

        {/* FOOTER */}

        <p className="text-center text-xs text-gray-600 mt-6">
          GABBOSS.AI FILM — AI-powered filmmaking
        </p>

      </div>

    </div>
  );
}
