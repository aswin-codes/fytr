const { pool } = require("../config/db");
const logger = require("../utils/logger");

/**
 * Upsert workout plan (create or update)
 */
async function upsertWorkoutPlan(userDbId, planData) {
    try {
        // Check if plan exists
        const checkQuery = 'SELECT id FROM workout_plans WHERE user_id = $1';
        const checkResult = await pool.query(checkQuery, [userDbId]);

        if (checkResult.rows.length > 0) {
            // Update existing
            const updateQuery = `
                UPDATE workout_plans 
                SET plan_data = $1, updated_at = now()
                WHERE user_id = $2
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [planData, userDbId]);
            return result.rows[0];
        } else {
            // Insert new
            const insertQuery = `
                INSERT INTO workout_plans (user_id, plan_data)
                VALUES ($1, $2)
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [userDbId, planData]);
            return result.rows[0];
        }
    } catch (error) {
        logger.error("Error upserting workout plan:", error);
        throw error;
    }
}

/**
 * Get workout plan by user ID
 */
async function getWorkoutPlanByUserId(userDbId) {
    try {
        const query = 'SELECT * FROM workout_plans WHERE user_id = $1';
        const result = await pool.query(query, [userDbId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting workout plan:", error);
        throw error;
    }
}

module.exports = {
    upsertWorkoutPlan,
    getWorkoutPlanByUserId
};