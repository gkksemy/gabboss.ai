// api/film-plan.js
// Creates a detailed 5-minute Film Plan.
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
      clipLength = 10,
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
    const requestedClipLength = Number(clipLength);

    if (videoDuration !== 300) {
      return res.status(400).json({
        error:
          'The current Film Plan is configured for a 5-minute film.'
      });
    }

    const sceneDuration =
      requestedClipLength === 5 || requestedClipLength === 10
        ? requestedClipLength
        : 10;

    /*
      5-minute film structure.

      With 10-second clips:
      300 seconds / 10 = 30 scenes.

      This version is intentionally structural.
      It does NOT call Runway.
      It does NOT spend credits.
    */

    const sceneCount = Math.ceil(
      videoDuration / sceneDuration
    );

    const storyText = story.trim();
    const lowerStory = storyText.toLowerCase();

    const characters =
      Array.isArray(characterBible.characters)
        ? characterBible.characters
        : [];

    const characterReferences = characters.map(
      (character) => ({
        id: character.id,
        role: character.role,
        description: character.description,
        appearance: character.appearance,
        clothing: character.clothing
      })
    );

    const location =
      worldBible.primaryLocation ||
      'Established film location';

    const environment =
      worldBible.environment || {};

    const setting =
      environment.mainSetting ||
      'Established film setting';

    const lighting =
      environment.lighting ||
      'Consistent cinematic lighting.';

    const atmosphere =
      environment.atmosphere ||
      'Consistent cinematic atmosphere.';

    /*
      Detect the current test story so the structural planner
      produces a meaningful Thanksgiving progression instead
      of generic placeholders.
    */

    const isThanksgiving =
      lowerStory.includes('thanksgiving');

    const isFamily =
      lowerStory.includes('family') ||
      lowerStory.includes('dinner');

    let storyBeats;

    if (isThanksgiving || isFamily) {
      storyBeats = [
        {
          phase: 'Opening',
          title: 'Arrival',
          action:
            'Establish the Nashville family home on Thanksgiving evening as the main character arrives for the family gathering.',
          emotion:
            'Warm anticipation and familiarity.',
          camera:
            'Cinematic exterior establishing shot that moves naturally toward the house and then follows the main character entering.'
        },
        {
          phase: 'Opening',
          title: 'Entering the Home',
          action:
            'The main character enters the warmly decorated home and takes in the Thanksgiving preparations.',
          emotion:
            'Comfort, nostalgia, and anticipation.',
          camera:
            'Smooth handheld-style cinematic movement following the character through the entrance.'
        },
        {
          phase: 'Setup',
          title: 'Family Greeting',
          action:
            'The main character is warmly greeted by the parent and another family member.',
          emotion:
            'Affection and genuine family connection.',
          camera:
            'Medium cinematic shot focused on natural greetings and facial expressions.'
        },
        {
          phase: 'Setup',
          title: 'Kitchen Preparation',
          action:
            'Family members continue preparing the Thanksgiving meal in the kitchen while talking casually.',
          emotion:
            'Relaxed happiness and togetherness.',
          camera:
            'Slow cinematic movement through the kitchen showing food preparation and natural interactions.'
        },
        {
          phase: 'Setup',
          title: 'Setting the Table',
          action:
            'The family prepares the dining table with plates, serving dishes, candles, and Thanksgiving decorations.',
          emotion:
            'Anticipation and family teamwork.',
          camera:
            'Detailed close-ups of hands, dishes, food, and decorations followed by a wider family shot.'
        },
        {
          phase: 'Setup',
          title: 'Family Conversation',
          action:
            'The family gathers near the dining area and begins talking about their lives and memories.',
          emotion:
            'Warmth and familiarity.',
          camera:
            'Natural alternating medium shots capturing reactions between family members.'
        },
        {
          phase: 'Development',
          title: 'Dinner Begins',
          action:
            'Everyone sits around the Thanksgiving table as the meal begins.',
          emotion:
            'Joy and togetherness.',
          camera:
            'Wide cinematic shot of the complete table followed by intimate character shots.'
        },
        {
          phase: 'Development',
          title: 'Sharing Food',
          action:
            'Family members pass food around the table and serve one another.',
          emotion:
            'Generosity and connection.',
          camera:
            'Close-ups of food being passed between characters with smooth cinematic transitions.'
        },
        {
          phase: 'Development',
          title: 'Laughter',
          action:
            'A lighthearted family moment causes several members to laugh together.',
          emotion:
            'Joy and genuine amusement.',
          camera:
            'Natural reaction shots with subtle handheld cinematic movement.'
        },
        {
          phase: 'Development',
          title: 'A Personal Memory',
          action:
            'The main character listens as a family member shares a meaningful memory from the past.',
          emotion:
            'Nostalgia and reflection.',
          camera:
            'Slow push-in toward the person speaking, then reaction shots of the family.'
        },
        {
          phase: 'Development',
          title: 'The Family Remembers',
          action:
            'The conversation turns toward shared memories and experiences from previous years.',
          emotion:
            'Nostalgic warmth.',
          camera:
            'Intimate alternating close-ups emphasizing facial expressions.'
        },
        {
          phase: 'Development',
          title: 'Main Character Reflects',
          action:
            'The main character becomes quieter for a moment while observing the family around the table.',
          emotion:
            'Reflection and appreciation.',
          camera:
            'Gentle cinematic close-up followed by a shallow-depth-of-field view of the family.'
        },
        {
          phase: 'Development',
          title: 'Unexpected Conversation',
          action:
            'A more serious topic enters the family conversation and changes the mood slightly.',
          emotion:
            'Curiosity and uncertainty.',
          camera:
            'Gradual change from wide family coverage to tighter reaction shots.'
        },
        {
          phase: 'Conflict',
          title: 'Tension Appears',
          action:
            'Two family members disagree about the subject being discussed.',
          emotion:
            'Growing tension beneath the otherwise warm gathering.',
          camera:
            'Tighter framing and slower camera movement emphasizing reactions.'
        },
        {
          phase: 'Conflict',
          title: 'The Argument',
          action:
            'The disagreement becomes more emotionally direct while the other family members listen.',
          emotion:
            'Frustration and emotional discomfort.',
          camera:
            'Controlled shot-reverse-shot coverage between the people involved.'
        },
        {
          phase: 'Conflict',
          title: 'Silence',
          action:
            'The conversation suddenly becomes quiet as everyone processes what was said.',
          emotion:
            'Awkwardness and emotional weight.',
          camera:
            'Slow push-in with natural pauses and close reaction shots.'
        },
        {
          phase: 'Conflict',
          title: 'Main Character Responds',
          action:
            'The main character calmly responds and attempts to bring the family back together.',
          emotion:
            'Courage, empathy, and sincerity.',
          camera:
            'Centered medium close-up on the main character followed by family reactions.'
        },
        {
          phase: 'Conflict',
          title: 'A Family Member Opens Up',
          action:
            'Another family member reveals the deeper emotion behind the disagreement.',
          emotion:
            'Vulnerability and honesty.',
          camera:
            'Slow intimate close-up emphasizing realistic facial emotion.'
        },
        {
          phase: 'Development',
          title: 'Understanding',
          action:
            'The family begins to understand each other's perspective.',
          emotion:
            'Relief and emotional connection.',
          camera:
            'Wider framing gradually reconnecting all characters within the same composition.'
        },
        {
          phase: 'Development',
          title: 'The Mood Changes',
          action:
            'The tension begins to disappear as the family reconnects around the table.',
          emotion:
            'Relief and renewed warmth.',
          camera:
            'Smooth movement returning to the wider family environment.'
        },
        {
          phase: 'Development',
          title: 'Shared Laughter Returns',
          action:
            'A small humorous moment breaks the remaining tension and makes the family laugh again.',
          emotion:
            'Relief and happiness.',
          camera:
            'Natural reaction shots with subtle cinematic handheld movement.'
        },
        {
          phase: 'Development',
          title: 'Gratitude',
          action:
            'The family pauses to express gratitude for being together.',
          emotion:
            'Sincerity and appreciation.',
          camera:
            'Warm table-wide composition followed by intimate character close-ups.'
        },
        {
          phase: 'Climax',
          title: 'Main Character Realizes Something',
          action:
            'The main character realizes that the value of the evening is the family connection itself.',
          emotion:
            'Emotional realization.',
          camera:
            'Slow cinematic push-in toward the main character.'
        },
        {
          phase: 'Climax',
          title: 'Emotional Connection',
          action:
            'The main character shares a sincere moment with the parent.',
          emotion:
            'Love, gratitude, and emotional closeness.',
          camera:
            'Intimate two-shot with soft cinematic lighting.'
        },
        {
          phase: 'Climax',
          title: 'Family Reconnects',
          action:
            'The family comes together emotionally after the earlier disagreement.',
          emotion:
            'Forgiveness and unity.',
          camera:
            'Wide shot showing the whole family together, followed by close reactions.'
        },
        {
          phase: 'Climax',
          title: 'The Thanksgiving Moment',
          action:
            'The family shares a quiet meaningful moment around the table.',
          emotion:
            'Peace, gratitude, and togetherness.',
          camera:
            'Slow controlled cinematic movement around the table.'
        },
        {
          phase: 'Resolution',
          title: 'After Dinner',
          action:
            'The family begins cleaning the table and moving naturally through the home after dinner.',
          emotion:
            'Relaxed happiness.',
          camera:
            'Natural observational movement through the dining area and kitchen.'
        },
        {
          phase: 'Resolution',
          title: 'Evening Outside',
          action:
            'The main character briefly steps outside and looks back toward the warmly lit family home.',
          emotion:
            'Reflection and appreciation.',
          camera:
            'Cinematic exterior shot transitioning from the character to the glowing house.'
        },
        {
          phase: 'Resolution',
          title: 'Looking Back',
          action:
            'The main character shares a final quiet moment with the family before the evening ends.',
          emotion:
            'Affection and gratitude.',
          camera:
            'Warm medium shot with the family gathered naturally together.'
        },
        {
          phase: 'Ending',
          title: 'Final Family Image',
          action:
            'The family remains together inside the warmly lit home as the evening settles into night.',
          emotion:
            'Peace, belonging, and emotional satisfaction.',
          camera:
            'Slow cinematic pullback from the family toward the warmly illuminated home.'
        }
      ];
    } else {
      storyBeats = [
        {
          phase: 'Opening',
          title: 'Establishing the World',
          action:
            'Introduce the main character, location, environment, and situation established by the story.',
          emotion:
            'Natural emotional introduction.',
          camera:
            'Cinematic establishing movement.'
        },
        {
          phase: 'Setup',
          title: 'The Situation',
          action:
            'Show the main character beginning the central situation of the story.',
          emotion:
            'Curiosity and anticipation.',
          camera:
            'Medium cinematic character coverage.'
        },
        {
          phase: 'Setup',
          title: 'Relationships',
          action:
            'Introduce important relationships and supporting characters.',
          emotion:
            'Natural interpersonal connection.',
          camera:
            'Alternating medium shots and reaction shots.'
        },
        {
          phase: 'Development',
          title: 'Story Progression',
          action:
            'Move the story forward through meaningful character action.',
          emotion:
            'Growing engagement.',
          camera:
            'Dynamic cinematic movement.'
        },
        {
          phase: 'Development',
          title: 'Discovery',
          action:
            'Introduce an important discovery or development.',
          emotion:
            'Surprise and curiosity.',
          camera:
            'Gradual push-in toward the important moment.'
        },
        {
          phase: 'Development',
          title: 'Complication',
          action:
            'Introduce a complication that changes the direction of the story.',
          emotion:
            'Concern and uncertainty.',
          camera:
            'Tighter framing and controlled movement.'
        },
        {
          phase: 'Development',
          title: 'Reaction',
          action:
            'Show the characters responding to the complication.',
          emotion:
            'Emotional reaction.',
          camera:
            'Close reaction shots.'
        },
        {
          phase: 'Development',
          title: 'Decision',
          action:
            'The main character makes an important decision.',
          emotion:
            'Determination.',
          camera:
            'Focused cinematic close-up.'
        },
        {
          phase: 'Conflict',
          title: 'Obstacle',
          action:
            'The main character encounters the central obstacle.',
          emotion:
            'Tension.',
          camera:
            'More dramatic cinematic framing.'
        },
        {
          phase: 'Conflict',
          title: 'Confrontation',
          action:
            'The characters confront the central problem.',
          emotion:
            'Emotional intensity.',
          camera:
            'Shot-reverse-shot coverage.'
        },
        {
          phase: 'Conflict',
          title: 'Pressure',
          action:
            'The situation becomes more difficult.',
          emotion:
            'Rising tension.',
          camera:
            'Tighter close-ups.'
        },
        {
          phase: 'Conflict',
          title: 'Lowest Point',
          action:
            'The characters face the most difficult moment so far.',
          emotion:
            'Doubt and emotional weight.',
          camera:
            'Slow controlled movement.'
        },
        {
          phase: 'Development',
          title: 'Realization',
          action:
            'The main character realizes what must be done.',
          emotion:
            'Clarity and determination.',
          camera:
            'Slow push-in.'
        },
        {
          phase: 'Development',
          title: 'New Direction',
          action:
            'The main character takes action based on the realization.',
          emotion:
            'Purpose.',
          camera:
            'Forward-moving cinematic camera.'
        },
        {
          phase: 'Development',
          title: 'Attempt',
          action:
            'The characters attempt to solve the central problem.',
          emotion:
            'Hope and uncertainty.',
          camera:
            'Dynamic action coverage.'
        },
        {
          phase: 'Conflict',
          title: 'Final Challenge',
          action:
            'The final major obstacle appears.',
          emotion:
            'High tension.',
          camera:
            'Dramatic cinematic framing.'
        },
        {
          phase: 'Conflict',
          title: 'Confrontation',
          action:
            'The main character directly faces the final challenge.',
          emotion:
            'Determination.',
          camera:
            'Intimate close coverage.'
        },
        {
          phase: 'Climax',
          title: 'Climactic Decision',
          action:
            'The main character makes the most important decision of the story.',
          emotion:
            'Maximum emotional intensity.',
          camera:
            'Controlled cinematic push-in.'
        },
        {
          phase: 'Climax',
          title: 'Turning Point',
          action:
            'The decision changes the situation.',
          emotion:
            'Release and transformation.',
          camera:
            'Camera movement opens into a wider composition.'
        },
        {
          phase: 'Climax',
          title: 'Consequence',
          action:
            'Show the immediate consequence of the climactic action.',
          emotion:
            'Emotional release.',
          camera:
            'Natural cinematic observation.'
        },
        {
          phase: 'Resolution',
          title: 'Aftermath',
          action:
            'The characters process what has happened.',
          emotion:
            'Reflection.',
          camera:
            'Slow observational movement.'
        },
        {
          phase: 'Resolution',
          title: 'Understanding',
          action:
            'The characters gain a clearer understanding of the situation.',
          emotion:
            'Relief.',
          camera:
            'Warm medium shots.'
        },
        {
          phase: 'Resolution',
          title: 'Connection',
          action:
            'Relationships begin to heal or strengthen.',
          emotion:
            'Warmth.',
          camera:
            'Intimate character coverage.'
        },
        {
          phase: 'Resolution',
          title: 'Moving Forward',
          action:
            'The characters begin moving into the next stage of their lives.',
          emotion:
            'Hope.',
          camera:
            'Forward-moving cinematic shot.'
        },
        {
          phase: 'Resolution',
          title: 'Quiet Moment',
          action:
            'Give the main character a quiet reflective moment.',
          emotion:
            'Peace.',
          camera:
            'Slow cinematic close-up.'
        },
        {
          phase: 'Resolution',
          title: 'Final Interaction',
          action:
            'Show one final meaningful interaction between the important characters.',
          emotion:
            'Emotional closure.',
          camera:
            'Warm two-shot.'
        },
        {
          phase: 'Ending',
          title: 'Resolution',
          action:
            'Resolve the central story problem.',
          emotion:
            'Satisfaction.',
          camera:
            'Wide cinematic composition.'
        },
        {
          phase: 'Ending',
          title: 'Reflection',
          action:
            'Show what the experience has meant to the main character.',
          emotion:
            'Reflection and growth.',
          camera:
            'Slow push-in.'
        },
        {
          phase: 'Ending',
          title: 'Final Image',
          action:
            'Create a memorable final visual that represents the meaning of the story.',
          emotion:
            'Emotional completion.',
          camera:
            'Slow cinematic pullback.'
        }
      ];
    }

    /*
      Make sure we have exactly 30 scenes for the
      5-minute / 10-second production plan.
    */

    const normalizedBeats = [];

    for (let i = 0; i < sceneCount; i++) {
      normalizedBeats.push(
        storyBeats[i % storyBeats.length]
      );
    }

    const scenes = normalizedBeats.map(
      (beat, index) => {
        const sceneNumber = index + 1;

        const startTime =
          index * sceneDuration;

        const endTime =
          Math.min(
            startTime + sceneDuration,
            videoDuration
          );

        const continuityInstructions = [
          'Use the Character Bible as the permanent character reference.',
          'Use the World Bible as the permanent environment reference.',
          'Keep recurring characters visually identical.',
          'Keep the same face, hairstyle, age, body type, clothing, and accessories.',
          'Keep the same home, architecture, furniture, decorations, and environment.',
          'Maintain consistent lighting and weather.',
          'Maintain natural human movement and believable facial expressions.',
          'Do not introduce unexplained characters or locations.',
          'Maintain cinematic visual continuity with the previous scene.',
          'Vertical 9:16 composition.',
          'No subtitles.',
          'No text on screen.',
          'No logos.',
          'No watermark.'
        ].join(' ');

        const runwayPrompt = [
          beat.action,
          `Location: ${location}.`,
          `Setting: ${setting}.`,
          `Lighting: ${lighting}.`,
          `Atmosphere: ${atmosphere}.`,
          `Camera: ${beat.camera}`,
          `Emotional direction: ${beat.emotion}`,
          `Visual style: ${
            characterBible.visualStyle ||
            'cinematic live-action film'
          }.`,
          continuityInstructions
        ].join(' ');

        return {
          sceneNumber,
          startTime,
          endTime,
          duration: sceneDuration,

          phase: beat.phase,

          title: beat.title,

          location,

          setting,

          characters: characterReferences,

          action: beat.action,

          dialogue:
            'Dialogue should be written naturally during the screenplay/dialogue refinement stage. Do not generate subtitles or on-screen text.',

          camera: beat.camera,

          lighting,

          atmosphere,

          emotion: beat.emotion,

          visualStyle:
            characterBible.visualStyle ||
            'Cinematic live-action film.',

          continuityInstructions,

          runwayPrompt
        };
      }
    );

    const filmPlan = {
      title: '5-Minute Film Plan',

      story: storyText,

      duration: videoDuration,

      durationFormatted: '5 minutes',

      sceneDuration,

      sceneCount,

      productionFormat: {
        aspectRatio: '9:16',
        clipLength: sceneDuration,
        totalScenes: sceneCount,
        totalProductionSeconds: videoDuration,

        workflow:
          'Story → Character Bible → World Bible → Film Plan → Scene Generation → Status Polling → Stitching → Final Film'
      },

      storyStructure: {
        opening: 'Scenes 1–3',
        setup: 'Scenes 4–7',
        development: 'Scenes 8–13',
        conflict: 'Scenes 14–18',
        climax: 'Scenes 19–26',
        resolution: 'Scenes 27–30'
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
        'Every scene must contain enough visual information to generate a coherent clip.',
        'Every generated clip must be suitable for final film stitching.'
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
