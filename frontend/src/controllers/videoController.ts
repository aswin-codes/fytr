// src/controllers/videoController.ts
import { analyzeVideo } from "@/src/api/videoClient";
import { AiAnalysis } from "@/src/types/aiAnalysisTypes";

/**
 * Process and analyze video file
 * @param videoUri - Local file URI of the compressed video
 * @param exercise - Exercise name (optional, leave empty for auto-detect)
 * @param onProgress - Progress callback for upload (0-1)
 * @returns AiAnalysis object with results
 */
export const processVideoAnalysis = async (
    videoUri: string,
    exercise?: string,
    onProgress?: (progress: number) => void
): Promise<AiAnalysis> => {
    try {
        console.log("🎬 Video Controller: Starting video processing...");
        console.log("Video URI:", videoUri);
        console.log("Exercise:", exercise || "Auto-detect");

        // Call the API to analyze video
        const result = await analyzeVideo(videoUri, exercise, onProgress);

        console.log("✅ Video Controller: Analysis complete");
        console.log("Result:", JSON.stringify(result, null, 2));

        // Validate response structure
        if (!result || !result.id) {
            throw new Error("Invalid response from video analysis API");
        }

        // Transform API response to AiAnalysis type if needed
        const analysis: AiAnalysis = {
            id: result.id,
            exercise: result.exercise,
            recordedAt: result.recordedAt,
            durationSeconds: result.durationSeconds,
            score: result.score,
            verdict: result.verdict,
            status: result.status,
            videoUrl: result.videoUrl || videoUri, // Use uploaded URL or local URI as fallback
            positives: result.positives || [],
            improvements: result.improvements || [],
            aiCoachTip: result.aiCoachTip || "",
            actions: {
                canSave: result.actions?.canSave ?? true,
                canDelete: result.actions?.canDelete ?? true,
                isCurrent: result.actions?.isCurrent ?? true,
            }
        };

        return analysis;
    } catch (error: any) {
        console.error("❌ Video Controller: Processing failed:", error);
        
        // Re-throw with more context
        if (error.message) {
            throw error;
        } else {
            throw new Error("Failed to process video. Please try again.");
        }
    }
};

/**
 * Validate video file before processing
 * @param videoUri - Local file URI
 * @param maxSizeMB - Maximum file size in MB
 */
export const validateVideoFile = async (
    videoUri: string,
    maxSizeMB: number = 3.5
): Promise<{ valid: boolean; error?: string; sizeMB?: number }> => {
    try {
        // Import FileSystem dynamically to avoid import errors
        const FileSystem = require('expo-file-system').default;
        
        const fileInfo = await FileSystem.getInfoAsync(videoUri);
        
        if (!fileInfo.exists) {
            return {
                valid: false,
                error: "Video file not found"
            };
        }

        const sizeMB = fileInfo.size / (1024 * 1024);
        console.log(`📊 Video file size: ${sizeMB.toFixed(2)} MB`);

        if (sizeMB > maxSizeMB) {
            return {
                valid: false,
                error: `Video file is too large (${sizeMB.toFixed(2)} MB). Maximum size is ${maxSizeMB} MB.`,
                sizeMB
            };
        }

        return {
            valid: true,
            sizeMB
        };
    } catch (error) {
        console.error("❌ Video validation failed:", error);
        return {
            valid: false,
            error: "Failed to validate video file"
        };
    }
};

/**
 * Get human-readable status message
 */
export const getStatusMessage = (status: string): string => {
    const statusMessages: { [key: string]: string } = {
        'good': 'Great form!',
        'fair': 'Room for improvement',
        'poor': 'Needs attention',
        'excellent': 'Perfect form!',
    };
    
    return statusMessages[status.toLowerCase()] || 'Analysis complete';
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
        'good': '#22C55E',
        'excellent': '#22C55E',
        'fair': '#F59E0B',
        'poor': '#EF4444',
    };
    
    return statusColors[status.toLowerCase()] || '#6B7280';
};