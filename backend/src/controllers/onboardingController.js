const {
    updateCompleteOnboarding,
    getOnboardingData
} = require("../repository/onboardingRepository");
const { getUserIdByFirebaseId } = require("../repository/userRepository");
const logger = require("../utils/logger");

const updateOnboarding = async (req, res) => {
    try {
        const { uid } = req.user;
        const { body_metrics, activity_level, goal_type, nutrition_targets } = req.body;

        logger.info(`Updating onboarding data for user ${uid}`);

        // Validate body_metrics if provided
        if (body_metrics) {
            const { gender, age, height_cm, weight_kg, target_weight_kg } = body_metrics;
            
            if (!gender || !age || !height_cm || !weight_kg || !target_weight_kg) {
                return res.status(400).json({ 
                    error: "Missing required fields in body_metrics (gender, age, height_cm, weight_kg, target_weight_kg)" 
                });
            }

            if (!['male', 'female'].includes(gender)) {
                return res.status(400).json({ error: "Invalid gender. Must be 'male' or 'female'" });
            }
        }

        // Validate activity_level if provided
        if (activity_level) {
            const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very-active', 'athlete'];
            if (!validActivityLevels.includes(activity_level)) {
                return res.status(400).json({ 
                    error: `Invalid activity level. Must be one of: ${validActivityLevels.join(', ')}` 
                });
            }
        }

        // Validate goal_type if provided
        if (goal_type) {
            const validGoalTypes = ['lose-weight', 'gain-muscle', 'maintain'];
            if (!validGoalTypes.includes(goal_type)) {
                return res.status(400).json({ 
                    error: `Invalid goal type. Must be one of: ${validGoalTypes.join(', ')}` 
                });
            }
        }

        // Validate nutrition_targets if provided
        if (nutrition_targets) {
            const { calories, protein_g, carbs_g, fat_g } = nutrition_targets;
            
            if (!calories || !protein_g || !carbs_g || !fat_g) {
                return res.status(400).json({ 
                    error: "Missing required fields in nutrition_targets (calories, protein_g, carbs_g, fat_g)" 
                });
            }
        }

        // Get user_id from firebase_uid
        const userIdResult = await getUserIdByFirebaseId(uid);
        if (!userIdResult) {
            return res.status(404).json({ error: "User not found" });
        }

        const user_id = userIdResult.id;

        // Update onboarding data
        const user = await updateCompleteOnboarding(user_id, {
            body_metrics,
            activity_level,
            goal_type,
            nutrition_targets
        });

        logger.info(`Onboarding data updated successfully for user ${uid}`);
        res.status(200).json({
            message: "Onboarding data updated successfully",
            user: user
        });
    } catch (error) {
        logger.error(`Error updating onboarding data:`, error);
        res.status(500).json({ error: error.message });
    }
};

const getUserOnboardingData = async (req, res) => {
    try {
        const { uid } = req.user;

        logger.info(`Getting onboarding data for user ${uid}`);

        // Get user_id from firebase_uid
        const userIdResult = await getUserIdByFirebaseId(uid);
        if (!userIdResult) {
            return res.status(404).json({ error: "User not found" });
        }

        const user_id = userIdResult.id;

        // Get onboarding data
        const onboardingData = await getOnboardingData(user_id);

        if (!onboardingData) {
            return res.status(404).json({ error: "User data not found" });
        }

        logger.info(`Onboarding data retrieved successfully for user ${uid}`);
        res.status(200).json({
            message: "Onboarding data retrieved successfully",
            data: onboardingData
        });
    } catch (error) {
        logger.error(`Error getting onboarding data:`, error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    updateOnboarding,
    getUserOnboardingData
};