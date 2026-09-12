// api/scenes.js
// Creates a 6-scene film plan.
// This endpoint does NOT call Runway.
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
      characters = '',
      style = 'cinematic',
      clipDuration = 5,
      characterBible = null,
      worldBible = null
    } = req.body || {};

    if (!story || !story.trim()) {
      return res.status(400).json({
        error: 'Please enter a story.'
      });
    }

    const duration =
      Number(clipDuration) === 10 ? 10 : 5;

    const storyText = story.trim();

    /*
     * ---------------------------------------------------------
     * VISUAL STYLE
     * ---------------------------------------------------------
     */

    const styleText = {
      cinematic:
        'cinematic live-action film',

      realistic:
        'highly realistic live-action film',

      anime:
        'high-quality cinematic anime animation'
    }[style] || 'cinematic live-action film';

    /*
     * ---------------------------------------------------------
     * CHARACTER REFERENCE
     * ---------------------------------------------------------
     */

    let characterReference = '';

    if (characterBible) {
      characterReference = `
================ CHARACTER BIBLE ================

${JSON.stringify(characterBible, null, 2)}

==================================================
`;
    } else if (characters && characters.trim()) {
      characterReference = `
CHARACTER REFERENCE:

${characters.trim()}

Keep these characters visually identical in every scene.
`;
    } else {
      characterReference = `
CHARACTER REFERENCE:

Create believable original characters appropriate to the story.

The same characters must remain visually identical
throughout the entire film.
`;
    }

    /*
     * ---------------------------------------------------------
     * WORLD REFERENCE
     * ---------------------------------------------------------
     */

    let worldReference = '';

    if (worldBible) {
      worldReference = `
================ WORLD BIBLE ====================

${JSON.stringify(worldBible, null, 2)}

==================================================
`;
    } else {
      worldReference = `
WORLD REFERENCE:

Use the story to establish the primary location,
time of day, weather, architecture, lighting,
and atmosphere.

Keep the world visually consistent across every scene.
`;
    }

    /*
     * ---------------------------------------------------------
     * GLOBAL RUNWAY RULES
     * ---------------------------------------------------------
     */

    const base = `
VISUAL STYLE:
${styleText}

FORMAT:
Vertical 9:16.

FILM CONTINUITY:
This is one continuous film.
The scene must visually connect to the previous and following scenes.

CHARACTER CONTINUITY:
Do not change character faces.
Do not change hairstyles.
Do not change apparent ages.
Do not change body types.
Do not randomly change clothing.
Do not randomly introduce accessories.

WORLD CONTINUITY:
Do not randomly change locations.
Do not randomly change architecture.
Do not randomly change furniture.
Do not randomly change lighting.
Do not randomly change weather.
Do not randomly change the time of day.

FILMMAKING:
Professional cinematic composition.
Natural human movement.
Natural facial expressions.
Believable physical motion.
Realistic camera movement.
Detailed production design.
Strong depth and atmosphere.

NEGATIVE RULES:
No subtitles.
No text on screen.
No logos.
No watermark.

${characterReference}

${worldReference}
`;

    /*
     * ---------------------------------------------------------
     * SCENE 1
     * ---------------------------------------------------------
     */

    const scene1 = {
      id: 1,
      title: 'Opening',
      purpose:
        'Introduce the world, location, atmosphere, and main character.',
      duration,

      prompt: `
${base}

SCENE 1 — OPENING

STORY:
${storyText}

Begin with a strong cinematic establishing shot.

Clearly establish the physical world of the story.

Introduce the main character naturally.

Show the location, atmosphere, lighting, architecture,
and important environmental details.

The viewer should immediately understand where
the story is taking place.

Use slow, controlled cinematic camera movement.

End the scene in a visual position that can naturally
lead into Scene 2.
`
    };

    /*
     * ---------------------------------------------------------
     * SCENE 2
     * ---------------------------------------------------------
     */

    const scene2 = {
      id: 2,
      title: 'The Setup',
      purpose:
        'Establish the character situation, relationships, and motivation.',
      duration,

      prompt: `
${base}

SCENE 2 — THE SETUP

CONTINUITY:
Continue directly from Scene 1.

STORY:
${storyText}

Focus on the main character and the situation
introduced in the opening.

Show important relationships between the characters.

Establish what the main character wants,
needs, or is dealing with.

Use natural dialogue-like expressions and body language
even if no audible dialogue is present.

Keep every character and location visually identical
to the Character Bible and World Bible.

Build curiosity for what happens next.
`
    };

    /*
     * ---------------------------------------------------------
     * SCENE 3
     * ---------------------------------------------------------
     */

    const scene3 = {
      id: 3,
      title: 'Discovery',
      purpose:
        'Introduce an important discovery, opportunity, or complication.',
      duration,

      prompt: `
${base}

SCENE 3 — DISCOVERY

CONTINUITY:
Continue directly from Scene 2.

STORY:
${storyText}

Something important happens.

The main character discovers,
realizes, notices, receives, or encounters
something that changes the direction of the story.

Make the discovery visually understandable.

Increase emotional interest.

Use close-ups, reaction shots, and cinematic camera movement
where appropriate.

Keep the exact same character appearances,
clothing, location, lighting, and environment.
`
    };

    /*
     * ---------------------------------------------------------
     * SCENE 4
     * ---------------------------------------------------------
     */

    const scene4 = {
      id: 4,
      title: 'Conflict',
      purpose:
        'Introduce the major obstacle, confrontation, or emotional conflict.',
      duration,

      prompt: `
${base}

SCENE 4 — CONFLICT

CONTINUITY:
Continue directly from Scene 3.

STORY:
${storyText}

The central conflict becomes clear.

Introduce the major obstacle,
disagreement, confrontation, danger,
or emotional pressure appropriate to the story.

Raise the stakes.

Show believable reactions from the characters.

Use more dynamic cinematic camera movement
while preserving visual continuity.

The characters must still look exactly the same
as established in the Character Bible.
`
    };

    /*
     * ---------------------------------------------------------
     * SCENE 5
     * ---------------------------------------------------------
     */

    const scene5 = {
      id: 5,
      title: 'Climax',
      purpose:
        'Deliver the most important and emotionally intense moment.',
      duration,

      prompt: `
${base}

SCENE 5 — CLIMAX

CONTINUITY:
Continue directly from Scene 4.

STORY:
${storyText}

Create the most important moment of the film.

The main character must directly face
the central problem or emotional conflict.

Make the moment visually dramatic
and emotionally powerful.

Use professional cinematic composition,
controlled camera movement,
strong facial expressions,
and detailed environmental reactions.

Maintain absolute continuity with all previous scenes.
`
    };

    /*
     * ---------------------------------------------------------
     * SCENE 6
     * ---------------------------------------------------------
     */

    const scene6 = {
      id: 6,
      title: 'Ending',
      purpose:
        'Resolve the story and provide a memorable final image.',
      duration,

      prompt: `
${base}

SCENE 6 — ENDING

CONTINUITY:
Continue directly from Scene 5.

STORY:
${storyText}

Resolve the main conflict.

Show the consequences of what happened.

Give the main character an emotionally satisfying
reaction or outcome.

Finish with a memorable cinematic final shot.

The final image should feel like the ending
of a professional short film.

Leave room for a possible continuation or sequel
only if it naturally fits the story.

Maintain exact visual continuity until the final frame.
`
    };

    const scenes = [
      scene1,
      scene2,
      scene3,
      scene4,
      scene5,
      scene6
    ];

    return res.status(200).json({
      success: true,
      totalScenes: scenes.length,
      clipDuration: duration,
      totalDuration: scenes.length * duration,
      characterBible,
      worldBible,
      scenes
    });

  } catch (error) {
    console.error('SCENES ERROR:', error);

    return res.status(500).json({
      error:
        error.message ||
        'Failed to create film plan.'
    });
  }
}
