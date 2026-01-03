const {
    createAnalysis,
    getAllAnalysesByUserId,
    getAnalysesCountByUserId,
    getAnalysisById,
    deleteAnalysis,
    getRecentAnalyses,
    getAnalysesByExercise,
    getAnalysisStats
} = require("../repository/analysisRepository");
const { getUserIdByFirebaseId } = require("../repository/userRepository");
const logger = require("../utils/logger");
const { deleteVideoFromCloudinary } = require('../utils/cloudinaryHelper');

/**
 * Create a new analysis
 */
const createNewAnalysis = async (req, res) => {
    try {
        const userId = req.user.uid;
        const {
            exercise,
            recorded_at,
            duration_seconds,
            video_url,
            score,
            verdict,
            status,
            positives,
            improvements,
            ai_coach_tip
        } = req.body;
      console.log(req.body);
        // Validate required fields
        if (!exercise || !duration_seconds || score === undefined || !verdict || !status) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: exercise, duration_seconds, score, verdict, status"
            });
        }

        // Validate status
        if (!['good', 'warning', 'critical'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'good', 'warning', or 'critical'"
            });
        }

        // Validate score
        if (score < 0 || score > 100) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 0 and 100"
            });
        }

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Creating analysis for user ${userId}`);

        const analysisData = {
            user_id: userDbInfo.id,
            exercise,
            recorded_at: recorded_at || new Date(),
            duration_seconds,
            video_url: video_url || null,
            score,
            verdict,
            status,
            positives: positives || [],
            improvements: improvements || [],
            ai_coach_tip: ai_coach_tip || null
        };

        const analysis = await createAnalysis(analysisData);

        logger.info(`Analysis created successfully: ${analysis.id}`);

        res.status(201).json({
            success: true,
            message: "Analysis created successfully",
            analysis: {
                id: analysis.id,
                exercise: analysis.exercise,
                recordedAt: analysis.recorded_at,
                durationSeconds: analysis.duration_seconds,
                videoUrl: analysis.video_url,
                score: analysis.score,
                verdict: analysis.verdict,
                status: analysis.status,
                positives: analysis.positives,
                improvements: analysis.improvements,
                aiCoachTip: analysis.ai_coach_tip,
                createdAt: analysis.created_at,
                actions: {
                    canSave: true,
                    canDelete: true,
                    isCurrent: false
                }
            }
        });

    } catch (error) {
        logger.error("Error creating analysis:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create analysis",
            error: error.message
        });
    }
};

/**
 * Get all analyses for the authenticated user
 */
const getUserAnalyses = async (req, res) => {
    try {
        const userId = req.user.uid;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching analyses for user ${userId}, page ${page}`);

        const [analyses, total] = await Promise.all([
            getAllAnalysesByUserId(userDbInfo.id, limit, offset),
            getAnalysesCountByUserId(userDbInfo.id)
        ]);

        const formattedAnalyses = analyses.map(analysis => ({
            id: analysis.id,
            exercise: analysis.exercise,
            recordedAt: analysis.recorded_at,
            durationSeconds: analysis.duration_seconds,
            videoUrl: analysis.video_url,
            score: analysis.score,
            verdict: analysis.verdict,
            status: analysis.status,
            positives: analysis.positives,
            improvements: analysis.improvements,
            aiCoachTip: analysis.ai_coach_tip,
            actions: {
                canSave: true,
                canDelete: true,
                isCurrent: false
            }
        }));

        res.json({
            success: true,
            analyses: formattedAnalyses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        logger.error("Error getting user analyses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analyses",
            error: error.message
        });
    }
};

/**
 * Get a single analysis by ID
 */
const getAnalysisDetails = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { analysisId } = req.params;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching analysis ${analysisId} for user ${userId}`);

        const analysis = await getAnalysisById(analysisId, userDbInfo.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analysis not found"
            });
        }

        res.json({
            success: true,
            analysis: {
                id: analysis.id,
                exercise: analysis.exercise,
                recordedAt: analysis.recorded_at,
                durationSeconds: analysis.duration_seconds,
                videoUrl: analysis.video_url,
                score: analysis.score,
                verdict: analysis.verdict,
                status: analysis.status,
                positives: analysis.positives,
                improvements: analysis.improvements,
                aiCoachTip: analysis.ai_coach_tip,
                actions: {
                    canSave: true,
                    canDelete: true,
                    isCurrent: false
                }
            }
        });

    } catch (error) {
        logger.error("Error getting analysis details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analysis",
            error: error.message
        });
    }
};

/**
 * Delete an analysis
 */
 const deleteUserAnalysis = async (req, res) => {
     try {
         const userId = req.user.uid;
         const { analysisId } = req.params;
 
         // Get user's database ID
         const userDbInfo = await getUserIdByFirebaseId(userId);
         if (!userDbInfo) {
             return res.status(404).json({
                 success: false,
                 message: "User not found"
             });
         }
 
         logger.info(`Deleting analysis ${analysisId} for user ${userId}`);
 
         // First, get the analysis to retrieve video URL
         const analysis = await getAnalysisById(analysisId, userDbInfo.id);
 
         if (!analysis) {
             return res.status(404).json({
                 success: false,
                 message: "Analysis not found or already deleted"
             });
         }
 
         // Delete from database
         const deleted = await deleteAnalysis(analysisId, userDbInfo.id);
 
         if (!deleted) {
             return res.status(404).json({
                 success: false,
                 message: "Failed to delete analysis from database"
             });
         }
 
         logger.info(`Analysis ${analysisId} deleted from database`);
 
         // Delete video from Cloudinary (don't block response if this fails)
         if (analysis.video_url) {
             deleteVideoFromCloudinary(analysis.video_url)
                 .then(result => {
                     if (result.success) {
                         logger.info(`Video deleted from Cloudinary for analysis ${analysisId}`);
                     } else {
                         logger.warn(`Failed to delete video from Cloudinary: ${result.message || result.error}`);
                     }
                 })
                 .catch(error => {
                     logger.error(`Error deleting video from Cloudinary: ${error.message}`);
                 });
         }
 
         res.json({
             success: true,
             message: "Analysis deleted successfully",
             deletedId: deleted.id
         });
 
     } catch (error) {
         logger.error("Error deleting analysis:", error);
         res.status(500).json({
             success: false,
             message: "Failed to delete analysis",
             error: error.message
         });
     }
 };

/**
 * Get recent analyses (last 7 days)
 */
const getRecentUserAnalyses = async (req, res) => {
    try {
        const userId = req.user.uid;
        const days = parseInt(req.query.days) || 7;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching recent analyses for user ${userId} (last ${days} days)`);

        const analyses = await getRecentAnalyses(userDbInfo.id, days);

        const formattedAnalyses = analyses.map(analysis => ({
            id: analysis.id,
            exercise: analysis.exercise,
            recordedAt: analysis.recorded_at,
            durationSeconds: analysis.duration_seconds,
            videoUrl: analysis.video_url,
            score: analysis.score,
            verdict: analysis.verdict,
            status: analysis.status,
            positives: analysis.positives,
            improvements: analysis.improvements,
            aiCoachTip: analysis.ai_coach_tip,
            actions: {
                canSave: true,
                canDelete: true,
                isCurrent: false
            }
        }));

        res.json({
            success: true,
            analyses: formattedAnalyses,
            period: `${days} days`
        });

    } catch (error) {
        logger.error("Error getting recent analyses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent analyses",
            error: error.message
        });
    }
};

/**
 * Get analyses by exercise type
 */
const getAnalysesByExerciseType = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { exercise } = req.params;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching ${exercise} analyses for user ${userId}`);

        const analyses = await getAnalysesByExercise(userDbInfo.id, exercise);

        const formattedAnalyses = analyses.map(analysis => ({
            id: analysis.id,
            exercise: analysis.exercise,
            recordedAt: analysis.recorded_at,
            durationSeconds: analysis.duration_seconds,
            videoUrl: analysis.video_url,
            score: analysis.score,
            verdict: analysis.verdict,
            status: analysis.status,
            positives: analysis.positives,
            improvements: analysis.improvements,
            aiCoachTip: analysis.ai_coach_tip,
            actions: {
                canSave: true,
                canDelete: true,
                isCurrent: false
            }
        }));

        res.json({
            success: true,
            exercise,
            analyses: formattedAnalyses,
            count: formattedAnalyses.length
        });

    } catch (error) {
        logger.error("Error getting analyses by exercise:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch analyses",
            error: error.message
        });
    }
};

/**
 * Get analysis statistics
 */
const getUserAnalysisStats = async (req, res) => {
    try {
        const userId = req.user.uid;

        // Get user's database ID
        const userDbInfo = await getUserIdByFirebaseId(userId);
        if (!userDbInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        logger.info(`Fetching analysis stats for user ${userId}`);

        const stats = await getAnalysisStats(userDbInfo.id);

        res.json({
            success: true,
            stats: {
                totalAnalyses: parseInt(stats.total_analyses),
                averageScore: parseFloat(stats.average_score)?.toFixed(1) || 0,
                bestScore: parseInt(stats.best_score) || 0,
                worstScore: parseInt(stats.worst_score) || 0,
                breakdown: {
                    good: parseInt(stats.good_count),
                    warning: parseInt(stats.warning_count),
                    critical: parseInt(stats.critical_count)
                }
            }
        });

    } catch (error) {
        logger.error("Error getting analysis stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: error.message
        });
    }
};

module.exports = {
    createNewAnalysis,
    getUserAnalyses,
    getAnalysisDetails,
    deleteUserAnalysis,
    getRecentUserAnalyses,
    getAnalysesByExerciseType,
    getUserAnalysisStats
};