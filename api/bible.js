// api/bible.js
// Creates a Character Bible and World Bible from the user's story.
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
      style = 'cinematic'
    } = req.body || {};

    if (!story || !story.trim()) {
      return res.status(400).json({
        error: 'Please enter a story.'
      });
    }

    const storyText = story.trim();
    const characterInput = characters.trim();

    const styleDescriptions = {
      cinematic:
        'cinematic live-action, realistic human performances, professional film lighting',
      realistic:
        'highly realistic live-action, natural human appearance and believable environments',
      anime:
        'high-quality cinematic anime animation with detailed characters and environments'
    };

    const visualStyle =
      styleDescriptions[style] ||
      styleDescriptions.cinematic;

    /*
     * The planner intentionally uses the user's story rather than
     * an external AI service. This keeps this step free and reliable.
     */

    let mainCharacter;

    if (characterInput) {
      mainCharacter = characterInput;
    } else {
      mainCharacter =
        'A young adult male protagonist with a natural, believable appearance, short dark hair, expressive brown eyes, athletic build, and simple dark contemporary clothing. Keep his appearance identical in every scene.';
    }

    const characterBible = {
      title: 'Character Bible',

      visualStyle,

      characters: [
        {
          id: 'character_1',
          role: 'Main Character',
          description: mainCharacter,
          continuity:
            'Keep the exact same face, hairstyle, body type, age, clothing, accessories, and overall appearance in every scene.'
        }
      ],

      globalCharacterRules: [
        'Characters must remain visually consistent from scene to scene.',
        'Do not randomly change clothing.',
        'Do not change hairstyle or facial structure.',
        'Do not change apparent age.',
        'Do not introduce unexplained accessories.',
        'Maintain consistent skin tone and body proportions.',
        'Maintain realistic facial expressions and body movement.'
      ]
    };

    const worldBible = {
      title: 'World Bible',

      setting:
        `The story takes place in the world described by this story: ${storyText}`,

      visualStyle,

      environment: {
        location:
          'Use the story to establish the primary location and keep it consistent.',
        time:
          'Maintain a consistent time of day unless the story specifically requires a change.',
        weather:
          'Maintain consistent weather and atmospheric conditions unless the story requires a change.',
        lighting:
          'Use cinematic lighting appropriate to the story while maintaining visual continuity.',
        architecture:
          'Keep buildings, streets, interiors, and major environmental features consistent.',
        atmosphere:
          'Maintain the emotional and visual atmosphere established by the story.'
      },

      globalWorldRules: [
        'Keep the same general location and visual identity throughout the film.',
        'Do not randomly change the city or environment.',
        'Maintain consistent lighting and weather.',
        'Keep recurring locations visually recognizable.',
        'Maintain the same cinematic visual language.',
        'Use vertical 9:16 composition.',
        'No subtitles.',
        'No text on screen.',
        'No logos.',
        'No watermark.'
      ]
    };

    return res.status(200).json({
      success: true,
      characterBible,
      worldBible
    });

  } catch (error) {
    console.error('BIBLE ERROR:', error);

    return res.status(500).json({
      error:
        error.message ||
        'Failed to create Character and World Bible.'
    });
  }
}
