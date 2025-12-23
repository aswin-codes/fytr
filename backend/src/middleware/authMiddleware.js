const admin = require("../config/firebaseAdmin");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        logger.error("Token is not available")
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    try {
        const decoded = await  admin.auth().verifyIdToken(token);

        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
        };
        logger.info("User authenticated successfully");
        next();
    } catch (error) {
        logger.error("Error verifying token:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;