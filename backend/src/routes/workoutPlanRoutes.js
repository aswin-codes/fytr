const Router = require("express").Router;
const { savePlan, getPlan } = require("../controllers/workoutPlanController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * @swagger
 * /api/workout-plan:
 *   post:
 *     summary: Save or update workout plan
 *     tags: [Workout Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Complete Zustand workout plan data
 *     responses:
 *       200:
 *         description: Plan saved successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, savePlan);

/**
 * @swagger
 * /api/workout-plan:
 *   get:
 *     summary: Get workout plan
 *     tags: [Workout Plan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout plan data
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getPlan);

module.exports = router;