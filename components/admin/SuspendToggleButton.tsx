"use client";

import { useState, useTransition } from "react";
import { setUserSuspensionAction } from "@/lib/actions/admin";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type SuspendToggleButtonProps = {
  userId: string;
  isSuspended: boolean;
};

export default function SuspendToggleButton({ userId, isSuspended }: SuspendToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await setUserSuspensionAction({ userId, suspend: !isSuspended });
      if (result?.error) setError(result.error);
      setShowConfirm(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
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

      <ConfirmDialog
        open={showConfirm}
        title={isSuspended ? "Reactivate this account?" : "Suspend this account?"}
        description={
          isSuspended
            ? "They'll be able to log in again immediately."
            : "They won't be able to log in until you reactivate them."
        }
        confirmLabel={isSuspended ? "Reactivate" : "Suspend"}
        danger={!isSuspended}
        busy={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}