import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { s3Client, s3BucketName } from "../config/s3.js";

export async function uploadImageToS3({ key, file }) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3BucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );
}

export async function deleteImageFromS3(key) {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: s3BucketName,
      Key: key,
    }),
  );
}
