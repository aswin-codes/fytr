const {
    getUserQuotaInfo,
    getUserPaidStatus,
    incrementUserQuota,
    getUserQuotaStatus,
    updateUserPaidStatus,
    calculateQuotaLimits
} = require("../repository/quotaRepository");
const logger = require("../utils/logger");

/**
 * Check if user has quota remaining
 */
const checkQuota = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        logger.info(`Checking quota for user ${userId}`);
        
        const userQuotaInfo = await getUserQuotaInfo(userId);
        
        if (!userQuotaInfo) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).json({ 
                allowed: false,
                message: "User not found" 
            });
        }

        const isPaid = userQuotaInfo.is_paid || false;
        const used = parseInt(userQuotaInfo.used);
        
        const { limit, remaining, allowed } = calculateQuotaLimits(isPaid, used);
        
        if (isPaid) {
            logger.info(`Quota check for ${userId}: ${used} used (UNLIMITED - paid user)`);
        } else {
            logger.info(`Quota check for ${userId}: ${used}/${limit} (allowed: ${allowed})`);
        }

        res.json({
            allowed,
            used,
            limit,
            remaining,
            isPaid,
            resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        });

    } catch (error) {
        logger.error("Error checking quota:", error);
        res.status(500).json({ 
            allowed: false,
            message: "Quota check failed" 
        });
    }
};

/**
 * Increment usage count after successful analysis
 */
const incrementQuota = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        logger.info(`Incrementing quota for user ${userId}`);

        const userInfo = await getUserPaidStatus(userId);

        if (!userInfo) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const userDbId = userInfo.id;
        const isPaid = userInfo.is_paid || false;

        const result = await incrementUserQuota(userDbId);
        const newCount = result.request_count;

        const { limit, remaining } = calculateQuotaLimits(isPaid, newCount);

        if (isPaid) {
            logger.info(`Incremented quota for ${userId}: ${newCount} used (UNLIMITED - paid user)`);
        } else {
            logger.info(`Incremented quota for ${userId}: ${newCount}/${limit}`);
        }

        res.json({
            success: true,
            used: newCount,
            limit,
            remaining,
            isPaid
        });

    } catch (error) {
        logger.error("Error incrementing quota:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to increment quota" 
        });
    }
};

/**
 * Get current quota status
 */
const getQuotaStatus = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        logger.info(`Getting quota status for user ${userId}`);

        const quotaStatus = await getUserQuotaStatus(userId);

        if (!quotaStatus) {
            logger.warn(`User not found: ${userId}`);
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        const isPaid = quotaStatus.is_paid || false;
        const used = parseInt(quotaStatus.used);

        const { limit, remaining } = calculateQuotaLimits(isPaid, used);

        res.json({
            limit,
            used,
            remaining,
            isPaid,
            resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        });

    } catch (error) {
        logger.error("Error fetching quota status:", error);
        res.status(500).json({ 
            message: "Failed to fetch quota" 
        });
    }
};

/**
 * Update user's paid status (Admin only)
 */
const updatePaidStatus = async (req, res) => {
    try {
        const { targetUserId, isPaid } = req.body;
        
        // TODO: Add admin authentication check here
        // For now, this is a simple implementation
        
        if (!targetUserId || typeof isPaid !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                message: "Invalid parameters. Required: targetUserId (string), isPaid (boolean)" 
            });
        }

        logger.info(`Updating paid status for ${targetUserId} to ${isPaid}`);

        const result = await updateUserPaidStatus(targetUserId, isPaid);

        if (!result) {
            logger.warn(`User not found: ${targetUserId}`);
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        logger.info(`Updated paid status for ${targetUserId}: ${isPaid}`);

        res.json({
            success: true,
            user: {
                firebase_uid: result.firebase_uid,
                is_paid: result.is_paid
            }
        });

    } catch (error) {
        logger.error("Error updating paid status:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to update paid status" 
        });
    }
};

module.exports = {
    checkQuota,
    incrementQuota,
    getQuotaStatus,
    updatePaidStatus
};