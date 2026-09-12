// api/bible.js
// Creates a detailed Character Bible and World Bible from the user's story.
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
        'cinematic live-action film with realistic human performances, professional lighting, natural environments, detailed production design, and dramatic camera work',

      realistic:
        'highly realistic live-action film with natural human appearance, believable environments, realistic lighting, detailed textures, and professional cinematography',

      anime:
        'high-quality cinematic anime with detailed character designs, expressive animation, cinematic backgrounds, dramatic lighting, and consistent visual design'
    };

    const visualStyle =
      styleDescriptions[style] ||
      styleDescriptions.cinematic;

    const lowerStory = storyText.toLowerCase();

    /*
     * ---------------------------------------------------------
     * LOCATION DETECTION
     * ---------------------------------------------------------
     */

    let location = 'A believable contemporary residential setting';

    const locations = [
      {
        keywords: ['nashville', 'nashville tn', 'nashville tennessee'],
        value: 'Nashville, Tennessee, United States'
      },
      {
        keywords: ['atlanta', 'atlanta ga', 'atlanta georgia'],
        value: 'Atlanta, Georgia, United States'
      },
      {
        keywords: ['new york', 'new york city', 'nyc'],
        value: 'New York City, United States'
      },
      {
        keywords: ['los angeles', 'la california', 'los angeles ca'],
        value: 'Los Angeles, California, United States'
      },
      {
        keywords: ['chicago', 'chicago il', 'chicago illinois'],
        value: 'Chicago, Illinois, United States'
      },
      {
        keywords: ['miami', 'miami fl', 'miami florida'],
        value: 'Miami, Florida, United States'
      },
      {
        keywords: ['houston', 'houston tx', 'houston texas'],
        value: 'Houston, Texas, United States'
      },
      {
        keywords: ['dallas', 'dallas tx', 'dallas texas'],
        value: 'Dallas, Texas, United States'
      },
      {
        keywords: ['memphis', 'memphis tn', 'memphis tennessee'],
        value: 'Memphis, Tennessee, United States'
      },
      {
        keywords: ['knoxville', 'knoxville tn', 'knoxville tennessee'],
        value: 'Knoxville, Tennessee, United States'
      },
      {
        keywords: ['london'],
        value: 'London, England, United Kingdom'
      },
      {
        keywords: ['paris'],
        value: 'Paris, France'
      },
      {
        keywords: ['lagos'],
        value: 'Lagos, Nigeria'
      },
      {
        keywords: ['kinshasa'],
        value: 'Kinshasa, Democratic Republic of the Congo'
      },
      {
        keywords: ['johannesburg'],
        value: 'Johannesburg, South Africa'
      }
    ];

    for (const item of locations) {
      if (item.keywords.some(keyword => lowerStory.includes(keyword))) {
        location = item.value;
        break;
      }
    }

    /*
     * ---------------------------------------------------------
     * EVENT / STORY TYPE DETECTION
     * ---------------------------------------------------------
     */

    let event = 'A personal story unfolding through an important day or event.';

    if (
      lowerStory.includes('thanksgiving') ||
      lowerStory.includes('thanksgiving dinner')
    ) {
      event =
        'A Thanksgiving family dinner bringing relatives together for a warm holiday gathering.';
    } else if (
      lowerStory.includes('birthday') ||
      lowerStory.includes('birthday party')
    ) {
      event =
        'A birthday celebration involving family and friends in a festive social gathering.';
    } else if (
      lowerStory.includes('wedding') ||
      lowerStory.includes('marriage')
    ) {
      event =
        'A wedding celebration involving family, friends, emotional moments, and a formal ceremony.';
    } else if (
      lowerStory.includes('funeral') ||
      lowerStory.includes('memorial')
    ) {
      event =
        'A solemn family gathering connected to a funeral or memorial service.';
    } else if (
      lowerStory.includes('party') ||
      lowerStory.includes('celebration')
    ) {
      event =
        'A social celebration involving multiple people, conversation, movement, and changing emotions.';
    } else if (
      lowerStory.includes('date') ||
      lowerStory.includes('romantic')
    ) {
      event =
        'A personal romantic encounter between characters developing through conversation and shared experiences.';
    } else if (
      lowerStory.includes('school') ||
      lowerStory.includes('classroom')
    ) {
      event =
        'A story unfolding around a school environment and the relationships between the characters.';
    } else if (
      lowerStory.includes('office') ||
      lowerStory.includes('workplace') ||
      lowerStory.includes('job')
    ) {
      event =
        'A workplace story involving professional relationships, responsibilities, and personal conflict.';
    }

    /*
     * ---------------------------------------------------------
     * TIME OF DAY
     * ---------------------------------------------------------
     */

    let timeOfDay = 'Late afternoon transitioning into early evening';

    if (
      lowerStory.includes('morning') ||
      lowerStory.includes('sunrise') ||
      lowerStory.includes('dawn')
    ) {
      timeOfDay = 'Morning with soft natural daylight';
    } else if (
      lowerStory.includes('afternoon')
    ) {
      timeOfDay = 'Afternoon with natural daylight';
    } else if (
      lowerStory.includes('evening') ||
      lowerStory.includes('dinner') ||
      lowerStory.includes('night')
    ) {
      timeOfDay = 'Early evening transitioning into night';
    } else if (
      lowerStory.includes('midnight') ||
      lowerStory.includes('late night')
    ) {
      timeOfDay = 'Late night with limited ambient lighting';
    }

    /*
     * ---------------------------------------------------------
     * WEATHER
     * ---------------------------------------------------------
     */

    let weather =
      'Comfortable seasonal weather with a natural outdoor atmosphere.';

    if (
      lowerStory.includes('rain') ||
      lowerStory.includes('raining') ||
      lowerStory.includes('storm')
    ) {
      weather =
        'Rainy weather with wet surfaces, soft overcast light, and realistic reflections.';
    } else if (
      lowerStory.includes('snow') ||
      lowerStory.includes('snowing')
    ) {
      weather =
        'Cold snowy weather with visible snow, cool ambient light, and winter atmosphere.';
    } else if (
      lowerStory.includes('sunny') ||
      lowerStory.includes('sunshine')
    ) {
      weather =
        'Clear sunny weather with natural daylight and warm outdoor illumination.';
    } else if (
      lowerStory.includes('cloudy') ||
      lowerStory.includes('overcast')
    ) {
      weather =
        'Overcast weather with soft diffused natural lighting.';
    } else if (
      lowerStory.includes('windy') ||
      lowerStory.includes('wind')
    ) {
      weather =
        'Noticeably windy weather with natural movement in trees, clothing, and outdoor elements.';
    }

    /*
     * ---------------------------------------------------------
     * ENVIRONMENT
     * ---------------------------------------------------------
     */

    let environment = {
      primaryLocation:
        `The film takes place in ${location}.`,

      mainSetting:
        'A believable, lived-in environment appropriate to the story.',

      architecture:
        'Realistic contemporary architecture appropriate to the location.',

      interiorDesign:
        'Natural residential or commercial interior design with realistic furniture, materials, decorations, and objects.',

      outdoorEnvironment:
        'Realistic surrounding streets, buildings, landscaping, vehicles, and environmental details appropriate to the location.',

      lighting:
        'Professional cinematic lighting with natural practical light sources and believable shadows.',

      atmosphere:
        'Warm, immersive, emotionally appropriate atmosphere that supports the story.',

      visualContinuity:
        'Recurring locations must remain visually recognizable from scene to scene.'
    };

    /*
     * SPECIAL CASE: THANKSGIVING FAMILY DINNER
     */

    if (
      lowerStory.includes('thanksgiving') ||
      lowerStory.includes('thanksgiving dinner')
    ) {
      environment = {
        primaryLocation:
          'Nashville, Tennessee, United States',

        mainSetting:
          'A warm suburban Nashville family home prepared for Thanksgiving dinner.',

        architecture:
          'Comfortable contemporary American suburban home with a recognizable living room, hallway, kitchen, and dining area.',

        interiorDesign:
          'Warm family-oriented interior with a large wooden dining table, comfortable chairs, family photographs, autumn decorations, candles, dishes, serving plates, and Thanksgiving decorations.',

        outdoorEnvironment:
          'Quiet Nashville residential neighborhood with mature trees, suburban houses, driveway, front yard, and seasonal autumn surroundings.',

        lighting:
          'Warm interior evening lighting from ceiling fixtures, lamps, and practical lights combined with subtle window light.',

        atmosphere:
          'Warm, intimate, family-centered Thanksgiving atmosphere with happiness, conversation, nostalgia, and natural family interactions.',

        visualContinuity:
          'The same home, dining room, furniture, decorations, kitchen, and surrounding neighborhood must remain consistent throughout the film.'
      };
    }

    /*
     * ---------------------------------------------------------
     * CHARACTER BIBLE
     * ---------------------------------------------------------
     */

    let charactersList = [];

    if (characterInput) {
      const suppliedCharacters = characterInput
        .split(/[,;\n]+/)
        .map(item => item.trim())
        .filter(Boolean);

      suppliedCharacters.forEach((character, index) => {
        charactersList.push({
          id: `character_${index + 1}`,
          role:
            index === 0
              ? 'Main Character'
              : 'Supporting Character',
          description: character,
          appearance:
            'Use the description supplied by the filmmaker as the primary visual reference.',
          clothing:
            'Keep clothing consistent unless the story explicitly requires a wardrobe change.',
          personality:
            'Use behavior and personality implied by the story.',
          continuity:
            'Keep the same face, body type, hairstyle, age, clothing, accessories, and visual identity in every scene.'
        });
      });
    } else if (
      lowerStory.includes('family') ||
      lowerStory.includes('thanksgiving') ||
      lowerStory.includes('dinner')
    ) {
      charactersList = [
        {
          id: 'character_1',
          role: 'Main Character',
          description:
            'A young adult family member who serves as the primary viewpoint character for the story. Their exact appearance should remain consistent throughout the film.',
          appearance:
            'Natural, believable appearance appropriate for a contemporary American family setting. Do not change facial structure, hairstyle, age, or body type between scenes.',
          clothing:
            'Smart-casual Thanksgiving clothing appropriate for a family dinner. Keep the same outfit throughout unless the story explicitly requires a change.',
          personality:
            'Warm, observant, emotionally expressive, and naturally engaged with the family.',
          continuity:
            'Exact same face, hairstyle, body type, apparent age, clothing, accessories, and visual identity in every scene.'
        },
        {
          id: 'character_2',
          role: 'Parent',
          description:
            'A middle-aged parent hosting or participating in the family gathering.',
          appearance:
            'Believable middle-aged adult with natural facial features and realistic body proportions. Maintain the exact same appearance throughout.',
          clothing:
            'Comfortable but presentable Thanksgiving dinner clothing. Keep the wardrobe consistent.',
          personality:
            'Warm, caring, social, and emotionally connected to the family.',
          continuity:
            'Exact same face, hairstyle, apparent age, body type, clothing, and accessories in every scene.'
        },
        {
          id: 'character_3',
          role: 'Second Family Member',
          description:
            'An additional adult family member participating naturally in the Thanksgiving gathering.',
          appearance:
            'Natural contemporary appearance with consistent facial structure, hairstyle, age, and body proportions.',
          clothing:
            'Casual Thanksgiving dinner clothing that remains consistent throughout the film.',
          personality:
            'Friendly, conversational, expressive, and naturally involved in the family interaction.',
          continuity:
            'Exact same face, hairstyle, apparent age, body type, clothing, and accessories in every scene.'
        },
        {
          id: 'character_4',
          role: 'Younger Family Member',
          description:
            'A younger family member participating in the Thanksgiving gathering and adding natural family energy to the environment.',
          appearance:
            'Age-appropriate natural appearance with consistent hairstyle, facial structure, and body proportions.',
          clothing:
            'Comfortable casual holiday clothing that remains consistent throughout the film.',
          personality:
            'Energetic, curious, and naturally engaged with the family.',
          continuity:
            'Exact same appearance and wardrobe throughout the film.'
        }
      ];
    } else {
      charactersList = [
        {
          id: 'character_1',
          role: 'Main Character',
          description:
            'A young adult protagonist appropriate to the story.',
          appearance:
            'Natural believable appearance with consistent facial structure, hairstyle, body type, and apparent age.',
          clothing:
            'Clothing appropriate to the story and environment. Keep the outfit consistent unless the story requires a change.',
          personality:
            'Emotionally believable and naturally reactive to events.',
          continuity:
            'Keep the exact same face, hairstyle, age, body type, clothing, and accessories throughout every scene.'
        }
      ];
    }

    /*
     * ---------------------------------------------------------
     * GLOBAL CHARACTER RULES
     * ---------------------------------------------------------
     */

    const globalCharacterRules = [
      'Characters must remain visually identical from scene to scene.',
      'Do not randomly change faces.',
      'Do not randomly change hairstyles.',
      'Do not change apparent age.',
      'Do not change body proportions.',
      'Do not randomly change skin tone.',
      'Do not randomly change clothing.',
      'Do not introduce unexplained accessories.',
      'Keep recurring characters recognizable.',
      'Maintain realistic facial expressions.',
      'Maintain natural body movement.',
      'Maintain consistent relationships between characters.',
      'Characters should behave naturally for the environment and story.'
    ];

    /*
     * ---------------------------------------------------------
     * GLOBAL WORLD RULES
     * ---------------------------------------------------------
     */

    const globalWorldRules = [
      `Primary location: ${location}.`,
      `Primary event: ${event}`,
      `Time of day: ${timeOfDay}.`,
      `Weather: ${weather}`,
      'Keep recurring locations visually identical.',
      'Keep major furniture and environmental objects consistent.',
      'Keep architecture consistent.',
      'Keep lighting style consistent.',
      'Keep weather and seasonal conditions consistent unless the story requires a change.',
      'Maintain the same visual language throughout the film.',
      'Use vertical 9:16 composition.',
      'No subtitles.',
      'No text on screen.',
      'No logos.',
      'No watermark.'
    ];

    const characterBible = {
      title: 'Character Bible',

      purpose:
        'Permanent visual reference for every recurring character in the film.',

      visualStyle,

      characters: charactersList,

      globalCharacterRules
    };

    const worldBible = {
      title: 'World Bible',

      purpose:
        'Permanent visual reference for the locations, environments, lighting, atmosphere, and physical world of the film.',

      storySummary: storyText,

      primaryLocation: location,

      primaryEvent: event,

      timeOfDay,

      weather,

      environment,

      globalWorldRules
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
