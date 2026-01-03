const Router = require("express").Router;
const {
    createNewAnalysis,
    getUserAnalyses,
    getAnalysisDetails,
    deleteUserAnalysis,
    getRecentUserAnalyses,
    getAnalysesByExerciseType,
    getUserAnalysisStats
} = require("../controllers/analysisController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Analysis:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         exercise:
 *           type: string
 *         recordedAt:
 *           type: string
 *           format: date-time
 *         durationSeconds:
 *           type: integer
 *         videoUrl:
 *           type: string
 *         score:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *         verdict:
 *           type: string
 *         status:
 *           type: string
 *           enum: [good, warning, critical]
 *         positives:
 *           type: array
 *           items:
 *             type: string
 *         improvements:
 *           type: array
 *           items:
 *             type: string
 *         aiCoachTip:
 *           type: string
 *         actions:
 *           type: object
 *           properties:
 *             canSave:
 *               type: boolean
 *             canDelete:
 *               type: boolean
 *             isCurrent:
 *               type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: AI form analysis management
 */

/**
 * @swagger
 * /api/analysis:
 *   post:
 *     summary: Create a new analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exercise
 *               - duration_seconds
 *               - score
 *               - verdict
 *               - status
 *             properties:
 *               exercise:
 *                 type: string
 *               recorded_at:
 *                 type: string
 *                 format: date-time
 *               duration_seconds:
 *                 type: integer
 *               video_url:
 *                 type: string
 *               score:
 *                 type: integer
 *               verdict:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [good, warning, critical]
 *               positives:
 *                 type: array
 *                 items:
 *                   type: string
 *               improvements:
 *                 type: array
 *                 items:
 *                   type: string
 *               ai_coach_tip:
 *                 type: string
 *     responses:
 *       201:
 *         description: Analysis created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createNewAnalysis);

/**
 * @swagger
 * /api/analysis:
 *   get:
 *     summary: Get all analyses for authenticated user
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of analyses
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getUserAnalyses);

/**
 * @swagger
 * /api/analysis/recent:
 *   get:
 *     summary: Get recent analyses (last N days)
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Recent analyses
 *       401:
 *         description: Unauthorized
 */
router.get("/recent", authMiddleware, getRecentUserAnalyses);

/**
 * @swagger
 * /api/analysis/stats:
 *   get:
 *     summary: Get analysis statistics for user
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analysis statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", authMiddleware, getUserAnalysisStats);

/**
 * @swagger
 * /api/analysis/exercise/{exercise}:
 *   get:
 *     summary: Get analyses by exercise type
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exercise
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analyses for specific exercise
 *       401:
 *         description: Unauthorized
 */
router.get("/exercise/:exercise", authMiddleware, getAnalysesByExerciseType);

/**
 * @swagger
 * /api/analysis/{analysisId}:
 *   get:
 *     summary: Get single analysis by ID
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analysis details
 *       404:
 *         description: Analysis not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:analysisId", authMiddleware, getAnalysisDetails);

/**
 * @swagger
 * /api/analysis/{analysisId}:
 *   delete:
 *     summary: Delete an analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analysis deleted successfully
 *       404:
 *         description: Analysis not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:analysisId", authMiddleware, deleteUserAnalysis);

module.exports = router;