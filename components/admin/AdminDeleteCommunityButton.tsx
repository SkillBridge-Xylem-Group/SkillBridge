"use client";

import { useState, useTransition } from "react";
import { adminDeleteCommunityAction } from "@/lib/actions/admin";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type AdminDeleteCommunityButtonProps = {
  communityId: string;
  title: string;
  isOfficial: boolean;
};

export default function AdminDeleteCommunityButton({
  communityId,
  title,
  isOfficial,
}: AdminDeleteCommunityButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteCommunityAction({ communityId });
      if (result?.error) setError(result.error);
      else setDeleted(true);
      setShowConfirm(false);
    });
  }

  if (deleted) {
    return <span className="text-xs font-semibold text-slate-400">Deleted</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={isPending}
        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <ConfirmDialog
        open={showConfirm}
        title="Delete this community?"
        description={
          isOfficial
            ? `"${title}" is a built-in community. Deleting it will remove it for everyone and move its posts to General. This can't be undone.`
            : `"${title}" will be permanently removed. Its posts will be moved to General. This can't be undone.`
        }
        confirmLabel="Delete"
        danger
        busy={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}