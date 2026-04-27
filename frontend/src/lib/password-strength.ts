export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lowercase", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function passwordChecks(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }));
}

export function passwordScore(password: string) {
  return passwordChecks(password).filter((check) => check.passed).length;
}

export function isStrongPassword(password: string) {
  return passwordScore(password) === PASSWORD_RULES.length;
}

export function strongPasswordMessage() {
  return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";
}
