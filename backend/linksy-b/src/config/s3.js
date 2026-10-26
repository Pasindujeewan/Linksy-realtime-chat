import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

export const s3BucketName = env.AWS_S3_BUCKET;

export const s3Client = new S3Client({
  region: env.AWS_REGION,
});

export async function checkS3Connection() {
  console.log("ckeck S3");
  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: s3BucketName,
      }),
    );

    console.log("✅ AWS S3 connected successfully");
  } catch (error) {
    console.error("❌ AWS S3 connection failed:", error.message);
    throw error;
  }
}
