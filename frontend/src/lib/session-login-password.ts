const STORAGE_KEY = "hamud_session_login_password";

type StoredLoginPassword = {
  email: string;
  password: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Remember login password for this browser tab (used to pre-fill change-password). */
export function saveSessionLoginPassword(email: string, password: string): void {
  if (typeof window === "undefined" || !password) return;
  try {
    const payload: StoredLoginPassword = {
      email: normalizeEmail(email),
      password,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* sessionStorage unavailable */
  }
}

export function readSessionLoginPassword(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLoginPassword;
    if (parsed.email !== normalizeEmail(email)) return null;
    return parsed.password || null;
  } catch {
    return null;
  }
}

export function clearSessionLoginPassword(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
