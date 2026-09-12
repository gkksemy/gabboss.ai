// api/film-plan.js
// Creates a detailed 5-minute Film Plan.
// ZERO Runway credits are used here.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const body =
      req.body && typeof req.body === "object"
        ? req.body
        : {};

    const story =
      typeof body.story === "string"
        ? body.story.trim()
        : "";

    const videoDuration =
      Number(body.duration) || 300;

    const requestedClipLength =
      Number(body.clipLength) || 10;

    const characterBible =
      body.characterBible &&
      typeof body.characterBible === "object"
        ? body.characterBible
        : null;

    const worldBible =
      body.worldBible &&
      typeof body.worldBible === "object"
        ? body.worldBible
        : null;

    if (!story) {
      return res.status(400).json({
        success: false,
        error: "Please enter a story."
      });
    }

    if (!characterBible) {
      return res.status(400).json({
        success: false,
        error: "Character Bible is required."
      });
    }

    if (!worldBible) {
      return res.status(400).json({
        success: false,
        error: "World Bible is required."
      });
    }

    if (videoDuration !== 300) {
      return res.status(400).json({
        success: false,
        error:
          "The current Film Plan is configured for a 5-minute film."
      });
    }

    const sceneDuration =
      requestedClipLength === 5 ||
      requestedClipLength === 10
        ? requestedClipLength
        : 10;

    const sceneCount =
      Math.ceil(videoDuration / sceneDuration);

    const lowerStory = story.toLowerCase();

    const isThanksgiving =
      lowerStory.includes("thanksgiving");

    const isFamily =
      lowerStory.includes("family") ||
      lowerStory.includes("dinner");

    /*
      Safely extract Character Bible data.
    */

    const rawCharacters =
      Array.isArray(characterBible.characters)
        ? characterBible.characters
        : [];

    const characterReferences = rawCharacters.map(
      function (character, index) {
        if (
          !character ||
          typeof character !== "object"
        ) {
          return {
            id: "character-" + (index + 1),
            role: "Character " + (index + 1),
            description: "",
            appearance: "",
            clothing: ""
          };
        }

        return {
          id:
            character.id ||
            "character-" + (index + 1),

          role:
            character.role ||
            "Character " + (index + 1),

          description:
            character.description || "",

          appearance:
            character.appearance || "",

          clothing:
            character.clothing || ""
        };
      }
    );

    /*
      Safely extract World Bible data.

      Different versions of the Bible endpoint may store
      environment information in slightly different places.
    */

    const environment =
      worldBible.environment &&
      typeof worldBible.environment === "object"
        ? worldBible.environment
        : {};

    const location =
      worldBible.primaryLocation ||
      environment.primaryLocation ||
      "Established film location";

    const setting =
      environment.mainSetting ||
      worldBible.mainSetting ||
      "Established film setting";

    const lighting =
      environment.lighting ||
      worldBible.lighting ||
      "Consistent cinematic lighting.";

    const atmosphere =
      environment.atmosphere ||
      worldBible.atmosphere ||
      "Consistent cinematic atmosphere.";

    const visualStyle =
      characterBible.visualStyle ||
      worldBible.visualStyle ||
      "Cinematic live-action film.";

    /*
      STORY BEATS
    */

    let storyBeats = [];

    if (isThanksgiving || isFamily) {
      storyBeats = [
        {
          phase: "Opening",
          title: "Arrival",
          action:
            "Establish the family home as the main character arrives for the gathering.",
          emotion:
            "Warm anticipation and familiarity.",
          camera:
            "Cinematic exterior establishing shot that naturally moves toward the home and follows the main character entering."
        },
        {
          phase: "Opening",
          title: "Entering the Home",
          action:
            "The main character enters the warmly prepared home and takes in the gathering.",
          emotion:
            "Comfort, nostalgia, and anticipation.",
          camera:
            "Smooth cinematic movement following the character through the entrance."
        },
        {
          phase: "Opening",
          title: "Family Greeting",
          action:
            "The main character is warmly greeted by family members.",
          emotion:
            "Affection and genuine family connection.",
          camera:
            "Medium cinematic shots focused on natural greetings and facial expressions."
        },
        {
          phase: "Setup",
          title: "Kitchen Preparation",
          action:
            "Family members continue preparing the meal while talking casually.",
          emotion:
            "Relaxed happiness and togetherness.",
          camera:
            "Slow cinematic movement through the kitchen showing food preparation and natural interactions."
        },
        {
          phase: "Setup",
          title: "Setting the Table",
          action:
            "The family prepares the dining table with plates, serving dishes, candles, and decorations.",
          emotion:
            "Anticipation and family teamwork.",
          camera:
            "Detailed close-ups of hands, dishes, food, and decorations followed by a wider family shot."
        },
        {
          phase: "Setup",
          title: "Family Conversation",
          action:
            "The family gathers near the dining area and begins talking about their lives and memories.",
          emotion:
            "Warmth and familiarity.",
          camera:
            "Natural alternating medium shots capturing reactions between family members."
        },
        {
          phase: "Development",
          title: "Dinner Begins",
          action:
            "Everyone sits around the table as the family meal begins.",
          emotion:
            "Joy and togetherness.",
          camera:
            "Wide cinematic shot of the complete table followed by intimate character shots."
        },
        {
          phase: "Development",
          title: "Sharing Food",
          action:
            "Family members pass food around the table and serve one another.",
          emotion:
            "Generosity and connection.",
          camera:
            "Close-ups of food being passed between characters with smooth cinematic transitions."
        },
        {
          phase: "Development",
          title: "Laughter",
          action:
            "A lighthearted family moment causes several members to laugh together.",
          emotion:
            "Joy and genuine amusement.",
          camera:
            "Natural reaction shots with subtle handheld cinematic movement."
        },
        {
          phase: "Development",
          title: "A Personal Memory",
          action:
            "A family member shares a meaningful memory from the past.",
          emotion:
            "Nostalgia and reflection.",
          camera:
            "Slow push-in toward the person speaking followed by reaction shots."
        },
        {
          phase: "Development",
          title: "The Family Remembers",
          action:
            "The conversation turns toward shared memories and experiences from previous years.",
          emotion:
            "Nostalgic warmth.",
          camera:
            "Intimate alternating close-ups emphasizing facial expressions."
        },
        {
          phase: "Development",
          title: "Main Character Reflects",
          action:
            "The main character becomes quieter while observing the family around the table.",
          emotion:
            "Reflection and appreciation.",
          camera:
            "Gentle cinematic close-up followed by a shallow-depth-of-field view of the family."
        },
        {
          phase: "Development",
          title: "Unexpected Conversation",
          action:
            "A more serious topic enters the family conversation and changes the mood.",
          emotion:
            "Curiosity and uncertainty.",
          camera:
            "Gradual transition from wide family coverage to tighter reaction shots."
        },
        {
          phase: "Conflict",
          title: "Tension Appears",
          action:
            "Two family members begin to disagree about the subject being discussed.",
          emotion:
            "Growing tension.",
          camera:
            "Tighter framing and slower camera movement emphasizing reactions."
        },
        {
          phase: "Conflict",
          title: "The Argument",
          action:
            "The disagreement becomes more emotionally direct while the others listen.",
          emotion:
            "Frustration and emotional discomfort.",
          camera:
            "Controlled shot-reverse-shot coverage."
        },
        {
          phase: "Conflict",
          title: "Silence",
          action:
            "The conversation suddenly becomes quiet as everyone processes what was said.",
          emotion:
            "Awkwardness and emotional weight.",
          camera:
            "Slow push-in with natural pauses and close reaction shots."
        },
        {
          phase: "Conflict",
          title: "Main Character Responds",
          action:
            "The main character calmly responds and attempts to bring the family back together.",
          emotion:
            "Courage, empathy, and sincerity.",
          camera:
            "Centered medium close-up followed by family reactions."
        },
        {
          phase: "Conflict",
          title: "A Family Member Opens Up",
          action:
            "Another family member reveals the deeper emotion behind the disagreement.",
          emotion:
            "Vulnerability and honesty.",
          camera:
            "Slow intimate close-up emphasizing realistic facial emotion."
        },
        {
          phase: "Development",
          title: "Understanding",
          action:
            "The family begins to understand each other's perspective.",
          emotion:
            "Relief and emotional connection.",
          camera:
            "Wider framing gradually reconnecting all characters within the same composition."
        },
        {
          phase: "Development",
          title: "The Mood Changes",
          action:
            "The tension begins to disappear as the family reconnects.",
          emotion:
            "Relief and renewed warmth.",
          camera:
            "Smooth movement returning to the wider family environment."
        },
        {
          phase: "Development",
          title: "Shared Laughter Returns",
          action:
            "A small humorous moment breaks the remaining tension and the family laughs again.",
          emotion:
            "Relief and happiness.",
          camera:
            "Natural reaction shots with subtle cinematic handheld movement."
        },
        {
          phase: "Development",
          title: "Gratitude",
          action:
            "The family pauses to express gratitude for being together.",
          emotion:
            "Sincerity and appreciation.",
          camera:
            "Warm table-wide composition followed by intimate character close-ups."
        },
        {
          phase: "Climax",
          title: "Main Character Realizes Something",
          action:
            "The main character realizes that the value of the evening is the family connection itself.",
          emotion:
            "Emotional realization.",
          camera:
            "Slow cinematic push-in toward the main character."
        },
        {
          phase: "Climax",
          title: "Emotional Connection",
          action:
            "The main character shares a sincere moment with a parent or important family member.",
          emotion:
            "Love, gratitude, and emotional closeness.",
          camera:
            "Intimate two-shot with soft cinematic lighting."
        },
        {
          phase: "Climax",
          title: "Family Reconnects",
          action:
            "The family comes together emotionally after the earlier disagreement.",
          emotion:
            "Forgiveness and unity.",
          camera:
            "Wide shot showing the whole family together followed by close reactions."
        },
        {
          phase: "Climax",
          title: "The Thanksgiving Moment",
          action:
            "The family shares a quiet meaningful moment around the table.",
          emotion:
            "Peace, gratitude, and togetherness.",
          camera:
            "Slow controlled cinematic movement around the table."
        },
        {
          phase: "Resolution",
          title: "After Dinner",
          action:
            "The family begins cleaning the table and naturally moves through the home.",
          emotion:
            "Relaxed happiness.",
          camera:
            "Natural observational movement through the dining area and kitchen."
        },
        {
          phase: "Resolution",
          title: "Evening Outside",
          action:
            "The main character briefly steps outside and looks back toward the warmly lit family home.",
          emotion:
            "Reflection and appreciation.",
          camera:
            "Cinematic exterior shot transitioning from the character to the glowing house."
        },
        {
          phase: "Resolution",
          title: "Looking Back",
          action:
            "The main character shares a final quiet moment with the family before the evening ends.",
          emotion:
            "Affection and gratitude.",
          camera:
            "Warm medium shot with the family gathered naturally together."
        },
        {
          phase: "Ending",
          title: "Final Family Image",
          action:
            "The family remains together inside the warmly lit home as evening settles into night.",
          emotion:
            "Peace, belonging, and emotional satisfaction.",
          camera:
            "Slow cinematic pullback from the family toward the warmly illuminated home."
        }
      ];
    } else {
      /*
        Generic 30-scene structure for stories other than
        the current Thanksgiving/family test.
      */

      storyBeats = [
        ["Opening", "Establishing the World", "Introduce the main character, location, environment, and central situation.", "Curiosity and anticipation.", "Cinematic establishing movement."],
        ["Opening", "The Situation", "Show the main character beginning the central situation of the story.", "Curiosity.", "Medium cinematic character coverage."],
        ["Opening", "Relationships", "Introduce important relationships and supporting characters.", "Natural interpersonal connection.", "Alternating medium shots and reaction shots."],
        ["Setup", "Story Progression", "Move the story forward through meaningful character action.", "Growing engagement.", "Dynamic cinematic movement."],
        ["Setup", "Discovery", "Introduce an important discovery or development.", "Surprise and curiosity.", "Gradual push-in toward the important moment."],
        ["Setup", "Complication", "Introduce a complication that changes the direction of the story.", "Concern and uncertainty.", "Tighter framing and controlled movement."],
        ["Development", "Reaction", "Show the characters responding to the complication.", "Emotional reaction.", "Close reaction shots."],
        ["Development", "Decision", "The main character makes an important decision.", "Determination.", "Focused cinematic close-up."],
        ["Development", "Obstacle", "The main character encounters the central obstacle.", "Tension.", "More dramatic cinematic framing."],
        ["Development", "Confrontation", "The characters confront the central problem.", "Emotional intensity.", "Shot-reverse-shot coverage."],
        ["Development", "Pressure", "The situation becomes more difficult.", "Rising tension.", "Tighter close-ups."],
        ["Development", "Lowest Point", "The characters face the most difficult moment so far.", "Doubt and emotional weight.", "Slow controlled movement."],
        ["Development", "Realization", "The main character realizes what must be done.", "Clarity and determination.", "Slow push-in."],
        ["Development", "New Direction", "The main character takes action based on the realization.", "Purpose.", "Forward-moving cinematic shot."],
        ["Development", "Attempt", "The characters attempt to solve the central problem.", "Hope and uncertainty.", "Dynamic action coverage."],
        ["Conflict", "Final Challenge", "The final major obstacle appears.", "High tension.", "Dramatic cinematic framing."],
        ["Conflict", "Confrontation", "The main character directly faces the final challenge.", "Determination.", "Intimate close coverage."],
        ["Climax", "Climactic Decision", "The main character makes the most important decision of the story.", "Maximum emotional intensity.", "Controlled cinematic push-in."],
        ["Climax", "Turning Point", "The decision changes the situation.", "Release and transformation.", "Camera opens into a wider composition."],
        ["Climax", "Consequence", "Show the immediate consequence of the climactic action.", "Emotional release.", "Natural cinematic observation."],
        ["Resolution", "Aftermath", "The characters process what has happened.", "Reflection.", "Slow observational movement."],
        ["Resolution", "Understanding", "The characters gain a clearer understanding of the situation.", "Relief.", "Warm medium shots."],
        ["Resolution", "Connection", "Relationships begin to heal or strengthen.", "Warmth.", "Intimate character coverage."],
        ["Resolution", "Moving Forward", "The characters begin moving into the next stage of their lives.", "Hope.", "Forward-moving cinematic shot."],
        ["Resolution", "Quiet Moment", "Give the main character a quiet reflective moment.", "Peace.", "Slow cinematic close-up."],
        ["Resolution", "Final Interaction", "Show one final meaningful interaction between important characters.", "Emotional closure.", "Warm two-shot."],
        ["Ending", "Resolution", "Resolve the central story problem.", "Satisfaction.", "Wide cinematic composition."],
        ["Ending", "Reflection", "Show what the experience has meant to the main character.", "Reflection and growth.", "Slow push-in."],
        ["Ending", "Final Image", "Create a memorable final visual representing the meaning of the story.", "Emotional completion.", "Slow cinematic pullback."]
      ].map(function (item) {
        return {
          phase: item[0],
          title: item[1],
          action: item[2],
          emotion: item[3],
          camera: item[4]
        };
      });
    }

    /*
      Guarantee enough beats for the requested scene count.
    */

    if (!Array.isArray(storyBeats) || storyBeats.length === 0) {
      throw new Error(
        "Unable to create story structure."
      );
    }

    const scenes = [];

    for (let index = 0; index < sceneCount; index++) {
      const beat =
        storyBeats[index % storyBeats.length];

      const sceneNumber = index + 1;

      const startTime =
        index * sceneDuration;

      const endTime =
        Math.min(
          startTime + sceneDuration,
          videoDuration
        );

      const continuityInstructions = [
        "Use the Character Bible as the permanent character reference.",
        "Use the World Bible as the permanent environment reference.",
        "Keep recurring characters visually identical.",
        "Keep the same face, hairstyle, age, body type, clothing, and accessories.",
        "Keep the same home, architecture, furniture, decorations, and environment.",
        "Maintain consistent lighting and weather.",
        "Maintain natural human movement and believable facial expressions.",
        "Do not introduce unexplained characters or locations.",
        "Maintain cinematic visual continuity with the previous scene.",
        "Vertical 9:16 composition.",
        "No subtitles.",
        "No text on screen.",
        "No logos.",
        "No watermark."
      ].join(" ");

      const runwayPrompt = [
        beat.action,
        "Location: " + location + ".",
        "Setting: " + setting + ".",
        "Lighting: " + lighting + ".",
        "Atmosphere: " + atmosphere + ".",
        "Camera: " + beat.camera,
        "Emotional direction: " + beat.emotion,
        "Visual style: " + visualStyle + ".",
        continuityInstructions
      ].join(" ");

      scenes.push({
        sceneNumber: sceneNumber,

        startTime: startTime,

        endTime: endTime,

        duration: sceneDuration,

        phase: beat.phase,

        title: beat.title,

        location: location,

        setting: setting,

        characters: characterReferences,

        action: beat.action,

        dialogue:
          "Dialogue should be written naturally during the screenplay/dialogue refinement stage. Do not generate subtitles or on-screen text.",

        camera: beat.camera,

        lighting: lighting,

        atmosphere: atmosphere,

        emotion: beat.emotion,

        visualStyle: visualStyle,

        continuityInstructions:
          continuityInstructions,

        runwayPrompt: runwayPrompt
      });
    }

    /*
      Build final Film Plan.
    */

    const filmPlan = {
      title: "5-Minute Film Plan",

      story: story,

      duration: 300,

      durationFormatted: "5 minutes",

      sceneDuration: sceneDuration,

      sceneCount: sceneCount,

      productionFormat: {
        aspectRatio: "9:16",

        clipLength: sceneDuration,

        totalScenes: sceneCount,

        totalProductionSeconds: 300,

        workflow:
          "Story → Character Bible → World Bible → Film Plan → Scene Generation → Status Polling → Stitching → Final Film"
      },

      storyStructure: {
        opening:
          sceneCount === 30
            ? "Scenes 1–3"
            : "Opening section",

        setup:
          sceneCount === 30
            ? "Scenes 4–7"
            : "Setup section",

        development:
          sceneCount === 30
            ? "Scenes 8–13"
            : "Development section",

        conflict:
          sceneCount === 30
            ? "Scenes 14–18"
            : "Conflict section",

        climax:
          sceneCount === 30
            ? "Scenes 19–26"
            : "Climax section",

        resolution:
          sceneCount === 30
            ? "Scenes 27–30"
            : "Resolution section"
      },

      characterBible: characterBible,

      worldBible: worldBible,

      scenes: scenes,

      continuityRules: [
        "Character Bible is the permanent character reference.",
        "World Bible is the permanent world reference.",
        "Never redesign a recurring character between scenes.",
        "Never randomly change clothing or accessories.",
        "Never randomly change locations.",
        "Maintain consistent architecture and furniture.",
        "Maintain consistent lighting and weather.",
        "Maintain consistent visual style.",
        "Every scene must connect naturally to the previous scene.",
        "Every scene must contain enough visual information to generate a coherent clip.",
        "Every generated clip must be suitable for final film stitching."
      ],

      generationStatus: {
        runwayCalled: false,

        creditsUsed: 0,

        readyForGeneration: true
      }
    };

    /*
      FINAL RESPONSE
    */

    return res.status(200).json({
      success: true,

      filmPlan: filmPlan
    });

  } catch (error) {
    console.error(
      "FILM PLAN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error &&
        error.message
          ? error.message
          : "Failed to create Film Plan."
    });
  }
}
