import User from "../models/user.model.js";
import { AppError } from "../errors/AppError.js";
import { getFirebaseAuth } from "../config/firebase.js";

const invalidFirebaseTokenCodes = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/user-disabled",
  "auth/user-not-found",
]);

const getAvailableUsername = async (displayName, email, uid) => {
  const baseUsername = (displayName || email.split("@")[0])
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
  const username = baseUsername.length >= 3 ? baseUsername : "googleuser";

  if (!(await User.exists({ username }))) {
    return username;
  }

  const suffix = `_${uid.slice(0, 7)}`;
  const uniqueUsername = `${username.slice(0, 20 - suffix.length)}${suffix}`;
  if (await User.exists({ username: uniqueUsername })) {
    throw new AppError(
      "Unable to create a unique username for this Google account",
      409,
      "USERNAME_UNAVAILABLE",
    );
  }

  return uniqueUsername;
};

const ensureActive = (user) => {
  if (!user.isActive) {
    throw new AppError("This account is inactive", 403, "ACCOUNT_INACTIVE");
  }

  return user;
};

export const authenticateGoogleUser = async (idToken) => {
  let decodedToken;

  try {
    decodedToken = await getFirebaseAuth().verifyIdToken(idToken, true);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (invalidFirebaseTokenCodes.has(error.code)) {
      throw new AppError(
        "Invalid or expired Firebase ID token",
        401,
        "INVALID_FIREBASE_TOKEN",
      );
    }

    throw error;
  }

  if (
    decodedToken.firebase?.sign_in_provider !== "google.com" ||
    !decodedToken.email ||
    decodedToken.email_verified !== true
  ) {
    throw new AppError(
      "A verified Google account is required",
      401,
      "INVALID_GOOGLE_ACCOUNT",
    );
  }

  const email = decodedToken.email.toLowerCase();
  const existingGoogleUser = await User.findOne({
    googleId: decodedToken.uid,
  }).lean();

  if (existingGoogleUser) {
    return ensureActive(existingGoogleUser);
  }

  if (await User.exists({ email })) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "ACCOUNT_ALREADY_EXISTS",
    );
  }

  const username = await getAvailableUsername(
    decodedToken.name,
    email,
    decodedToken.uid,
  );

  try {
    const user = await User.create({
      username,
      email,
      authProvider: "google",
      googleId: decodedToken.uid,
    });

    return user;
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const concurrentlyCreatedUser = await User.findOne({
      googleId: decodedToken.uid,
    }).lean();

    if (concurrentlyCreatedUser) {
      return ensureActive(concurrentlyCreatedUser);
    }

    const conflictingEmailUser = await User.exists({ email });
    if (conflictingEmailUser) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "ACCOUNT_ALREADY_EXISTS",
      );
    }

    throw new AppError(
      "Unable to create a unique username for this Google account",
      409,
      "USERNAME_UNAVAILABLE",
    );
  }
};
