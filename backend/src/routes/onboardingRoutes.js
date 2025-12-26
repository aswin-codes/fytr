const Router = require("express").Router;
const {
    updateOnboarding,
    getUserOnboardingData
} = require("../controllers/onboardingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BodyMetrics:
 *       type: object
 *       required:
 *         - gender
 *         - age
 *         - height_cm
 *         - weight_kg
 *         - target_weight_kg
 *       properties:
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: User's gender
 *         age:
 *           type: integer
 *           description: User's age
 *         height_cm:
 *           type: number
 *           format: float
 *           description: User's height in centimeters
 *         weight_kg:
 *           type: number
 *           format: float
 *           description: User's current weight in kilograms
 *         target_weight_kg:
 *           type: number
 *           format: float
 *           description: User's target weight in kilograms
 *     NutritionTargets:
 *       type: object
 *       required:
 *         - calories
 *         - protein_g
 *         - carbs_g
 *         - fat_g
 *       properties:
 *         calories:
 *           type: integer
 *           description: Daily calorie target
 *         protein_g:
 *           type: integer
 *           description: Daily protein target in grams
 *         carbs_g:
 *           type: integer
 *           description: Daily carbs target in grams
 *         fat_g:
 *           type: integer
 *           description: Daily fat target in grams
 *         fiber_g:
 *           type: integer
 *           description: Daily fiber target in grams (optional)
 *     OnboardingData:
 *       type: object
 *       properties:
 *         body_metrics:
 *           $ref: '#/components/schemas/BodyMetrics'
 *         activity_level:
 *           type: string
 *           enum: [sedentary, light, moderate, active, very-active, athlete]
 *           description: User's activity level
 *         goal_type:
 *           type: string
 *           enum: [lose-weight, gain-muscle, maintain]
 *           description: User's fitness goal
 *         nutrition_targets:
 *           $ref: '#/components/schemas/NutritionTargets'
 */

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: User onboarding and profile setup
 */

/**
 * @swagger
 * /api/onboarding:
 *   put:
 *     summary: Update all onboarding data (body metrics, activity level, goal, nutrition targets)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingData'
 *           examples:
 *             complete:
 *               summary: Complete onboarding data
 *               value:
 *                 body_metrics:
 *                   gender: male
 *                   age: 25
 *                   height_cm: 175.5
 *                   weight_kg: 75.0
 *                   target_weight_kg: 70.0
 *                 activity_level: moderate
 *                 goal_type: lose-weight
 *                 nutrition_targets:
 *                   calories: 2000
 *                   protein_g: 150
 *                   carbs_g: 200
 *                   fat_g: 65
 *                   fiber_g: 30
 *             partial:
 *               summary: Partial update (only body metrics and goal)
 *               value:
 *                 body_metrics:
 *                   gender: female
 *                   age: 30
 *                   height_cm: 165.0
 *                   weight_kg: 60.0
 *                   target_weight_kg: 58.0
 *                 goal_type: maintain
 *     responses:
 *       200:
 *         description: Onboarding data updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Missing required fields or invalid data
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put("/", authMiddleware, updateOnboarding);

/**
 * @swagger
 * /api/onboarding:
 *   get:
 *     summary: Get user onboarding data
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firebase_uid:
 *                       type: string
 *                     email:
 *                       type: string
 *                     full_name:
 *                       type: string
 *                     onboarding_completed:
 *                       type: boolean
 *                     body_metrics:
 *                       $ref: '#/components/schemas/BodyMetrics'
 *                     activity_level:
 *                       type: string
 *                     goal_type:
 *                       type: string
 *                     nutrition_targets:
 *                       $ref: '#/components/schemas/NutritionTargets'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getUserOnboardingData);

module.exports = router;