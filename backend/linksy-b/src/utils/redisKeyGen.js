// This module provides a utility function to generate Redis keys for pending profile uploads.

// getPendingUploadKey generates a Redis key for storing pending profile uploads based on the provided token.
export const getPendingUploadKey = (token) => `pending-profile-upload:${token}`;

export const getUsersRedisKey = (userId, page, limit = 10, version) =>
  `users:public:${userId}:${page}:${limit}:${version}`;

export const getPublicUsersCacheVersionKey = () => "users:public:version";
