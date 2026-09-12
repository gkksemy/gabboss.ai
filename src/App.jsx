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
  const [buildingPlan, setBuildingPlan] = useState(false);

  const [generatedScenes, setGeneratedScenes] = useState({});
  const [activeScene, setActiveScene] = useState(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [allProgress, setAllProgress] = useState(0);

  const [characterBible, setCharacterBible] = useState(null);
  const [worldBible, setWorldBible] = useState(null);
  const [buildingBible, setBuildingBible] = useState(false);

  const intervalRef = useRef(null);

  // --------------------------------------------------
  // BUILD CHARACTER + WORLD BIBLE
  // --------------------------------------------------

  const buildBible = async () => {
    if (!story.trim()) {
      alert('Please enter your story first.');
      return;
    }

    setBuildingBible(true);
    setErrorMsg('');
    setCharacterBible(null);
    setWorldBible(null);

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
        throw new Error(
          data.error ||
          'Failed to create the Character and World Bible.'
        );
      }

      setCharacterBible(data.characterBible);
      setWorldBible(data.worldBible);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setBuildingBible(false);
    }
  };

  // --------------------------------------------------
  // BUILD FILM PLAN
  // --------------------------------------------------

  const buildFilmPlan = async () => {
    if (!story.trim()) {
      alert('Please enter your story first.');
      return;
    }

    setBuildingPlan(true);
    setErrorMsg('');
    setScenes([]);
    setGeneratedScenes({});
    setAllProgress(0);

    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          story,
          characters,
          style,
          clipDuration: duration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to build film plan.'
        );
      }

      setScenes(data.scenes || []);

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setBuildingPlan(false);
    }
  };

  // --------------------------------------------------
  // GENERATE ONE RUNWAY SCENE
  // --------------------------------------------------

  const generateScene = async (scene) => {
    if (!scene) return;

    setActiveScene(scene.id);
    setStatus('generating');
    setProgress(10);
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
          duration: scene.duration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          JSON.stringify(data)
        );
      }

      const taskId = data.taskId;

      if (!taskId) {
        throw new Error(
          'Runway did not return a task ID.'
        );
      }

      setCurrentTaskId(taskId);

      await waitForRunway(taskId, scene.id);

    } catch (error) {
      console.error(error);

      setStatus('fail');
      setErrorMsg(error.message);
      setActiveScene(null);

      throw error;
    }
  };

  // --------------------------------------------------
  // WAIT FOR RUNWAY
  // --------------------------------------------------

  const waitForRunway = (taskId, sceneId) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      intervalRef.current = setInterval(async () => {
        attempts++;

        try {
          const response = await fetch(
            `/api/status?taskId=${encodeURIComponent(taskId)}`
          );

          const data = await response.json();

          console.log('Runway status:', data);

          if (data.state === 'success') {
            clearInterval(intervalRef.current);

            const url =
              data.video_url ||
              data.videoUrl;

            if (!url) {
              reject(
                new Error(
                  'Runway completed but no video URL was returned.'
                )
              );
              return;
            }

            setVideoUrl(url);
            setProgress(100);
            setStatus('done');

            setGeneratedScenes(prev => ({
              ...prev,
              [sceneId]: {
                sceneId,
                videoUrl: url,
                taskId
              }
            }));

            resolve(url);
            return;
          }

          if (data.state === 'fail') {
            clearInterval(intervalRef.current);

            const reason =
              data.failReason ||
              data.error ||
              'Runway generation failed.';

            setStatus('fail');
            setErrorMsg(reason);

            reject(new Error(reason));
            return;
          }

          const reportedProgress =
            typeof data.progress === 'number'
              ? data.progress
              : null;

          if (reportedProgress !== null) {
            setProgress(
              Math.min(
                95,
                Math.max(10, reportedProgress)
              )
            );
          } else {
            setProgress(prev =>
              Math.min(prev + 3, 92)
            );
          }

          if (attempts >= 180) {
            clearInterval(intervalRef.current);

            const timeoutError =
              'Runway is taking longer than expected.';

            setStatus('fail');
            setErrorMsg(timeoutError);

            reject(new Error(timeoutError));
          }

        } catch (error) {
          console.error(
            'Status check error:',
            error
          );

          clearInterval(intervalRef.current);

          setStatus('fail');
          setErrorMsg(error.message);

          reject(error);
        }
      }, 5000);
    });
  };

  // --------------------------------------------------
  // GENERATE ALL SCENES
  // --------------------------------------------------

  const generateAllScenes = async () => {
    if (!scenes.length) {
      alert('Build the film plan first.');
      return;
    }

    if (generatingAll) return;

    const confirmed = window.confirm(
      `This will generate ${scenes.length} Runway clips sequentially.\n\n` +
      `Each clip is ${duration} seconds.\n\n` +
      `Total footage: ${scenes.length * duration} seconds.\n\n` +
      `Runway credits will be used.\n\n` +
      `Continue?`
    );

    if (!confirmed) {
      return;
    }

    setGeneratingAll(true);
    setAllProgress(0);
    setErrorMsg('');

    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];

        setActiveScene(scene.id);

        await generateScene(scene);

        setAllProgress(
          Math.round(
            ((i + 1) / scenes.length) * 100
          )
        );
      }

      setActiveScene(null);
      setStatus('done');

    } catch (error) {
      console.error(
        'Generate all error:',
        error
      );

      setErrorMsg(
        error.message ||
        'One of the scenes failed to generate.'
      );

    } finally {
      setGeneratingAll(false);
    }
  };

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <header className="text-center mb-10">

          <h1 className="text-4xl md:text-5xl font-black">
            GABBOSS.AI FILM
          </h1>

          <p className="text-gray-400 mt-2">
            AI Film Studio
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Powered by Runway Gen-4.5
          </p>

        </header>

        {/* CREATE FILM */}

        <div className="bg-zinc-900 rounded-2xl p-6 space-y-5">

          <h2 className="text-2xl font-bold">
            Create Your Film
          </h2>

          {/* STORY */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Story
            </label>

            <textarea
              value={story}
              onChange={e =>
                setStory(e.target.value)
              }
              placeholder="Tell us the story you want to turn into a film..."
              className="w-full h-32 p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none"
            />

          </div>

          {/* CHARACTERS */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Characters
            </label>

            <input
              value={characters}
              onChange={e =>
                setCharacters(e.target.value)
              }
              placeholder="Example: Marcus, 30-year-old man wearing a black leather jacket"
              className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white outline-none"
            />

          </div>

          {/* STYLE */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Visual Style
            </label>

            <select
              value={style}
              onChange={e =>
                setStyle(e.target.value)
              }
              className="w-full p-4 bg-black border border-zinc-700 rounded-xl text-white"
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

          {/* CLIP LENGTH */}

          <div>

            <label className="block text-sm text-gray-400 mb-2">
              Runway Clip Length
            </label>

            <div className="flex gap-3">

              {[5, 10].map(seconds => (

                <button
                  key={seconds}
                  onClick={() =>
                    setDuration(seconds)
                  }
                  className={
                    `px-5 py-3 rounded-xl font-semibold ${
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

          </div>

          {/* BIBLE BUTTON */}

          <button
            onClick={buildBible}
            disabled={buildingBible}
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl disabled:opacity-50"
          >
            {buildingBible
              ? 'BUILDING CHARACTER & WORLD BIBLE...'
              : 'BUILD CHARACTER & WORLD BIBLE'}
          </button>

          {/* FILM PLAN BUTTON */}

          <button
            onClick={buildFilmPlan}
            disabled={buildingPlan}
            className="w-full py-4 bg-white text-black font-bold rounded-xl disabled:opacity-50"
          >
            {buildingPlan
              ? 'BUILDING FILM PLAN...'
              : 'BUILD FILM PLAN'}
          </button>

        </div>

        {/* ERROR */}

        {errorMsg && (

          <div className="mt-5 bg-red-950 border border-red-800 rounded-xl p-4">

            <p className="text-red-300 font-semibold">
              Error
            </p>

            <p className="text-red-400 text-sm mt-1 break-all">
              {errorMsg}
            </p>

          </div>

        )}

        {/* CHARACTER BIBLE */}

        {characterBible && (

          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold">
              Character Bible
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              These character rules will keep the cast consistent.
            </p>

            <div className="mt-5 space-y-4">

              {characterBible.characters.map(
                character => (

                  <div
                    key={character.id}
                    className="bg-black rounded-xl p-5"
                  >

                    <p className="text-xs text-gray-500 uppercase">
                      {character.role}
                    </p>

                    <p className="text-white font-semibold mt-2">
                      {character.description}
                    </p>

                    <p className="text-gray-400 text-sm mt-3">
                      {character.continuity}
                    </p>

                  </div>

                )
              )}

            </div>

            <div className="mt-5">

              <p className="text-sm font-semibold mb-2">
                Character Continuity Rules
              </p>

              <ul className="text-sm text-gray-400 space-y-1">

                {characterBible.globalCharacterRules.map(
                  (rule, index) => (
                    <li key={index}>
                      • {rule}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>

        )}

        {/* WORLD BIBLE */}

        {worldBible && (

          <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold">
              World Bible
            </h2>

            <p className="text-gray-400 text-sm mt-1">
              These rules keep the film's world visually consistent.
            </p>

            <div className="mt-5 bg-black rounded-xl p-5">

              <p className="text-gray-300 text-sm">
                {worldBible.setting}
              </p>

            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-4">

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  LOCATION
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.location}
                </p>
              </div>

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  TIME
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.time}
                </p>
              </div>

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  WEATHER
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.weather}
                </p>
              </div>

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  LIGHTING
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.lighting}
                </p>
              </div>

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  ARCHITECTURE
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.architecture}
                </p>
              </div>

              <div className="bg-black rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  ATMOSPHERE
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {worldBible.environment.atmosphere}
                </p>
              </div>

            </div>

            <div className="mt-5">

              <p className="text-sm font-semibold mb-2">
                World Continuity Rules
              </p>

              <ul className="text-sm text-gray-400 space-y-1">

                {worldBible.globalWorldRules.map(
                  (rule, index) => (
                    <li key={index}>
                      • {rule}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>

        )}

        {/* FILM PLAN */}

        {scenes.length > 0 && (

          <div className="mt-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

              <div>

                <h2 className="text-2xl font-bold">
                  Your Film
                </h2>

                <p className="text-gray-400 text-sm">
                  {scenes.length} scenes •{' '}
                  {scenes.length * duration} seconds
                </p>

              </div>

              <button
                onClick={generateAllScenes}
                disabled={generatingAll}
                className="px-6 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50"
              >
                {generatingAll
                  ? `GENERATING ${allProgress}%`
                  : 'GENERATE ALL SCENES'}
              </button>

            </div>

            {/* ALL SCENES PROGRESS */}

            {generatingAll && (

              <div className="mb-6">

                <div className="flex justify-between text-sm text-gray-400 mb-2">

                  <span>
                    Generating scenes sequentially
                  </span>

                  <span>
                    {allProgress}%
                  </span>

                </div>

                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">

                  <div
                    className="bg-white h-full transition-all"
                    style={{
                      width: `${allProgress}%`
                    }}
                  />

                </div>

              </div>

            )}

            {/* SCENES */}

            <div className="space-y-5">

              {scenes.map(scene => {

                const generated =
                  generatedScenes[scene.id];

                const isActive =
                  activeScene === scene.id;

                return (

                  <div
                    key={scene.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                      <div>

                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          Scene {scene.id}
                        </p>

                        <h3 className="text-xl font-bold">
                          {scene.title}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1">
                          {scene.purpose}
                        </p>

                      </div>

                      <div className="text-sm text-gray-400">
                        {scene.duration}s
                      </div>

                    </div>

                    <div className="mt-4 bg-black rounded-xl p-4">

                      <p className="text-xs text-gray-500 mb-2">
                        RUNWAY PROMPT
                      </p>

                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {scene.prompt}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        generateScene(scene)
                      }
                      disabled={
                        generatingAll ||
                        isActive
                      }
                      className="mt-4 w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold disabled:opacity-50"
                    >
                      {isActive
                        ? `GENERATING SCENE ${scene.id}...`
                        : generated
                        ? `GENERATE SCENE ${scene.id} AGAIN`
                        : `GENERATE SCENE ${scene.id}`}
                    </button>

                    {generated?.videoUrl && (

                      <div className="mt-4">

                        <p className="text-sm text-green-400 mb-2">
                          Scene {scene.id} completed
                        </p>

                        <video
                          src={generated.videoUrl}
                          controls
                          className="w-full rounded-xl"
                        />

                      </div>

                    )}

                  </div>

                );
              })}

            </div>

          </div>

        )}

        {/* GENERATION STATUS */}

        {status === 'generating' && (

          <div className="mt-8 bg-zinc-900 rounded-xl p-5">

            <div className="flex justify-between text-sm mb-2">

              <span>
                Generating...
              </span>

              <span>
                {progress}%
              </span>

            </div>

            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">

              <div
                className="bg-white h-full transition-all"
                style={{
                  width: `${progress}%`
                }}
              />

            </div>

            {currentTaskId && (

              <p className="text-xs text-gray-600 mt-3 break-all">
                Runway task: {currentTaskId}
              </p>

            )}

          </div>

        )}

        {/* FOOTER */}

        <footer className="text-center text-gray-600 text-sm mt-12 pb-8">
          GABBOSS.AI FILM
        </footer>

      </div>

    </div>
  );
}
