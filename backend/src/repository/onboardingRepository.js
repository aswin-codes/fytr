const { pool } = require("../config/db");
const logger = require("../utils/logger");

async function updateCompleteOnboarding(user_id, onboardingData) {
    const { body_metrics, activity_level, goal_type, nutrition_targets } = onboardingData;
    
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        logger.info("Updating complete onboarding data for user:", { user_id });
        
        // Update body metrics
        if (body_metrics) {
            const { gender, age, height_cm, weight_kg, target_weight_kg } = body_metrics;
            const bodyMetricsQuery = `
                INSERT INTO user_body_metrics (user_id, gender, age, height_cm, weight_kg, target_weight_kg)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    gender = EXCLUDED.gender,
                    age = EXCLUDED.age,
                    height_cm = EXCLUDED.height_cm,
                    weight_kg = EXCLUDED.weight_kg,
                    target_weight_kg = EXCLUDED.target_weight_kg,
                    updated_at = now()
                RETURNING *
            `;
            await client.query(bodyMetricsQuery, [user_id, gender, age, height_cm, weight_kg, target_weight_kg]);
        }
        
        // Update activity level
        if (activity_level) {
            const activityLevelQuery = `
                INSERT INTO user_activity_level (user_id, activity_level)
                VALUES ($1, $2)
                ON CONFLICT (user_id)
                DO UPDATE SET 
                    activity_level = EXCLUDED.activity_level,
                    updated_at = now()
                RETURNING *
            `;
            await client.query(activityLevelQuery, [user_id, activity_level]);
        }
        
        // Update goal
        if (goal_type) {
            const goalQuery = `
                INSERT INTO user_goals (user_id, goal_type)
                VALUES ($1, $2)
                ON CONFLICT (user_id)
                DO UPDATE SET 
                    goal_type = EXCLUDED.goal_type,
                    created_at = now()
                RETURNING *
            `;
            await client.query(goalQuery, [user_id, goal_type]);
        }
        
        // Update nutrition targets
        if (nutrition_targets) {
            const { calories, protein_g, carbs_g, fat_g, fiber_g } = nutrition_targets;
            const nutritionQuery = `
                INSERT INTO user_nutrition_targets (user_id, calories, protein_g, carbs_g, fat_g, fiber_g)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id)
                DO UPDATE SET 
                    calories = EXCLUDED.calories,
                    protein_g = EXCLUDED.protein_g,
                    carbs_g = EXCLUDED.carbs_g,
                    fat_g = EXCLUDED.fat_g,
                    fiber_g = EXCLUDED.fiber_g,
                    calculated_at = now()
                RETURNING *
            `;
            await client.query(nutritionQuery, [user_id, calories, protein_g, carbs_g, fat_g, fiber_g || null]);
        }
        
        // Mark onboarding as complete
        const userUpdateQuery = `
            UPDATE users 
            SET onboarding_completed = true, updated_at = now()
            WHERE id = $1
            RETURNING *
        `;
        const userResult = await client.query(userUpdateQuery, [user_id]);
        
        await client.query('COMMIT');
        
        logger.info("Complete onboarding data updated successfully for user:", { user_id });
        
        return userResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error("Error updating complete onboarding data:", error);
        throw error;
    } finally {
        client.release();
    }
}

async function getOnboardingData(user_id) {
    const query = `
        SELECT 
            u.id,
            u.firebase_uid,
            u.email,
            u.full_name,
            u.onboarding_completed,
            jsonb_build_object(
                'gender', ubm.gender,
                'age', ubm.age,
                'height_cm', ubm.height_cm,
                'weight_kg', ubm.weight_kg,
                'target_weight_kg', ubm.target_weight_kg
            ) as body_metrics,
            ual.activity_level,
            ug.goal_type,
            jsonb_build_object(
                'calories', unt.calories,
                'protein_g', unt.protein_g,
                'carbs_g', unt.carbs_g,
                'fat_g', unt.fat_g,
                'fiber_g', unt.fiber_g
            ) as nutrition_targets
        FROM users u
        LEFT JOIN user_body_metrics ubm ON u.id = ubm.user_id
        LEFT JOIN user_activity_level ual ON u.id = ual.user_id
        LEFT JOIN user_goals ug ON u.id = ug.user_id
        LEFT JOIN user_nutrition_targets unt ON u.id = unt.user_id
        WHERE u.id = $1
    `;
    
    const values = [user_id];
    
    try {
        logger.info("Getting onboarding data for user:", { user_id });
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting onboarding data:", error);
        throw error;
    }
}

module.exports = {
    updateCompleteOnboarding,
    getOnboardingData
};