// api/scenes.js
// GABBOSS.AI FILM
// Converts a story into 6 structured film scenes.
// This version does NOT call Runway and does NOT spend Runway credits.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const {
    story,
    characters,
    style
  } = req.body || {};

  if (!story || !String(story).trim()) {
    return res.status(400).json({
      error: 'Please enter a story.'
    });
  }

  const cleanStory = String(story).trim();

  const characterInfo = characters
    ? String(characters).trim()
    : 'Main character based on the story';

  const visualStyle = style || 'cinematic';

  /*
   * We intentionally create six scenes here instead of
   * generating videos. This lets us test the film structure
   * before using Runway credits.
   */

  const scenes = [
    {
      sceneNumber: 1,
      title: 'Opening',
      purpose: 'Establish the world, location, atmosphere, and main character.',
      duration: 5,
      prompt: `
${visualStyle} cinematic opening shot.

Story:
${cleanStory}

Characters:
${characterInfo}

Show the world and environment first.
Introduce the main character naturally.
Establish the location, time of day, mood, lighting,
and visual atmosphere.

Professional filmmaking.
Natural human movement.
Cinematic camera movement.
Realistic depth and lighting.
No text.
No subtitles.
No watermark.
      `.trim()
    },

    {
      sceneNumber: 2,
      title: 'The Setup',
      purpose: 'Move the story forward and introduce the main situation.',
      duration: 5,
      prompt: `
${visualStyle} cinematic film scene.

Continue directly from Scene 1.

Story:
${cleanStory}

Characters:
${characterInfo}

Show the main character becoming involved in the central situation.
Maintain the same character appearance, clothing,
location, environment, lighting, and time period.

Natural acting and body movement.
Cinematic camera movement.
Professional film composition.
No text.
No subtitles.
No watermark.
      `.trim()
    },

    {
      sceneNumber: 3,
      title: 'Discovery',
      purpose: 'Reveal important information or create a turning point.',
      duration: 5,
      prompt: `
${visualStyle} cinematic film scene.

Continue directly from the previous scene.

Story:
${cleanStory}

Characters:
${characterInfo}

Create an important discovery, realization,
interaction, or turning point based on the story.

Keep all characters visually consistent.
Keep clothing, location, environment,
lighting, and time period consistent.

Strong facial expressions.
Natural movement.
Professional cinematic composition.
No text.
No subtitles.
No watermark.
      `.trim()
    },

    {
      sceneNumber: 4,
      title: 'Conflict',
      purpose: 'Increase tension and create the main conflict.',
      duration: 5,
      prompt: `
${visualStyle} cinematic film scene.

Continue directly from the previous scene.

Story:
${cleanStory}

Characters:
${characterInfo}

Build the main conflict or tension.
The characters should react naturally to what
has happened in the story.

Maintain character identity and appearance.
Maintain clothing and environment consistency.

Dramatic but believable acting.
Dynamic cinematic camera movement.
Professional lighting.
No text.
No subtitles.
No watermark.
      `.trim()
    },

    {
      sceneNumber: 5,
      title: 'Climax',
      purpose: 'Create the strongest dramatic moment of the story.',
      duration: 5,
      prompt: `
${visualStyle} cinematic climax.

Continue directly from the previous scene.

Story:
${cleanStory}

Characters:
${characterInfo}

Create the strongest dramatic moment in the story.
Show the consequences of the conflict.

Keep character appearance,
clothing, environment, and location consistent.

High production value.
Strong cinematic composition.
Natural movement.
Dynamic camera work.
Dramatic lighting.
No text.
No subtitles.
No watermark.
      `.trim()
    },

    {
      sceneNumber: 6,
      title: 'Ending',
      purpose: 'Resolve the story or create a strong ending/cliffhanger.',
      duration: 5,
      prompt: `
${visualStyle} cinematic ending.

Continue directly from the previous scene.

Story:
${cleanStory}

Characters:
${characterInfo}

Create a satisfying ending or cinematic cliffhanger
based on the story.

Maintain the same characters,
clothing, environment, location,
lighting, and visual style.

End with a memorable cinematic image.

Professional filmmaking.
Natural movement.
Beautiful composition.
No text.
No subtitles.
No watermark.
      `.trim()
    }
  ];

  return res.status(200).json({
    success: true,
    totalScenes: scenes.length,
    totalDuration: scenes.reduce(
      (total, scene) => total + scene.duration,
      0
    ),
    scenes
  });
}
