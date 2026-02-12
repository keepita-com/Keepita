import boto3
from botocore.client import Config
from django.conf import settings

def generate_presigned_url(file_field, expires_in=120):
    if not file_field:
        return None

    try:
        s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_MINAIO_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1',
        )

        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                'Key': file_field.name,
            },
            ExpiresIn=expires_in,
        )
        return url
    except Exception:
        return None
