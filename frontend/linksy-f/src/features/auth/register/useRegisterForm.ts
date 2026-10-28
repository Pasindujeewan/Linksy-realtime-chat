import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  registerUser,
  uploadProfileImage,
} from "../../../services/authService";
import { useUser } from "../../../contexts/UserContext";
import { useToast } from "../../../contexts/ToastContext";
import { useNavigate } from "react-router";
import {
  ALLOWED_AVATAR_TYPES,
  createInitialRegisterValues,
  MAX_AVATAR_SIZE,
  validateRegisterFields,
} from "./registerValidation";
import type {
  AvatarUploadStatus,
  RegisterFieldErrors,
  RegisterFields,
} from "./registerTypes";

export function useRegisterForm() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useUser();
  const toast = useToast();
  const [values, setValues] = useState(createInitialRegisterValues);
  const [errors, setErrors] = useState<RegisterFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarStatus, setAvatarStatus] =
    useState<AvatarUploadStatus>("idle");
  const avatarUploadRequest = useRef(0);

  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );

  useEffect(
    () => () => {
      avatarUploadRequest.current += 1;
    },
    [],
  );

  function update<K extends keyof RegisterFields>(
    key: K,
    value: RegisterFields[K],
  ) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);

    if (key === "password" || key === "confirmPassword") {
      setErrors((currentErrors) => ({
        ...currentErrors,
        password:
          nextValues.password.length > 0 &&
          (nextValues.password.length < 8 || nextValues.password.length > 128)
            ? "Password must be between 8 and 128 characters."
            : undefined,
        confirmPassword:
          nextValues.confirmPassword.length > 0 &&
          nextValues.confirmPassword !== nextValues.password
            ? "Passwords don't match."
            : undefined,
      }));
      return;
    }

    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const requestId = ++avatarUploadRequest.current;
    setAvatarStatus("idle");
    setAvatarPreview("");
    setErrors((current) => ({ ...current, avatarFile: undefined }));
    update("imageToken", "");

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setErrors((current) => ({
        ...current,
        avatarFile: "Choose a JPG, PNG, WEBP, or GIF image.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((current) => ({
        ...current,
        avatarFile: "Image must be 5 MB or smaller.",
      }));
      event.target.value = "";
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarStatus("uploading");
    event.target.value = "";

    try {
      const imageToken = await uploadProfileImage(file);
      if (requestId !== avatarUploadRequest.current) return;

      update("imageToken", imageToken);
      setAvatarStatus("uploaded");
    } catch (error) {
      if (requestId !== avatarUploadRequest.current) return;

      const message =
        error instanceof Error
          ? error.message
          : "We couldn't upload your profile picture. Please try again.";
      setAvatarStatus("idle");
      toast.error(message);
      setErrors((current) => ({ ...current, avatarFile: message }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (avatarStatus === "uploading") return;

    const nextErrors = validateRegisterFields(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Please review the highlighted fields before continuing.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Password confirmation is client-side only and is not part of the API payload.
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const registeredUser = await registerUser({
        ...payload,
        username: payload.username.trim(),
        email: payload.email.trim(),
      });

      setAuthenticatedUser(registeredUser);
      toast.success("Your account is ready. Welcome to Linksy!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    avatarPreview,
    avatarStatus,
    errors,
    handleAvatarChange,
    handleSubmit,
    isSubmitting,
    update,
    values,
  };
}
