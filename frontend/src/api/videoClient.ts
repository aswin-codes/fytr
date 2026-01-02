// src/api/videoClient.ts
import { getToken } from "@/src/utils/getToken";
import axios from "axios";

// Create a separate axios instance for video processing API
export const videoApiClient = axios.create({
    baseURL: 'https://fytr-1vpi.vercel.app', //'https://4g9s20f5-8000.inc1.devtunnels.ms',//
    timeout: 120000, // 2 minutes timeout for video processing
    headers: {
        'Accept': 'application/json',
    }
});

// Request interceptor to add auth token
videoApiClient.interceptors.request.use(async (config) => {
    console.log("📡 Video API Request:", config.method?.toUpperCase(), config.url);

    try {
        const token = await getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("✅ Token attached to video request");
        } else {
            console.warn("⚠️ No token available for video request");
        }
    } catch (error) {
        console.error("❌ Error getting token for video API request:", error);
        throw error;
    }

    return config;
}, (error) => {
    console.error("❌ Video request interceptor error:", error);
    return Promise.reject(error);
});

// Response interceptor for better error handling
videoApiClient.interceptors.response.use(
    (response) => {
        console.log("✅ Video API Response:", response.status, response.config.url);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error("❌ Video API Error Response:", {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        } else if (error.request) {
            console.error("❌ Video API No Response:", error.request);
        } else {
            console.error("❌ Video API Error:", error.message);
        }
        return Promise.reject(error);
    }
);

/**
 * Upload and analyze video
 * @param videoUri - Local file URI of the video
 * @param exercise - Exercise name (optional)
 * @param onProgress - Progress callback (0-1)
 */
export const analyzeVideo = async (
    videoUri: string,
    onProgress?: (progress: number) => void
) => {
    try {
        console.log("🎥 Starting video analysis...");
        console.log("Video URI:", videoUri);

        // Create FormData
        const formData = new FormData();
        
        // Add video file
        const videoFile = {
            uri: videoUri,
            type: 'video/mp4',
            name: 'exercise-video.mp4',
        } as any;
        
        formData.append('video', videoFile);
                

        console.log("📦 FormData prepared, uploading...");

        // Upload with progress tracking
        const response = await videoApiClient.post('/analyze-video', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = progressEvent.loaded / progressEvent.total;
                    console.log(`📤 Upload progress: ${(progress * 100).toFixed(0)}%`);
                    onProgress?.(progress);
                }
            },
        });

        console.log("✅ Video analysis complete:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Video analysis failed:", error);
        
        // Provide more specific error messages
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error || 'Video analysis failed';
            
            if (status === 413) {
                throw new Error('Video file is too large. Please compress it further.');
            } else if (status === 400) {
                throw new Error(message || 'Invalid video format or parameters.');
            } else if (status === 500) {
                throw new Error('Server error during video analysis. Please try again.');
            } else {
                throw new Error(message);
            }
        } else if (error.request) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(error.message || 'Failed to analyze video');
        }
    }
};

/**
 * Check video analysis status (if API supports async processing)
 */
export const checkAnalysisStatus = async (analysisId: string) => {
    try {
        const response = await videoApiClient.get(`/analysis-status/${analysisId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to check analysis status:", error);
        throw error;
    }
};