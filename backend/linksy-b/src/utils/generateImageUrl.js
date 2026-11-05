import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client, s3BucketName } from "../config/s3.js";

export async function generateImageUrl(imageKey) {
  const command = new GetObjectCommand({
    Bucket: s3BucketName,
    Key: imageKey,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // URL expires in 5 minutes
  });

  return url;
}
