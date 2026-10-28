import type {
  RegisterFieldErrors,
  RegisterFields,
} from "./registerTypes";

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function createInitialRegisterValues(): RegisterFields {
  return {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    imageToken: "",
    bio: "",
  };
}

export function validateRegisterFields(
  values: RegisterFields,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(values.username.trim())) {
    errors.username = "Use 3–20 letters, numbers, or underscores.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.password.length < 8 || values.password.length > 128) {
    errors.password = "Password must be between 8 and 128 characters.";
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match.";
  }
  if (!values.imageToken) {
    errors.avatarFile = "Choose a profile picture.";
  }
  if (values.bio && values.bio.length > 160) {
    errors.bio = "Keep your bio under 160 characters.";
  }

  return errors;
}
