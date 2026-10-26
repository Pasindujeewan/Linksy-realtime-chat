import { setValue, getValue, deleteValue } from "../utils/redisUtils.js";

export const UPLOAD_TTL_SECONDS = 15 * 60;

const getPendingUploadKey = (token) => `pending-profile-upload:${token}`;

export function savePendingUpload(token, imageKey) {
  return setValue(getPendingUploadKey(token), imageKey, UPLOAD_TTL_SECONDS);
}

export function getPendingUpload(token) {
  return getValue(getPendingUploadKey(token));
}

export function deletePendingUpload(token) {
  return deleteValue(getPendingUploadKey(token));
}
