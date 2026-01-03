const cloudinary = require('../config/cloudinary');
const logger = require('./logger');

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/ddkpclbs2/video/upload/v1234567890/ai-form-analysis/videos/video_1234567890.mp4
 * Returns: ai-form-analysis/videos/video_1234567890
 */
function extractPublicIdFromUrl(url) {
    try {
        if (!url || !url.includes('cloudinary.com')) {
            return null;
        }

        // Match pattern: /upload/v{version}/{public_id}.{extension}
        const regex = /\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            const publicId = match[1];
            logger.info(`Extracted public_id: ${publicId}`);
            return publicId;
        }

        return null;
    } catch (error) {
        logger.error('Error extracting public_id:', error);
        return null;
    }
}

/**
 * Delete video from Cloudinary
 */
async function deleteVideoFromCloudinary(videoUrl) {
    try {
        const publicId = extractPublicIdFromUrl(videoUrl);
        
        if (!publicId) {
            logger.warn('Could not extract public_id from URL:', videoUrl);
            return { success: false, message: 'Invalid Cloudinary URL' };
        }

        logger.info(`Deleting video from Cloudinary: ${publicId}`);

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
            invalidate: true // Invalidate CDN cache
        });

        logger.info('Cloudinary deletion result:', result);

        if (result.result === 'ok' || result.result === 'not found') {
            logger.info(`Video deleted successfully: ${publicId}`);
            return { success: true, result: result.result };
        } else {
            logger.warn('Cloudinary deletion failed:', result);
            return { success: false, result: result.result };
        }
    } catch (error) {
        logger.error('Error deleting video from Cloudinary:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    extractPublicIdFromUrl,
    deleteVideoFromCloudinary
};