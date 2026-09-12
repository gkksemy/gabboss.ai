export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const {
      story,
      duration,
      clipLength,
      characterBible,
      worldBible
    } = req.body || {};

    if (!story || !story.trim()) {
      return res.status(400).json({
        error: 'Story is required.'
      });
    }

    if (!characterBible) {
      return res.status(400).json({
        error: 'Character Bible is required.'
      });
    }

    if (!worldBible) {
      return res.status(400).json({
        error: 'World Bible is required.'
      });
    }

    const filmDuration = Number(duration);

    if (filmDuration !== 300) {
      return res.status(400).json({
        error: 'Film duration must be 300 seconds.'
      });
    }

    const sceneDuration =
      Number(clipLength) === 10 ? 10 : 5;

    const sceneCount = Math.ceil(
      filmDuration / sceneDuration
    );

    const storyLower = story.toLowerCase();

    const isThanksgivingFamilyStory =
      storyLower.includes('thanksgiving') ||
      storyLower.includes('family dinner') ||
      storyLower.includes('family gathering') ||
      storyLower.includes('family reunion');

    const thanksgivingBeats = [
      {
        phase: 'Opening',
        title: 'Arrival',
        location: 'Outside the family home',
        setting: 'Late afternoon, Thanksgiving day, cars arriving and warm lights visible inside',
        action: 'Family members arrive at the home carrying food, gifts, and personal belongings.',
        emotion: 'Warm anticipation'
      },
      {
        phase: 'Opening',
        title: 'Entering the Home',
        location: 'Family home entrance',
        setting: 'Warm interior lighting, coats and bags being placed near the entrance',
        action: 'Family members enter the home and begin settling in.',
        emotion: 'Comfort and familiarity'
      },
      {
        phase: 'Opening',
        title: 'Family Greeting',
        location: 'Living room',
        setting: 'Comfortable family living room filled with warm Thanksgiving decorations',
        action: 'Family members greet one another with hugs, handshakes, smiles, and playful comments.',
        emotion: 'Joy'
      },
      {
        phase: 'Setup',
        title: 'Kitchen Preparation',
        location: 'Family kitchen',
        setting: 'Busy kitchen with Thanksgiving food being prepared',
        action: 'Family members cook, season food, check dishes, and move around the kitchen.',
        emotion: 'Energetic warmth'
      },
      {
        phase: 'Setup',
        title: 'Setting the Table',
        location: 'Dining room',
        setting: 'Thanksgiving table being carefully prepared with plates, glasses, candles, and food',
        action: 'Family members place plates, silverware, drinks, and dishes on the table.',
        emotion: 'Togetherness'
      },
      {
        phase: 'Setup',
        title: 'Family Conversation',
        location: 'Kitchen and dining area',
        setting: 'Family members casually talking while finishing preparations',
        action: 'Several family members talk and laugh about everyday life.',
        emotion: 'Relaxed happiness'
      },
      {
        phase: 'Beginning',
        title: 'Dinner Begins',
        location: 'Dining room',
        setting: 'Full Thanksgiving table surrounded by family members',
        action: 'Everyone sits down and the meal officially begins.',
        emotion: 'Gratitude'
      },
      {
        phase: 'Beginning',
        title: 'Sharing Food',
        location: 'Dining room',
        setting: 'Food being passed around the Thanksgiving table',
        action: 'Family members serve one another turkey, sides, vegetables, bread, and other dishes.',
        emotion: 'Generosity'
      },
      {
        phase: 'Beginning',
        title: 'Laughter',
        location: 'Dining room',
        setting: 'Family enjoying dinner together',
        action: 'Someone tells a funny story and the family bursts into genuine laughter.',
        emotion: 'Joy'
      },
      {
        phase: 'Development',
        title: 'A Personal Memory',
        location: 'Dining room',
        setting: 'Family conversation becomes more personal',
        action: 'One family member shares a meaningful memory from the past.',
        emotion: 'Nostalgia'
      },
      {
        phase: 'Development',
        title: 'The Family Remembers',
        location: 'Dining room',
        setting: 'Family members reflecting on shared memories',
        action: 'Several people add their own memories and stories.',
        emotion: 'Nostalgia and affection'
      },
      {
        phase: 'Development',
        title: 'Main Character Reflects',
        location: 'Dining room',
        setting: 'The main character quietly observing the family',
        action: 'The main character watches the family and becomes thoughtful.',
        emotion: 'Reflection'
      },
      {
        phase: 'Development',
        title: 'Unexpected Conversation',
        location: 'Dining room',
        setting: 'Conversation shifts toward a more serious subject',
        action: 'An unexpected topic changes the tone of the conversation.',
        emotion: 'Uncertainty'
      },
      {
        phase: 'Conflict',
        title: 'Tension Appears',
        location: 'Dining room',
        setting: 'Family members become noticeably quieter',
        action: 'A disagreement begins to develop during the conversation.',
        emotion: 'Tension'
      },
      {
        phase: 'Conflict',
        title: 'The Argument',
        location: 'Dining room',
        setting: 'The Thanksgiving dinner table becomes tense',
        action: 'Two family members openly disagree and emotions rise.',
        emotion: 'Frustration'
      },
      {
        phase: 'Conflict',
        title: 'Silence',
        location: 'Dining room',
        setting: 'Everyone at the table becomes quiet after the argument',
        action: 'The room falls silent as everyone processes what happened.',
        emotion: 'Awkwardness'
      },
      {
        phase: 'Turning Point',
        title: 'Main Character Responds',
        location: 'Dining room',
        setting: 'The main character addresses the situation calmly',
        action: 'The main character speaks honestly and attempts to bring the family together.',
        emotion: 'Courage'
      },
      {
        phase: 'Turning Point',
        title: 'A Family Member Opens Up',
        location: 'Dining room',
        setting: 'Emotional conversation around the table',
        action: 'A family member reveals feelings that have been kept hidden.',
        emotion: 'Vulnerability'
      },
      {
        phase: 'Turning Point',
        title: 'Understanding',
        location: 'Dining room',
        setting: 'Family members begin listening to one another',
        action: 'The family starts understanding the feelings behind the disagreement.',
        emotion: 'Empathy'
      },
      {
        phase: 'Turning Point',
        title: 'The Mood Changes',
        location: 'Dining room',
        setting: 'The tension slowly begins to disappear',
        action: 'Family members relax and begin reconnecting.',
        emotion: 'Relief'
      },
      {
        phase: 'Resolution',
        title: 'Shared Laughter Returns',
        location: 'Dining room',
        setting: 'Family members laughing together again',
        action: 'Someone makes a lighthearted comment and genuine laughter returns.',
        emotion: 'Joy'
      },
      {
        phase: 'Resolution',
        title: 'Gratitude',
        location: 'Dining room',
        setting: 'Family members reflecting on what they have',
        action: 'Family members express gratitude for being together.',
        emotion: 'Gratitude'
      },
      {
        phase: 'Resolution',
        title: 'Main Character Realizes Something',
        location: 'Dining room',
        setting: 'Quiet emotional moment during dinner',
        action: 'The main character realizes the deeper meaning of family and forgiveness.',
        emotion: 'Clarity'
      },
      {
        phase: 'Resolution',
        title: 'Emotional Connection',
        location: 'Dining room',
        setting: 'Family members sharing a sincere emotional moment',
        action: 'The main character connects with another family member on a deeper level.',
        emotion: 'Love'
      },
      {
        phase: 'Resolution',
        title: 'Family Reconnects',
        location: 'Dining room',
        setting: 'The family is comfortable and united again',
        action: 'Family members reconnect through conversation, smiles, and shared memories.',
        emotion: 'Connection'
      },
      {
        phase: 'Resolution',
        title: 'The Thanksgiving Moment',
        location: 'Dining room',
        setting: 'Warm family dinner with candles and soft lighting',
        action: 'The family pauses together to appreciate the moment.',
        emotion: 'Peace'
      },
      {
        phase: 'Closing',
        title: 'After Dinner',
        location: 'Kitchen and dining room',
        setting: 'Dinner is finished and dishes are being cleared',
        action: 'Family members clean up together while continuing to talk and laugh.',
        emotion: 'Contentment'
      },
      {
        phase: 'Closing',
        title: 'Evening Outside',
        location: 'Front porch or backyard',
        setting: 'Cool evening air with warm light coming from the house',
        action: 'Family members spend time outside together after dinner.',
        emotion: 'Peace'
      },
      {
        phase: 'Closing',
        title: 'Looking Back',
        location: 'Outside the family home',
        setting: 'Quiet evening atmosphere',
        action: 'The main character looks back toward the house and reflects on the evening.',
        emotion: 'Reflection'
      },
      {
        phase: 'Closing',
        title: 'Final Family Image',
        location: 'Outside the family home',
        setting: 'Family gathered together beneath warm evening lights',
        action: 'The family shares one final peaceful moment together.',
        emotion: 'Love and gratitude'
      }
    ];

    const genericBeats = [
      {
        phase: 'Opening',
        title: 'Introduction',
        location: 'Primary story location',
        setting: 'Establishing environment',
        action: 'Introduce the main character and establish the situation.',
        emotion: 'Curiosity'
      },
      {
        phase: 'Opening',
        title: 'The World',
        location: 'Primary story location',
        setting: 'Detailed story environment',
        action: 'Show the world surrounding the characters.',
        emotion: 'Interest'
      },
      {
        phase: 'Opening',
        title: 'Daily Life',
        location: 'Story location',
        setting: 'Natural environment',
        action: 'Show the characters interacting naturally with their environment.',
        emotion: 'Calm'
      },
      {
        phase: 'Opening',
        title: 'Important Detail',
        location: 'Story location',
        setting: 'Focused visual moment',
        action: 'Introduce an important object, person, or detail.',
        emotion: 'Curiosity'
      },
      {
        phase: 'Development',
        title: 'First Change',
        location: 'Story location',
        setting: 'Situation begins changing',
        action: 'Something changes and pushes the story forward.',
        emotion: 'Uncertainty'
      },
      {
        phase: 'Development',
        title: 'Reaction',
        location: 'Story location',
        setting: 'Characters responding to the change',
        action: 'The characters react to the developing situation.',
        emotion: 'Concern'
      },
      {
        phase: 'Development',
        title: 'New Information',
        location: 'Story location',
        setting: 'Important discovery',
        action: 'A new piece of information changes the characters understanding.',
        emotion: 'Surprise'
      },
      {
        phase: 'Development',
        title: 'Decision',
        location: 'Story location',
        setting: 'Character facing a choice',
        action: 'The main character makes an important decision.',
        emotion: 'Determination'
      },
      {
        phase: 'Development',
        title: 'Pressure',
        location: 'Story location',
        setting: 'Increasing tension',
        action: 'The situation becomes more difficult.',
        emotion: 'Tension'
      },
      {
        phase: 'Development',
        title: 'Complication',
        location: 'Story location',
        setting: 'Problem becomes more serious',
        action: 'A new complication makes the goal harder to achieve.',
        emotion: 'Frustration'
      },
      {
        phase: 'Conflict',
        title: 'Confrontation',
        location: 'Story location',
        setting: 'Characters face the central conflict',
        action: 'The main character confronts the central problem.',
        emotion: 'Conflict'
      },
      {
        phase: 'Conflict',
        title: 'Escalation',
        location: 'Story location',
        setting: 'High tension',
        action: 'The conflict becomes more intense.',
        emotion: 'Fear'
      },
      {
        phase: 'Conflict',
        title: 'Setback',
        location: 'Story location',
        setting: 'Difficult situation',
        action: 'The main character experiences a significant setback.',
        emotion: 'Disappointment'
      },
      {
        phase: 'Conflict',
        title: 'Lowest Point',
        location: 'Story location',
        setting: 'Emotionally difficult moment',
        action: 'The characters face their most difficult moment.',
        emotion: 'Despair'
      },
      {
        phase: 'Turning Point',
        title: 'Realization',
        location: 'Story location',
        setting: 'Quiet realization',
        action: 'The main character realizes what must be done.',
        emotion: 'Clarity'
      },
      {
        phase: 'Turning Point',
        title: 'New Direction',
        location: 'Story location',
        setting: 'Momentum returns',
        action: 'The main character chooses a new path.',
        emotion: 'Hope'
      },
      {
        phase: 'Turning Point',
        title: 'Action',
        location: 'Story location',
        setting: 'Characters moving forward',
        action: 'The characters begin acting on the new decision.',
        emotion: 'Determination'
      },
      {
        phase: 'Turning Point',
        title: 'Challenge',
        location: 'Story location',
        setting: 'Final major obstacle',
        action: 'The characters face one final major challenge.',
        emotion: 'Tension'
      },
      {
        phase: 'Resolution',
        title: 'Breakthrough',
        location: 'Story location',
        setting: 'Conflict begins resolving',
        action: 'The main character makes progress against the central problem.',
        emotion: 'Relief'
      },
      {
        phase: 'Resolution',
        title: 'Resolution',
        location: 'Story location',
        setting: 'Conflict settling',
        action: 'The central conflict begins to resolve.',
        emotion: 'Relief'
      },
      {
        phase: 'Resolution',
        title: 'Understanding',
        location: 'Story location',
        setting: 'Characters reflecting',
        action: 'The characters understand what the experience has taught them.',
        emotion: 'Wisdom'
      },
      {
        phase: 'Resolution',
        title: 'Connection',
        location: 'Story location',
        setting: 'Emotional connection',
        action: 'The characters reconnect or strengthen their relationship.',
        emotion: 'Warmth'
      },
      {
        phase: 'Resolution',
        title: 'New Beginning',
        location: 'Story location',
        setting: 'Hopeful environment',
        action: 'The characters begin moving into a new chapter.',
        emotion: 'Hope'
      },
      {
        phase: 'Closing',
        title: 'Reflection',
        location: 'Story location',
        setting: 'Quiet reflective moment',
        action: 'The main character reflects on everything that happened.',
        emotion: 'Reflection'
      },
      {
        phase: 'Closing',
        title: 'Aftermath',
        location: 'Story location',
        setting: 'Story world after the conflict',
        action: 'Show the consequences of the story.',
        emotion: 'Peace'
      },
      {
        phase: 'Closing',
        title: 'Meaning',
        location: 'Story location',
        setting: 'Emotionally meaningful visual',
        action: 'Reveal the deeper meaning of the experience.',
        emotion: 'Insight'
      },
      {
        phase: 'Closing',
        title: 'Final Moment',
        location: 'Story location',
        setting: 'Cinematic final image',
        action: 'Create a memorable final story moment.',
        emotion: 'Emotion'
      },
      {
        phase: 'Closing',
        title: 'Final Image',
        location: 'Story location',
        setting: 'Beautiful cinematic closing shot',
        action: 'End on a visually strong image that represents the story.',
        emotion: 'Closure'
      }
    ];

    const beats = isThanksgivingFamilyStory
      ? thanksgivingBeats
      : genericBeats;

    const getAudioPlan = (beat, index) => {
      const title = String(beat.title || '').toLowerCase();
      const phase = String(beat.phase || '').toLowerCase();
      const emotion = beat.emotion || 'natural emotion';

      let dialogue =
        'Natural conversational dialogue only when needed. Keep dialogue short and realistic.';

      let voiceDirection =
        'Natural human voice performance, conversational pacing, emotionally believable delivery.';

      let ambientSound =
        'Natural room tone and environmental ambience matching the location.';

      let soundEffects =
        'Subtle realistic environmental sound effects synchronized with visible actions.';

      let music =
        'Subtle cinematic background music that supports the emotion without overpowering dialogue.';

      let mixNotes =
        'Keep dialogue clear and centered. Ambience and music remain underneath dialogue. Avoid sudden volume changes.';

      if (
        title.includes('arrival') ||
        title.includes('entering') ||
        title.includes('greeting')
      ) {
        dialogue =
          'Short greetings, natural hellos, laughter, and casual family conversation.';
        voiceDirection =
          'Warm, friendly voices with natural overlapping conversation and relaxed delivery.';
        ambientSound =
          'Outdoor neighborhood ambience transitioning into warm interior household ambience.';
        soundEffects =
          'Car doors, footsteps, bags being carried, doors opening, hugs, clothing movement.';
        music =
          'Warm cinematic opening music with a gentle welcoming feeling.';
      }

      if (
        title.includes('kitchen') ||
        title.includes('food') ||
        title.includes('table')
      ) {
        dialogue =
          'Casual preparation-related conversation, short comments, questions, and playful remarks.';
        voiceDirection =
          'Energetic but natural family conversation with occasional laughter.';
        ambientSound =
          'Busy kitchen ambience, dishes, cooking activity, refrigerator and household sounds.';
        soundEffects =
          'Cutlery, plates, serving dishes, cooking utensils, footsteps, food preparation.';
        music =
          'Light warm instrumental music with a comfortable family feeling.';
      }

      if (
        title.includes('laughter') ||
        title.includes('shared laughter') ||
        title.includes('joy')
      ) {
        dialogue =
          'Natural jokes, playful comments, and spontaneous family laughter.';
        voiceDirection =
          'Relaxed conversational delivery followed by authentic laughter.';
        ambientSound =
          'Lively dining-room ambience with several family members interacting.';
        soundEffects =
          'Subtle table movement, glasses, plates, chairs, and natural gestures.';
        music =
          'Warm uplifting cinematic music with a gentle increase in energy.';
      }

      if (
        title.includes('memory') ||
        title.includes('remembers') ||
        title.includes('reflection') ||
        title.includes('realizes') ||
        title.includes('looking back')
      ) {
        dialogue =
          'Thoughtful personal dialogue with short pauses that allow the emotional moment to breathe.';
        voiceDirection =
          'Soft, sincere, reflective delivery with controlled emotion and natural pauses.';
        ambientSound =
          'Quiet environmental ambience with reduced background activity.';
        soundEffects =
          'Very subtle room movement and natural environmental details.';
        music =
          'Soft emotional cinematic score with restrained instrumentation.';
      }

      if (
        phase.includes('conflict') ||
        title.includes('tension') ||
        title.includes('argument') ||
        title.includes('confrontation') ||
        title.includes('escalation')
      ) {
        dialogue =
          'Short emotionally charged dialogue with realistic interruptions and pauses. Avoid theatrical speeches.';
        voiceDirection =
          'Emotionally tense but believable delivery. Voices should remain human and conversational.';
        ambientSound =
          'Reduced room ambience that allows the emotional tension to become more noticeable.';
        soundEffects =
          'Subtle chair movement, table movement, glass placement, footsteps, and natural physical reactions.';
        music =
          'Low restrained cinematic tension music. Avoid overpowering the dialogue.';
        mixNotes =
          'Prioritize dialogue clarity. Lower music during important lines. Preserve realistic pauses and room tone.';
      }

      if (
        title.includes('silence') ||
        title.includes('lowest point')
      ) {
        dialogue =
          'Minimal or no dialogue. Allow silence to communicate the emotional weight of the scene.';
        voiceDirection =
          'If dialogue is present, use very quiet restrained delivery with meaningful pauses.';
        ambientSound =
          'Room tone should become clearly audible during the silence.';
        soundEffects =
          'Very subtle natural movements such as breathing, clothing, chair movement, or distant environmental sounds.';
        music =
          'Minimal emotional score or near-silence followed by a restrained musical texture.';
        mixNotes =
          'Do not fill every moment with music. Preserve intentional silence and natural room tone.';
      }

      if (
        title.includes('opens up') ||
        title.includes('understanding') ||
        title.includes('connection') ||
        title.includes('reconnects')
      ) {
        dialogue =
          'Honest, emotionally open conversation with simple believable language.';
        voiceDirection =
          'Sincere and vulnerable delivery without exaggerated acting.';
        ambientSound =
          'Warm, calm environmental ambience with the surrounding family still subtly present.';
        soundEffects =
          'Very subtle natural movement and physical reactions.';
        music =
          'Warm emotional score that slowly becomes more hopeful.';
        mixNotes =
          'Dialogue remains dominant while music gently supports the emotional transition.';
      }

      if (
        title.includes('gratitude') ||
        title.includes('thanksgiving moment') ||
        title.includes('new beginning') ||
        title.includes('breakthrough')
      ) {
        dialogue =
          'Short sincere statements expressing gratitude, hope, or emotional understanding.';
        voiceDirection =
          'Warm, sincere, emotionally grounded delivery.';
        ambientSound =
          'Peaceful environmental ambience with natural family activity in the background.';
        soundEffects =
          'Soft table sounds, movement, breathing, footsteps, and subtle environmental details.';
        music =
          'Hopeful cinematic music with gentle emotional lift.';
      }

      if (
        title.includes('after dinner') ||
        title.includes('evening outside') ||
        title.includes('aftermath')
      ) {
        dialogue =
          'Relaxed post-event conversation with occasional laughter and quiet personal comments.';
        voiceDirection =
          'Calm, comfortable voices with slower evening pacing.';
        ambientSound =
          'Evening outdoor ambience or quiet household ambience depending on location.';
        soundEffects =
          'Footsteps, doors, dishes, distant neighborhood sounds, wind, and subtle outdoor details.';
        music =
          'Gentle evening cinematic music with a peaceful reflective feeling.';
      }

      if (
        title.includes('final family image') ||
        title.includes('final image') ||
        title.includes('final moment')
      ) {
        dialogue =
          'Little or no dialogue. Let the final image communicate the emotional conclusion.';
        voiceDirection =
          'If narration is used, deliver one short reflective line with calm sincerity.';
        ambientSound =
          'Natural environmental ambience appropriate to the final location.';
        soundEffects =
          'Subtle environmental details only.';
        music =
          'Emotional closing theme that resolves naturally and leaves room for the final image.';
        mixNotes =
          'Gradually reduce dialogue and environmental activity while allowing the closing music to resolve naturally.';
      }

      return {
        dialogue,
        voiceDirection,
        ambientSound,
        soundEffects,
        music,
        mixNotes,
        continuity:
          'Maintain consistent character voices, room tone, environmental ambience, and musical identity with neighboring scenes.',
        emotionTarget: emotion,
        audioReady: true
      };
    };

    const scenes = [];

    for (let i = 0; i < sceneCount; i++) {
      const beat = beats[i % beats.length];

      const startTime = i * sceneDuration;
      const endTime = Math.min(
        startTime + sceneDuration,
        filmDuration
      );

      const audioPlan = getAudioPlan(beat, i);

      const characters =
        characterBible?.characters ||
        characterBible ||
        'Use the established characters from the Character Bible.';

      const visualStyle =
        worldBible?.visualStyle ||
        worldBible?.style ||
        'Cinematic realistic live-action film style.';

      const continuityInstructions =
        'Maintain exact character identity, facial appearance, age, hairstyle, clothing, body proportions, environment, architecture, props, time of day, and visual style established by the Character Bible and World Bible. Preserve continuity with adjacent scenes.';

      const runwayPrompt = [
        'Cinematic realistic live-action film scene.',
        `Scene ${i + 1} of ${sceneCount}.`,
        `Story: ${story}`,
        `Scene title: ${beat.title}.`,
        `Phase: ${beat.phase}.`,
        `Location: ${beat.location}.`,
        `Setting: ${beat.setting}.`,
        `Characters: ${characters}.`,
        `Action: ${beat.action}.`,
        `Emotion: ${beat.emotion}.`,
        `Visual style: ${visualStyle}.`,
        'Natural human movement and realistic facial expressions.',
        'Professional cinematic composition.',
        'Realistic lighting and depth.',
        'Vertical 9:16 composition.',
        'No subtitles.',
        'No captions.',
        'No text overlays.',
        continuityInstructions
      ].join(' ');

      scenes.push({
        sceneNumber: i + 1,
        startTime,
        endTime,
        duration: endTime - startTime,
        phase: beat.phase,
        title: beat.title,
        location: beat.location,
        setting: beat.setting,
        characters,
        action: beat.action,
        dialogue:
          audioPlan.dialogue,
        camera:
          'Cinematic camera movement appropriate to the action. Use controlled motion, natural framing, and professional film composition.',
        lighting:
          'Natural cinematic lighting appropriate to the location, time of day, and emotional tone.',
        atmosphere:
          'Realistic environmental atmosphere consistent with the established world.',
        emotion: beat.emotion,
        visualStyle,
        continuityInstructions,
        runwayPrompt,

        audioPlan
      });
    }

    const filmPlan = {
      title:
        story.trim().length > 60
          ? story.trim().slice(0, 60) + '...'
          : story.trim(),

      story: story.trim(),

      duration: filmDuration,

      durationFormatted: '5 minutes',

      sceneDuration,

      sceneCount,

      productionFormat: {
        type: 'AI cinematic short film',
        aspectRatio: '9:16',
        resolution: '720x1280',
        clipDuration: sceneDuration,
        totalClips: sceneCount
      },

      storyStructure: isThanksgivingFamilyStory
        ? 'Opening → Setup → Development → Conflict → Turning Point → Resolution → Closing'
        : 'Opening → Development → Conflict → Turning Point → Resolution → Closing',

      characterBible,

      worldBible,

      scenes,

      continuityRules: [
        'Keep character identity consistent across every scene.',
        'Keep clothing and physical appearance consistent unless the story explicitly requires a change.',
        'Keep locations and environmental details consistent.',
        'Keep lighting and time-of-day continuity consistent.',
        'Keep props consistent when they reappear.',
        'Maintain cinematic visual quality across all generated clips.',
        'Maintain consistent emotional progression between scenes.',
        'Maintain consistent audio ambience between adjacent scenes.',
        'Maintain consistent voice identity for recurring characters.',
        'Maintain a consistent musical identity across the film.'
      ],

      audioProduction: {
        audioRequired: true,

        audioWorkflow:
          'Scene dialogue/voice → ambient sound → sound effects → music → audio mix → final video stitch',

        dialoguePolicy:
          'Dialogue and voice audio are generated or recorded separately from Runway video generation unless explicitly required by the production workflow.',

        voiceContinuity:
          'Recurring characters must use consistent voice identity, tone, accent, pacing, and emotional characteristics throughout the film.',

        ambientContinuity:
          'Maintain consistent room tone and environmental ambience between adjacent scenes to avoid noticeable audio transitions.',

        soundEffectsPolicy:
          'Use realistic synchronized sound effects for visible actions while avoiding unnecessary or exaggerated sounds.',

        musicContinuity:
          'Maintain a consistent musical identity across the film while allowing intensity and instrumentation to change with the story emotion.',

        mixingPolicy:
          'Dialogue should remain intelligible and dominant. Music and ambience should support the scene without masking speech.',

        finalMix:
          'Balance dialogue, voice, ambience, sound effects, and music into a cohesive cinematic soundtrack before final video delivery.'
      },

      generationStatus: {
        runwayCalled: false,
        creditsUsed: 0,
        readyForGeneration: true,
        audioReady: true,
        audioStatus: 'READY_FOR_AUDIO_GENERATION'
      }
    };

    return res.status(200).json({
      success: true,
      filmPlan
    });

  } catch (error) {
    console.error('FILM PLAN ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Failed to build film plan.'
    });
  }
}
