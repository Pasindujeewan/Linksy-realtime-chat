import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../../contexts/ToastContext";
import { useUser } from "../../../contexts/UserContext";
import { loginUser } from "../../../services/authService";
import {
  validateLoginFields,
  type LoginFieldErrors,
  type LoginFields,
} from "./loginValidation";

const initialValues: LoginFields = { email: "", password: "" };

export function useLoginForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuthenticatedUser } = useUser();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof LoginFields>(
    key: K,
    value: LoginFields[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLoginFields(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Enter a valid email address and password to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });
      setAuthenticatedUser(user);
      toast.success("You’re signed in. Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't log you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    update("email", event.target.value);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    update("password", event.target.value);
  }

  return {
    errors,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    isSubmitting,
    values,
  };
}
