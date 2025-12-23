const { pool } = require("../config/db");
const logger = require("../utils/logger");

async function createUser(firebase_uid, email, full_name) {
    const query = `INSERT INTO users (firebase_uid, email, full_name) VALUES ($1, $2, $3) RETURNING *`;
    const values = [firebase_uid, email, full_name];
    try {
        logger.info("Creating user:", { firebase_uid, email, full_name });
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error("Error creating user:", error);
        throw error;
    }
}

async function getUserById(firebase_uid) {
    const query = `SELECT * FROM users WHERE firebase_uid = $1`;
    const values = [firebase_uid];
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        logger.error("Error getting user:", error);
        throw error;
    }
}

module.exports = {
    createUser,
    getUserById
}
