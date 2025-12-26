const { Pool } = require("pg");
const { PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE } = require("./env");
const logger = require("../utils/logger");

// Create a connection pool
const pool = new Pool({
    host: PG_HOST,
    port: PG_PORT,
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DATABASE,
    ssl:{ rejectUnauthorized: false },
});

// Test DB connection once at startup
const connectDB = async () => {
    try {
        const client = await pool.connect();
        logger.info("📦 PostgreSQL connected successfully");
        client.release();
    } catch (error) {
        logger.error("❌ PostgreSQL connection error:", error.message);
        process.exit(1);
    }
};

// Graceful shutdown (for Docker, PM2, Render, Railway, AWS, etc.)
process.on("SIGINT", async () => {
    logger.info("🛑 Shutting down DB pool...");
    await pool.end();
    process.exit(0);
});

module.exports = {
    connectDB,
    pool,
};
