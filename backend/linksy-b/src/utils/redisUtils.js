import { redisClient } from "../config/redis.js";

// Utility functions for interacting with Redis

export async function setValue(key, value, ttlSeconds) {
  await redisClient.set(key, value, { EX: ttlSeconds });
}

export async function setValueIfNotExists(key, value) {
  return (await redisClient.set(key, value, { NX: true })) === "OK";
}

export async function getValue(key) {
  return redisClient.get(key);
}

export async function incrementValue(key) {
  return redisClient.incr(key);
}

export async function deleteValue(key) {
  return redisClient.del(key);
}
