const Router = require("express").Router;
const {registerUser, loginUser, loginWithGoogle} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - user_id
 *         - email
 *         - full_name
 *       properties:
 *         user_id:
 *           type: string
 *           description: The unique identifier for the user
 *         email:
 *           type: string
 *           description: User's email address
 *         full_name:
 *           type: string
 *           description: User's full name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: User already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/register", authMiddleware, registerUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login a user (or create if doesn't exist)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User already exists
 *       201:
 *         description: User registered successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/login", authMiddleware, loginUser);

/**
 * @swagger
 * /api/user/login-google:
 *   post:
 *     summary: Login with Google
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User already exists
 *       201:
 *         description: User registered successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/login-google", authMiddleware, loginWithGoogle);

module.exports = router;

