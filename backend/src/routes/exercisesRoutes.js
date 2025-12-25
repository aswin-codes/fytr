const Router = require("express").Router;

const exercisesController = require("../controllers/exercisesController");

const router = Router();

/**
 * @swagger
 * /api/exercise:
 *   get:
 *     summary: Get exercises by muscle group
 *     description: >
 *       Returns all exercises related to a given muscle group.
 *       Supported values include chest, back, biceps, triceps,
 *       shoulders, leg, core, and full_body.
 *     tags:
 *       - Exercises
 *     parameters:
 *       - in: query
 *         name: muscle
 *         required: true
 *         schema:
 *           type: string
 *           enum:
 *             - chest
 *             - back
 *             - biceps
 *             - triceps
 *             - shoulders
 *             - leg
 *             - core
 *             - full_body
 *         description: Muscle group to filter exercises
 *     responses:
 *       200:
 *         description: List of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 84
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Invalid or missing muscle parameter
 *       500:
 *         description: Server error
 */
router.get("/", exercisesController.getExercisesByMuscleGroup);

module.exports = router;
