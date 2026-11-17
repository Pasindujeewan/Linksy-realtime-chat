// This module provides a utility function to generate Redis keys for pending profile uploads.

// getPendingUploadKey generates a Redis key for storing pending profile uploads based on the provided token.
export const getPendingUploadKey = (token) => `pending-profile-upload:${token}`;

// this function for generating a Redis key for storing public user data based on the provided page number and limit.
export const getUsersRedisKey = (page, limit = 10, version) =>
  `users:public:${page}:${limit}:${version}`;
