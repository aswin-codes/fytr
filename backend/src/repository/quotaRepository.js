const { pool } = require("../config/db");
const logger = require("../utils/logger");

const FREE_USER_DAILY_LIMIT = 5;
const PAID_USER_DAILY_LIMIT = -1; // -1 means unlimited

/**
 * Get user info and quota usage for today
 */
async function getUserQuotaInfo(firebase_uid) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
        SELECT u.id as user_db_id, u.is_paid, COALESCE(g.request_count, 0) as used
        FROM users u
        LEFT JOIN genai_usage g ON u.id = g.user_id AND g.request_date = $2
        WHERE u.firebase_uid = $1
    `;
    const values = [firebase_uid, today];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting user quota info:", error);
        throw error;
    }
}

/**
 * Get user's database ID and paid status
 */
async function getUserPaidStatus(firebase_uid) {
    const query = `SELECT id, is_paid FROM users WHERE firebase_uid = $1`;
    const values = [firebase_uid];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting user paid status:", error);
        throw error;
    }
}

/**
 * Increment user's quota usage for today
 */
async function incrementUserQuota(user_db_id) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
        INSERT INTO genai_usage (user_id, request_date, request_count, last_request_at)
        VALUES ($1, $2, 1, now())
        ON CONFLICT (user_id, request_date) 
        DO UPDATE SET 
            request_count = genai_usage.request_count + 1,
            last_request_at = now()
        RETURNING request_count
    `;
    const values = [user_db_id, today];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error("Error incrementing user quota:", error);
        throw error;
    }
}

/**
 * Get user's quota status for today
 */
async function getUserQuotaStatus(firebase_uid) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
        SELECT u.is_paid, COALESCE(g.request_count, 0) as used
        FROM users u
        LEFT JOIN genai_usage g ON u.id = g.user_id AND g.request_date = $2
        WHERE u.firebase_uid = $1
    `;
    const values = [firebase_uid, today];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting user quota status:", error);
        throw error;
    }
}

/**
 * Update user's paid status
 */
async function updateUserPaidStatus(firebase_uid, isPaid) {
    const query = `
        UPDATE users 
        SET is_paid = $1, updated_at = now() 
        WHERE firebase_uid = $2 
        RETURNING firebase_uid, is_paid
    `;
    const values = [isPaid, firebase_uid];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error updating user paid status:", error);
        throw error;
    }
}

/**
 * Helper function to calculate quota limits and remaining
 */
function calculateQuotaLimits(isPaid, used) {
    if (isPaid) {
        return {
            limit: PAID_USER_DAILY_LIMIT,
            remaining: PAID_USER_DAILY_LIMIT,
            allowed: true
        };
    } else {
        const limit = FREE_USER_DAILY_LIMIT;
        const remaining = Math.max(0, limit - used);
        return {
            limit,
            remaining,
            allowed: remaining > 0
        };
    }
}

module.exports = {
    getUserQuotaInfo,
    getUserPaidStatus,
    incrementUserQuota,
    getUserQuotaStatus,
    updateUserPaidStatus,
    calculateQuotaLimits,
    FREE_USER_DAILY_LIMIT,
    PAID_USER_DAILY_LIMIT
};