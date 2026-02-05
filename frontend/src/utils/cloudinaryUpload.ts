import axios from 'axios';
import { cloudinaryConfig } from '../config/cloudinary';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  duration: number; // Video duration in seconds
  width: number;
  height: number;
}

/**
 * Upload video to Cloudinary and return URL with metadata
 */
export const uploadVideoToCloudinary = async (
  videoUri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    console.log('🔵 Uploading video to Cloudinary...');
    console.log('📁 Local URI:', videoUri);
    console.log('📁 Target Folder:', cloudinaryConfig.folder);

    const formData = new FormData();
    
    formData.append('file', {
      uri: videoUri,
      type: 'video/mp4',
      name: `analysis_${Date.now()}.mp4`,
    } as any);

    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', cloudinaryConfig.folder);
    formData.append('resource_type', 'video');
    formData.append('tags', 'ai-analysis,form-check');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const percentage = Math.round((loaded * 100) / total);
            
            console.log(`📤 Upload Progress: ${percentage}%`);
            
            if (onProgress) {
              onProgress({ loaded, total, percentage });
            }
          }
        },
        timeout: 120000,
      }
    );

    const result: UploadResult = {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      format: response.data.format,
      duration: Math.round(response.data.duration || 0), // Duration in seconds
      width: response.data.width,
      height: response.data.height,
    };

    console.log('✅ Video uploaded successfully');
    console.log('🔗 Cloudinary URL:', result.url);
    console.log('⏱️  Duration:', result.duration, 'seconds');

    return result;
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    throw new Error('Failed to upload video to Cloudinary');
  }
};