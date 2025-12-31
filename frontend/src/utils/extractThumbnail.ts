import * as VideoThumbnails from 'expo-video-thumbnails';

export const generateThumbnail  = async (videoUrl: string) => {
    try {
        console.log("Getting image URL")
      const { uri } = await VideoThumbnails.getThumbnailAsync(
        videoUrl,
        {
          time: 1000,
        }
      );
      console.log(uri)
      return uri;
    } catch (e) {
      console.warn(e);
    }
  };