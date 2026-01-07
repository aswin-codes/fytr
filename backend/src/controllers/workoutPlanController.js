const { upsertWorkoutPlan, getWorkoutPlanByUserId } = require("../repository/workoutPlanRepository");
const { getUserIdByFirebaseId } = require("../repository/userRepository");
const logger = require("../utils/logger");

/**
 * Save or update workout plan
 */
const savePlan = async (req, res) => {
    try {
        const userId = req.user.uid;
        const planData = req.body;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Saving workout plan for user ${userId}`);

        const result = await upsertWorkoutPlan(userDbInfo.id, planData);

        res.json({
            success: true,
            message: "Workout plan saved successfully",
            id: result.id
        });

    } catch (error) {
        logger.error("Error saving workout plan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save workout plan",
            error: error.message
        });
    }
};

/**
 * Get workout plan
 */
const getPlan = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching workout plan for user ${userId}`);

        const plan = await getWorkoutPlanByUserId(userDbInfo.id);

        if (!plan) {
            return res.json({
                success: true,
                plan: null
            });
        }

        res.json({
            success: true,
            plan: plan.plan_data
        });

    } catch (error) {
        logger.error("Error getting workout plan:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch workout plan",
            error: error.message
        });
    }
};

module.exports = {
    savePlan,
    getPlan
};