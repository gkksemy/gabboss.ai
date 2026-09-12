// api/generation-queue.js
// Builds a zero-credit video generation queue from a Film Plan.
// IMPORTANT: This endpoint does NOT call Runway.

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

    const filmPlan =
      body.filmPlan &&
      typeof body.filmPlan === "object"
        ? body.filmPlan
        : null;

    if (!filmPlan) {
      return res.status(400).json({
        success: false,
        error: "Film Plan is required."
      });
    }

    const scenes =
      Array.isArray(filmPlan.scenes)
        ? filmPlan.scenes
        : [];

    if (scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Film Plan contains no scenes."
      });
    }

    const duration =
      Number(filmPlan.duration) || 300;

    const sceneDuration =
      Number(filmPlan.sceneDuration) || 10;

    const characterBible =
      filmPlan.characterBible || {};

    const worldBible =
      filmPlan.worldBible || {};

    /*
      Create one production job for every scene.
      These jobs are WAITING only.
      No video-generation API is called.
    */

    const jobs = scenes.map(function (scene, index) {
      const sceneNumber =
        Number(scene.sceneNumber) ||
        index + 1;

      return {
        jobId:
          "film-scene-" +
          String(sceneNumber).padStart(3, "0"),

        sceneNumber: sceneNumber,

        status: "WAITING",

        startTime:
          Number(scene.startTime) ||
          index * sceneDuration,

        endTime:
          Number(scene.endTime) ||
          Math.min(
            (index + 1) * sceneDuration,
            duration
          ),

        duration:
          Number(scene.duration) ||
          sceneDuration,

        phase:
          scene.phase || "Scene",

        title:
          scene.title ||
          "Scene " + sceneNumber,

        location:
          scene.location ||
          worldBible.primaryLocation ||
          "Established film location",

        setting:
          scene.setting ||
          "Established film setting",

        characters:
          Array.isArray(scene.characters)
            ? scene.characters
            : [],

        action:
          scene.action || "",

        dialogue:
          scene.dialogue || "",

        camera:
          scene.camera || "",

        lighting:
          scene.lighting || "",

        atmosphere:
          scene.atmosphere || "",

        emotion:
          scene.emotion || "",

        visualStyle:
          scene.visualStyle ||
          "Cinematic live-action film.",

        continuityInstructions:
          scene.continuityInstructions ||
          "",

        runwayPrompt:
          scene.runwayPrompt ||
          "",

        generation: {
          provider: "runway",

          status: "WAITING",

          taskId: null,

          videoUrl: null,

          error: null,

          creditsUsed: 0
        }
      };
    });

    const queue = {
      queueId:
        "film-queue-" +
        Date.now(),

      status: "READY",

      duration: duration,

      durationFormatted:
        duration === 300
          ? "5 minutes"
          : duration + " seconds",

      sceneDuration: sceneDuration,

      totalScenes: jobs.length,

      completedScenes: 0,

      waitingScenes: jobs.length,

      failedScenes: 0,

      creditsUsed: 0,

      runwayCalls: 0,

      characterBible: characterBible,

      worldBible: worldBible,

      jobs: jobs,

      productionSummary: {
        totalProductionSeconds: duration,

        totalScenes: jobs.length,

        secondsPerScene: sceneDuration,

        aspectRatio:
          filmPlan.productionFormat &&
          filmPlan.productionFormat.aspectRatio
            ? filmPlan.productionFormat.aspectRatio
            : "9:16",

        generationStatus:
          "WAITING_FOR_CREDITS"
      },

      safety: {
        runwayCalled: false,

        creditsUsed: 0,

        zeroCreditMode: true
      }
    };

    return res.status(200).json({
      success: true,

      message:
        "Generation Queue created successfully. No Runway credits were used.",

      queue: queue
    });

  } catch (error) {
    console.error(
      "GENERATION QUEUE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error &&
        error.message
          ? error.message
          : "Failed to create Generation Queue."
    });
  }
}
