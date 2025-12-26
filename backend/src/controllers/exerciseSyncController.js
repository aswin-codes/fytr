const logger = require("../utils/logger");
const { getExerciseCatalogVersion } = require("../repository/metadataRepository");
const { getAllExercises } = require("../repository/exercisesRepository");

const checkExerciseVersion = async (req, res) => {
  try {
    const version = await getExerciseCatalogVersion();

    return res.json({
      success: true,
      version,
    });
  } catch (error) {
    logger.error("Version check failed", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exercise version",
    });
  }
};

const syncExercisesIfNeeded = async (req, res) => {
  try {
    const clientVersion = req.query.version;
    const serverVersion = await getExerciseCatalogVersion();

    if (clientVersion === serverVersion) {
      return res.json({
        success: true,
        upToDate: true,
        version: serverVersion,
        data: [],
      });
    }

    const exercises = await getAllExercises();

    return res.json({
      success: true,
      upToDate: false,
      version: serverVersion,
      count: exercises.length,
      data: exercises,
    });
  } catch (error) {
    logger.error("Exercise sync failed", error);
    return res.status(500).json({
      success: false,
      message: "Exercise sync failed",
    });
  }
};

module.exports = {
  checkExerciseVersion,
  syncExercisesIfNeeded,
};
