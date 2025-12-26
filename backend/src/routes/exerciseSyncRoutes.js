const Router = require("express").Router;
const {
  checkExerciseVersion,
  syncExercisesIfNeeded,
} = require("../controllers/exerciseSyncController");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Exercise Sync
 *   description: Exercise catalog synchronization endpoints
 */

/**
 * @swagger
 * /api/exercises/version:
 *   get:
 *     summary: Get current exercise catalog version
 *     description: Returns the current version of the exercise catalog on the server
 *     tags:
 *       - Exercise Sync
 *     responses:
 *       200:
 *         description: Successfully retrieved exercise catalog version
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch exercise version"
 */
router.get("/version", checkExerciseVersion);

/**
 * @swagger
 * /api/exercises/sync:
 *   get:
 *     summary: Sync exercises if version mismatch
 *     description: >
 *       Compares the client's exercise catalog version with the server's version.
 *       If versions match, returns an empty data array. If versions differ,
 *       returns all exercises for the client to sync.
 *     tags:
 *       - Exercise Sync
 *     parameters:
 *       - in: query
 *         name: version
 *         required: false
 *         schema:
 *           type: string
 *         description: The client's current exercise catalog version
 *         example: "1.0.0"
 *     responses:
 *       200:
 *         description: Exercise sync response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 upToDate:
 *                   type: boolean
 *                   description: Whether the client version matches the server version
 *                   example: false
 *                 version:
 *                   type: string
 *                   description: The server's current exercise catalog version
 *                   example: "1.0.1"
 *                 count:
 *                   type: integer
 *                   description: Number of exercises returned (only when upToDate is false)
 *                   example: 150
 *                 data:
 *                   type: array
 *                   description: Array of exercises (empty if upToDate is true)
 *                   items:
 *                     $ref: '#/components/schemas/Exercise'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Exercise sync failed"
 */
router.get("/sync", syncExercisesIfNeeded);

module.exports = router;
