import {
  getValue,
  incrementValue,
  setValue,
  setValueIfNotExists,
} from "../utils/redisUtils.js";
import { getPublicUsersCacheVersionKey } from "../utils/redisKeyGen.js";

export const PUBLIC_USERS_CACHE_TTL_SECONDS = 300;

export const getPublicUsersCacheVersion = async () => {
  const versionKey = getPublicUsersCacheVersionKey();
  const version = await getValue(versionKey);

  if (version !== null) {
    return version;
  }

  await setValueIfNotExists(versionKey, "1");
  return (await getValue(versionKey)) || "1";
};

export const getPublicUsersCache = async (cacheKey) => {
  const cached = await getValue(cacheKey);
  return cached ? JSON.parse(cached) : null;
};

export const setPublicUsersCache = async (cacheKey, data) => {
  await setValue(
    cacheKey,
    JSON.stringify(data),
    PUBLIC_USERS_CACHE_TTL_SECONDS,
  );
};

export const invalidatePublicUsersCache = async () => {
  await incrementValue(getPublicUsersCacheVersionKey());
};
