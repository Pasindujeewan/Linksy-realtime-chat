export interface LoginFields {
  email: string;
  password: string;
}

export type LoginFieldErrors = Partial<Record<keyof LoginFields, string>>;

export function validateLoginFields(values: LoginFields): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.password.length < 8 || values.password.length > 128) {
    errors.password = "Password must be between 8 and 128 characters.";
  }

  return errors;
}
