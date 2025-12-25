const logger = require("../utils/logger");
const { getAllExercises, getExercisesByPrimaryMuscles } = require("../repository/exercisesRepository");

// Frontend muscle → DB muscle mapping
const MUSCLE_MAP = {
  chest: ["chest"],
  biceps: ["biceps"],
  triceps: ["triceps"],
  shoulders: ["shoulders"],
  core: ["abdominals", "lower back"],
  back: ["lats", "middle back", "lower back"],
  leg: [
    "quadriceps",
    "hamstrings",
    "calves",
    "glutes",
    "adductors",
    "abductors"
  ],
  full_body: null // special case
};

const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { muscle } = req.query;

    if (!muscle) {
      return res.status(400).json({
        success: false,
        message: "muscle query param is required"
      });
    }

    const normalized = muscle.toLowerCase();

    if (!MUSCLE_MAP.hasOwnProperty(normalized)) {
      return res.status(400).json({
        success: false,
        message: "Invalid muscle group"
      });
    }

    let exercises;

    if (normalized === "full_body") {
      exercises = await getAllExercises();
    } else {
      const muscleList = MUSCLE_MAP[normalized];
      exercises = await getExercisesByPrimaryMuscles(
        muscleList
      );
    }
    logger.info(`Retrieved ${exercises.length} exercises for ${muscle}`);
    return res.json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getExercisesByMuscleGroup
};