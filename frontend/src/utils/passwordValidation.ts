export const PASSWORD_MIN_LENGTH = 6;

// Shared react-hook-form rules for every password field (Signup, Reset
// Password, Change Password). Each `validate` entry runs in order and
// react-hook-form surfaces the first failing message — so "too short" and
// "no number" show as distinct, specific errors rather than one generic one.
export const passwordValidationRules = {
  required: "Password is required",
  validate: {
    hasMinLength: (value: string) =>
      value.length >= PASSWORD_MIN_LENGTH ||
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    hasNumber: (value: string) =>
      /\d/.test(value) || "Password must include at least one number",
  },
};
