import { setValue, getValue, deleteValue } from "../utils/redisUtils.js";
import { getPendingUploadKey } from "../utils/redisKeyGen.js";

export const UPLOAD_TTL_SECONDS = 15 * 60 * 10;

export function savePendingUpload(token, imageKey) {
  console.log("save pending image", token, imageKey);
  return setValue(getPendingUploadKey(token), imageKey, UPLOAD_TTL_SECONDS);
}

export function getPendingUpload(token) {
  console.log("get image", token);
  return getValue(getPendingUploadKey(token));
}

export function deletePendingUpload(token) {
  return deleteValue(getPendingUploadKey(token));
}
