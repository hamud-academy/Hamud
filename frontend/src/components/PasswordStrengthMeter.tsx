import { passwordChecks, passwordScore } from "@/lib/password-strength";

type Props = {
  password: string;
  confirmPassword?: string;
  showMatch?: boolean;
};

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];

export default function PasswordStrengthMeter({ password, confirmPassword = "", showMatch = false }: Props) {
  const checks = passwordChecks(password);
  const score = passwordScore(password);
  const percent = (score / checks.length) * 100;
  const isComplete = score === checks.length;
  const matches = !showMatch || (confirmPassword.length > 0 && password === confirmPassword);

  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700">Password strength</span>
        <span className={`text-xs font-bold ${isComplete ? "text-emerald-700" : "text-amber-700"}`}>
          {STRENGTH_LABELS[score]}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            isComplete ? "bg-emerald-500" : score >= 3 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2 text-xs">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                check.passed ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {check.passed ? "✓" : "•"}
            </span>
            <span className={check.passed ? "text-slate-700" : "text-slate-500"}>{check.label}</span>
          </div>
        ))}
        {showMatch && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                matches ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}
            >
              {matches ? "✓" : "•"}
            </span>
            <span className={matches ? "text-slate-700" : "text-slate-500"}>Passwords match</span>
          </div>
        )}
      </div>
    </div>
  );
}
