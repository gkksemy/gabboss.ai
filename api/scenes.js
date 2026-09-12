// api/scenes.js
// Creates a 6-scene film plan.
// This endpoint does NOT call Runway and does NOT use Runway credits.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      story,
      characters = '',
      style = 'cinematic',
      clipDuration = 5
    } = req.body || {};

    if (!story || !story.trim()) {
      return res.status(400).json({
        error: 'Please enter a story.'
      });
    }

    const duration = Number(clipDuration) === 10 ? 10 : 5;

    const characterText = characters.trim()
      ? `Main characters: ${characters.trim()}.`
      : 'Create consistent original characters appropriate for the story.';

    const styleText = {
      cinematic: 'cinematic live-action film',
      realistic: 'highly realistic live-action film',
      anime: 'high-quality anime cinematic animation'
    }[style] || 'cinematic live-action film';

    const base = `
${styleText}.
${characterText}
Maintain the same characters, clothing, locations, visual identity, lighting style, and world throughout every scene.
Vertical 9:16 composition.
No subtitles.
No text on screen.
No logos.
No watermark.
Professional filmmaking.
`;

    const scenes = [
      {
        id: 1,
        title: 'Opening',
        purpose: 'Introduce the world, location, atmosphere, and main character.',
        duration,
        prompt: `
${base}
SCENE 1 — OPENING.

${story}

Open with a visually powerful establishing shot.
Introduce the main character naturally.
Show where and when the story takes place.
Build atmosphere and curiosity.
Slow cinematic camera movement.
Strong visual composition.
`
      },

      {
        id: 2,
        title: 'The Setup',
        purpose: 'Establish the character situation and what they want.',
        duration,
        prompt: `
${base}
SCENE 2 — THE SETUP.

Continue directly from Scene 1.

Story:
${story}

Show the main character dealing with the situation introduced in the opening.
Clearly establish their goal, problem, or motivation.
Keep the character appearance and environment consistent.
Use cinematic camera movement and natural acting.
`
      },

      {
        id: 3,
        title: 'Discovery',
        purpose: 'Introduce an important discovery, opportunity, or complication.',
        duration,
        prompt: `
${base}
SCENE 3 — DISCOVERY.

Continue directly from the previous scene.

Story:
${story}

The main character discovers something important that changes the direction of the story.
Make the discovery visually clear.
Increase tension and emotional interest.
Maintain exact character and environment continuity.
`
      },

      {
        id: 4,
        title: 'Conflict',
        purpose: 'Create the main obstacle or confrontation.',
        duration,
        prompt: `
${base}
SCENE 4 — CONFLICT.

Continue directly from Scene 3.

Story:
${story}

Introduce the major conflict or obstacle.
The stakes should become higher.
Show believable reactions from the characters.
Use dynamic cinematic camera movement while maintaining visual continuity.
`
      },

      {
        id: 5,
        title: 'Climax',
        purpose: 'Deliver the most intense and important moment.',
        duration,
        prompt: `
${base}
SCENE 5 — CLIMAX.

Continue directly from the previous scene.

Story:
${story}

Create the most intense moment of the film.
The main character must face the central problem.
Make the scene visually dramatic and emotionally powerful.
Use professional cinematic composition and movement.
`
      },

      {
        id: 6,
        title: 'Ending',
        purpose: 'Resolve the story and provide a satisfying final image.',
        duration,
        prompt: `
${base}
SCENE 6 — ENDING.

Continue directly from Scene 5.

Story:
${story}

Resolve the main conflict.
Show the result of what happened.
End with a memorable cinematic final shot.
The ending should feel complete while leaving room for a possible sequel if appropriate.
`
      }
    ];

    return res.status(200).json({
      success: true,
      totalScenes: scenes.length,
      clipDuration: duration,
      totalDuration: scenes.length * duration,
      scenes
    });

  } catch (error) {
    console.error('SCENES ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Failed to create film plan.'
    });
  }
}
