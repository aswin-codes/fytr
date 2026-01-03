const { pool } = require("../config/db");
const logger = require("../utils/logger");

/**
 * Create a new analysis
 */
async function createAnalysis(data) {
    const query = `
        INSERT INTO ai_form_analyses (
            user_id, exercise, recorded_at, duration_seconds, video_url,
            score, verdict, status, positives, improvements, ai_coach_tip
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
    `;
    
    const values = [
        data.user_id,
        data.exercise,
        data.recorded_at || new Date(),
        data.duration_seconds,
        data.video_url || null,
        data.score,
        data.verdict,
        data.status,
        data.positives,
        data.improvements,
        data.ai_coach_tip || null
    ];
    
    try {
        logger.info("Creating analysis:", { user_id: data.user_id, exercise: data.exercise });
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error("Error creating analysis:", error);
        throw error;
    }
}

/**
 * Get all analyses for a user
 */
async function getAllAnalysesByUserId(user_db_id, limit = 50, offset = 0) {
    const query = `
        SELECT * FROM ai_form_analyses
        WHERE user_id = $1
        ORDER BY recorded_at DESC
        LIMIT $2 OFFSET $3
    `;
    
    const values = [user_db_id, limit, offset];
    
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        logger.error("Error getting analyses by user ID:", error);
        throw error;
    }
}

/**
 * Get total count of analyses for a user
 */
async function getAnalysesCountByUserId(user_db_id) {
    const query = `
        SELECT COUNT(*) as total
        FROM ai_form_analyses
        WHERE user_id = $1
    `;
    
    const values = [user_db_id];
    
    try {
        const result = await pool.query(query, values);
        return parseInt(result.rows[0].total);
    } catch (error) {
        logger.error("Error getting analyses count:", error);
        throw error;
    }
}

/**
 * Get a single analysis by ID
 */
async function getAnalysisById(analysis_id, user_db_id) {
    const query = `
        SELECT * FROM ai_form_analyses
        WHERE id = $1 AND user_id = $2
    `;
    
    const values = [analysis_id, user_db_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting analysis by ID:", error);
        throw error;
    }
}

/**
 * Delete an analysis
 */
async function deleteAnalysis(analysis_id, user_db_id) {
    const query = `
        DELETE FROM ai_form_analyses
        WHERE id = $1 AND user_id = $2
        RETURNING id
    `;
    
    const values = [analysis_id, user_db_id];
    
    try {
        logger.info("Deleting analysis:", { analysis_id, user_db_id });
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error deleting analysis:", error);
        throw error;
    }
}

/**
 * Get recent analyses (last 7 days)
 */
async function getRecentAnalyses(user_db_id, days = 7) {
    const query = `
        SELECT * FROM ai_form_analyses
        WHERE user_id = $1 
        AND recorded_at >= NOW() - INTERVAL '${days} days'
        ORDER BY recorded_at DESC
    `;
    
    const values = [user_db_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        logger.error("Error getting recent analyses:", error);
        throw error;
    }
}

/**
 * Get analyses by exercise type
 */
async function getAnalysesByExercise(user_db_id, exercise_name) {
    const query = `
        SELECT * FROM ai_form_analyses
        WHERE user_id = $1 AND exercise = $2
        ORDER BY recorded_at DESC
    `;
    
    const values = [user_db_id, exercise_name];
    
    try {
        const result = await pool.query(query, values);
        return result.rows;
    } catch (error) {
        logger.error("Error getting analyses by exercise:", error);
        throw error;
    }
}

/**
 * Get analysis statistics for a user
 */
async function getAnalysisStats(user_db_id) {
    const query = `
        SELECT 
            COUNT(*) as total_analyses,
            AVG(score) as average_score,
            MAX(score) as best_score,
            MIN(score) as worst_score,
            COUNT(CASE WHEN status = 'good' THEN 1 END) as good_count,
            COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
            COUNT(CASE WHEN status = 'critical' THEN 1 END) as critical_count
        FROM ai_form_analyses
        WHERE user_id = $1
    `;
    
    const values = [user_db_id];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error("Error getting analysis stats:", error);
        throw error;
    }
}

/**
 * Update an analysis (if needed for editing)
 */
async function updateAnalysis(analysis_id, user_db_id, updates) {
    const allowedFields = ['video_url', 'ai_coach_tip'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
            updateFields.push(`${key} = $${paramCount}`);
            values.push(updates[key]);
            paramCount++;
        }
    });

    if (updateFields.length === 0) {
        throw new Error("No valid fields to update");
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(analysis_id, user_db_id);

    const query = `
        UPDATE ai_form_analyses
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING *
    `;

    try {
        logger.info("Updating analysis:", { analysis_id, user_db_id });
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error updating analysis:", error);
        throw error;
    }
}

module.exports = {
    createAnalysis,
    getAllAnalysesByUserId,
    getAnalysesCountByUserId,
    getAnalysisById,
    deleteAnalysis,
    getRecentAnalyses,
    getAnalysesByExercise,
    getAnalysisStats,
    updateAnalysis
};