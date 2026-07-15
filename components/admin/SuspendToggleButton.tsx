"use client";

import { useState, useTransition } from "react";
import { setUserSuspensionAction } from "@/lib/actions/admin";

type SuspendToggleButtonProps = {
  userId: string;
  isSuspended: boolean;
};

export default function SuspendToggleButton({ userId, isSuspended }: SuspendToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const confirmed = isSuspended
      ? window.confirm("Reactivate this account?")
      : window.confirm(
          "Suspend this account? They won't be able to log in until you reactivate them."
        );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await setUserSuspensionAction({ userId, suspend: !isSuspended });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
          isSuspended
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-red-50 text-red-600 hover:bg-red-100"
        }`}
      >
        {isPending ? "Saving..." : isSuspended ? "Reactivate" : "Suspend"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}