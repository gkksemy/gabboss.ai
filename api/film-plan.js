// api/film-plan.js
// Creates a detailed Film Plan from the story, Character Bible, and World Bible.
// ZERO Runway credits are used here.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      story,
      duration = 300,
      characterBible,
      worldBible
    } = req.body || {};

    if (!story || !story.trim()) {
      return res.status(400).json({
        error: 'Please enter a story.'
      });
    }

    if (!characterBible || !worldBible) {
      return res.status(400).json({
        error: 'Character Bible and World Bible are required.'
      });
    }

    const videoDuration = Number(duration);

    if (![30, 60, 120, 180, 300, 360].includes(videoDuration)) {
      return res.status(400).json({
        error: 'Unsupported film duration.'
      });
    }

    /*
      For the first structural version we divide the film into
      10-second production blocks.

      Example:
      30 seconds = 3 scenes
      60 seconds = 6 scenes
      300 seconds = 30 scenes
      360 seconds = 36 scenes

      No Runway request is made here.
    */

    const sceneDuration = 10;
    const sceneCount = Math.ceil(videoDuration / sceneDuration);

    const characters =
      characterBible.characters || [];

    const characterNames = characters.map((character) => ({
      id: character.id,
      role: character.role
    }));

    const world = worldBible.environment || {};

    const scenes = [];

    for (let i = 0; i < sceneCount; i++) {
      const sceneNumber = i + 1;
      const startTime = i * sceneDuration;
      const endTime = Math.min(
        startTime + sceneDuration,
        videoDuration
      );

      let phase = 'Development';

      if (sceneNumber === 1) {
        phase = 'Opening';
      } else if (sceneNumber === sceneCount) {
        phase = 'Resolution';
      } else if (sceneNumber <= Math.ceil(sceneCount * 0.25)) {
        phase = 'Setup';
      } else if (sceneNumber <= Math.ceil(sceneCount * 0.6)) {
        phase = 'Development';
      } else if (sceneNumber <= Math.ceil(sceneCount * 0.85)) {
        phase = 'Conflict / Emotional Development';
      }

      let action =
        'Characters naturally interact within the established environment while the story develops.';

      let camera =
        'Cinematic vertical composition with natural camera movement, realistic depth, and professional film framing.';

      let emotion =
        'Natural, believable emotion appropriate to the story.';

      if (sceneNumber === 1) {
        action =
          'Establish the world, location, atmosphere, and main characters as the story begins.';
        camera =
          'Slow cinematic establishing movement that introduces the environment before naturally settling on the characters.';
        emotion =
          'Inviting, grounded, and emotionally engaging opening.';
      } else if (sceneNumber === sceneCount) {
        action =
          'Bring the story toward a satisfying emotional conclusion while maintaining the established characters and environment.';
        camera =
          'Controlled cinematic movement that gradually emphasizes the emotional conclusion.';
        emotion =
          'Emotionally satisfying resolution appropriate to the story.';
      }

      const continuityPrompt = [
        'Use the Character Bible as the permanent character reference.',
        'Use the World Bible as the permanent environment reference.',
        'Keep every recurring character visually identical.',
        'Keep faces, hairstyles, apparent ages, body proportions, clothing, and accessories consistent.',
        'Keep the home, furniture, decorations, architecture, lighting, weather, and environment consistent.',
        'Maintain realistic human movement and natural interactions.',
        'Do not introduce unexplained characters or locations.',
        'Vertical 9:16 composition.',
        'No subtitles.',
        'No text on screen.',
        'No logos.',
        'No watermark.'
      ].join(' ');

      scenes.push({
        sceneNumber,
        startTime,
        endTime,
        duration: endTime - startTime,
        phase,

        location:
          world.primaryLocation ||
          worldBible.primaryLocation ||
          'Established film location',

        setting:
          world.mainSetting ||
          'Established film setting',

        characters: characterNames,

        action,

        dialogue:
          'Dialogue will be generated during the detailed screenplay stage and should remain natural to the characters and situation.',

        camera,

        lighting:
          world.lighting ||
          'Consistent cinematic lighting based on the World Bible.',

        atmosphere:
          world.atmosphere ||
          'Consistent atmosphere based on the World Bible.',

        emotion,

        visualStyle:
          characterBible.visualStyle ||
          'Cinematic live-action film.',

        runwayPrompt:
          `${action} ${camera} ${emotion} ${continuityPrompt}`
      });
    }

    const filmPlan = {
      title: 'Film Plan',

      story: story.trim(),

      duration: videoDuration,

      durationFormatted:
        `${Math.floor(videoDuration / 60)} minutes ${videoDuration % 60} seconds`,

      sceneDuration,

      sceneCount,

      productionFormat: {
        aspectRatio: '9:16',
        sceneLength: `${sceneDuration} seconds`,
        totalScenes: sceneCount,
        generationMethod:
          'Each scene is planned independently and can later be generated as a Runway clip.'
      },

      characterBible,

      worldBible,

      scenes,

      continuityRules: [
        'Character Bible is the permanent character reference.',
        'World Bible is the permanent world reference.',
        'Never redesign a recurring character between scenes.',
        'Never randomly change clothing or accessories.',
        'Never randomly change locations.',
        'Maintain consistent architecture and furniture.',
        'Maintain consistent lighting and weather.',
        'Maintain consistent visual style.',
        'Every scene must connect naturally to the previous scene.',
        'Every generated clip must remain usable for final film stitching.'
      ],

      generationStatus: {
        runwayCalled: false,
        creditsUsed: 0,
        readyForGeneration: true
      }
    };

    return res.status(200).json({
      success: true,
      filmPlan
    });

  } catch (error) {
    console.error('FILM PLAN ERROR:', error);

    return res.status(500).json({
      error:
        error.message ||
        'Failed to create Film Plan.'
    });
  }
}
