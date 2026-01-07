import os
import boto3
import logging
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
from moviepy.editor import VideoFileClip
import time

logger = logging.getLogger(__name__)

class StorageManager:
    def __init__(self, bucket_name="school-attendance-proofs", region="us-east-1"):
        self.bucket_name = bucket_name
        # Use mocked client if credentials not present
        try:
            self.s3_client = boto3.client('s3', region_name=region)
        except Exception:
            self.s3_client = None
            logger.warning("AWS Credentials not found. S3 uploads will be mocked.")

    def create_evidence_clip(self, original_video_path, timestamp_seconds, output_path):
        """
        Cuts a 5-second clip (2s before, 3s after timestamp)
        """
        try:
            start_time = max(0, timestamp_seconds - 2)
            end_time = timestamp_seconds + 3

            # Using ffmpeg_tools for efficiency (avoids re-encoding if possible, though exact frame cut depends on keyframes)
            # Or use VideoFileClip for precision
            with VideoFileClip(original_video_path) as video:
                # Ensure end_time doesn't exceed duration
                if end_time > video.duration:
                    end_time = video.duration

                new = video.subclip(start_time, end_time)
                new.write_videofile(output_path, codec="libx264", audio_codec="aac", logger=None)

            return output_path
        except Exception as e:
            logger.error(f"Error creating clip: {e}")
            return None

    def upload_to_s3(self, file_path, object_name=None):
        if object_name is None:
            object_name = os.path.basename(file_path)

        if self.s3_client:
            try:
                self.s3_client.upload_file(file_path, self.bucket_name, object_name)
                url = f"https://{self.bucket_name}.s3.amazonaws.com/{object_name}"
                return url
            except Exception as e:
                logger.error(f"S3 Upload failed: {e}")
                return None
        else:
            logger.info(f"Mock S3 Upload: {file_path} -> {object_name}")
            return f"https://mock-s3.com/{object_name}"

    def cleanup_old_files(self, directory, max_age_seconds=86400): # 24 hours
        """
        Deletes files older than max_age_seconds
        """
        now = time.time()
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                file_age = now - os.path.getmtime(file_path)
                if file_age > max_age_seconds:
                    try:
                        os.remove(file_path)
                        logger.info(f"Deleted old file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error deleting file {file_path}: {e}")
