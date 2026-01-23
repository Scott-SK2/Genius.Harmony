"""
Custom storage backends for AWS S3
"""
from storages.backends.s3boto3 import S3Boto3Storage


class MediaStorage(S3Boto3Storage):
    """
    Storage backend for media files with signed URLs
    Compatible with existing public-read files
    """
    location = ''  # Store at root of bucket
    file_overwrite = False
    default_acl = 'public-read'  # Keep public-read for compatibility with existing files
    querystring_auth = True  # Generate signed URLs for security
    querystring_expire = 3600  # URLs expire after 1 hour
    custom_domain = None  # Use S3 domain with signed URLs, not custom domain
