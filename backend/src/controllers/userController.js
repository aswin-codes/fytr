const { createUser, getUserById } = require("../repository/userRepository");
const logger = require("../utils/logger");

const registerUser = async (req, res) => {
    try {
        // Get uid from authMiddleware (req.user)
        const { uid, email } = req.user;    
        const { full_name } = req.body;
        
        logger.info(`Registering user ${uid}`);
        if (!uid || !email || !full_name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await getUserById(uid);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        const user = await createUser(uid, email, full_name);

        logger.info(`User registered successfully ${uid}`);
        res.status(201).json({ message: "User registered successfully", user: user });
    } catch (error) {
        logger.error(`Error registering user:`, error);
        res.status(500).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        // Get uid from authMiddleware (req.user)
        const { uid, email } = req.user
        
        logger.info(`Logging in user ${uid}`);
        if (!uid || !email ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existingUser = await getUserById(uid);
        if (existingUser) {
            return res.status(200).json({ message : "User already exists", user : existingUser });
        }

        const user = await createUser(uid, email, "unnamed");

        logger.info(`User registered successfully ${uid}`);
        res.status(201).json({ message: "User registered successfully", user: user });
    } catch (error) {
        logger.error(`Error registering user:`, error);
        res.status(500).json({ error: error.message });
    }
}

const loginWithGoogle = async (req, res) => {
    try {
        // Get uid from authMiddleware (req.user)
        const { uid, email } = req.user
        const { full_name } = req.body;
        
        logger.info(`Logging in user ${uid}`);
        if (!uid || !email || !full_name ) {
            return res.status(400).json({ error: "Missing required fields" });
        }
 
        const existingUser = await getUserById(uid);
        if (existingUser) {
            return res.status(200).json({ message : "User already exists", user : existingUser });
        }

        const user = await createUser(uid, email, full_name);

        logger.info(`User registered successfully ${uid}`);
        res.status(201).json({ message: "User registered successfully", user: user });
    } catch (error) {
        logger.error(`Error registering user:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { registerUser, loginUser, loginWithGoogle };
