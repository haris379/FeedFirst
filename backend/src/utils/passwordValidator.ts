// Centralized password rules — used by every flow that creates or changes a
// user's password (register, reset-password, and any future change-password
// endpoint) so the rule is defined and updated in exactly one place.
export const PASSWORD_MIN_LENGTH = 6;

export const validatePassword = (password: string): string | null => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (!/\d/.test(password)) {
    return "Password must include at least one number";
  }
  return null;
};
