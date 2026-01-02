const Router = require("express").Router;
const {
    checkQuota,
    incrementQuota,
    getQuotaStatus,
    updatePaidStatus
} = require("../controllers/quotaController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     QuotaCheck:
 *       type: object
 *       properties:
 *         allowed:
 *           type: boolean
 *           description: Whether the user can make another request
 *         used:
 *           type: integer
 *           description: Number of requests used today
 *         limit:
 *           type: integer
 *           description: Daily limit (-1 for unlimited)
 *         remaining:
 *           type: integer
 *           description: Remaining requests today (-1 for unlimited)
 *         isPaid:
 *           type: boolean
 *           description: Whether user has paid subscription
 *         resetTime:
 *           type: string
 *           format: date-time
 *           description: When the quota resets
 *     QuotaIncrement:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         used:
 *           type: integer
 *         limit:
 *           type: integer
 *         remaining:
 *           type: integer
 *         isPaid:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Quota
 *   description: GenAI quota management
 */

/**
 * @swagger
 * /api/quota/check:
 *   post:
 *     summary: Check if user has remaining quota
 *     tags: [Quota]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quota check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuotaCheck'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Quota check failed
 */
router.post("/check", authMiddleware, checkQuota);

/**
 * @swagger
 * /api/quota/increment:
 *   post:
 *     summary: Increment user's quota usage (called after successful analysis)
 *     tags: [Quota]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quota incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuotaIncrement'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to increment quota
 */
router.post("/increment", authMiddleware, incrementQuota);

/**
 * @swagger
 * /api/quota/status:
 *   get:
 *     summary: Get current quota status for authenticated user
 *     tags: [Quota]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current quota status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 limit:
 *                   type: integer
 *                   description: Daily limit (-1 for unlimited)
 *                 used:
 *                   type: integer
 *                   description: Requests used today
 *                 remaining:
 *                   type: integer
 *                   description: Remaining requests (-1 for unlimited)
 *                 isPaid:
 *                   type: boolean
 *                 resetTime:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch quota
 */
router.get("/status", authMiddleware, getQuotaStatus);

/**
 * @swagger
 * /api/quota/admin/update-paid-status:
 *   post:
 *     summary: Update user's paid status (Admin only)
 *     tags: [Quota]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - isPaid
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: Firebase UID of target user
 *               isPaid:
 *                 type: boolean
 *                 description: New paid status
 *     responses:
 *       200:
 *         description: Paid status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     firebase_uid:
 *                       type: string
 *                     is_paid:
 *                       type: boolean
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update paid status
 */
router.post("/admin/update-paid-status", authMiddleware, updatePaidStatus);

module.exports = router;