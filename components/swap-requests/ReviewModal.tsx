"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Star, X } from "lucide-react";
import { submitSessionReviewAction } from "@/lib/actions/reviews";

type ReviewModalProps = {
  open: boolean;
  sessionRequestId: string;
  partner: { id: string; fullname: string };
  onClose: () => void;
  onSubmitted: () => void;
};

export default function ReviewModal({
  open,
  sessionRequestId,
  partner,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }

    startTransition(async () => {
      const result = await submitSessionReviewAction({
        sessionRequestId,
        reviewedUserId: partner.id,
        rating,
        comment,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setRating(0);
      setComment("");
      onSubmitted();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-labelledby="review-modal-title"
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="review-modal-title" className="text-lg font-extrabold text-slate-900">
              Rate your session
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              How was your skill swap with <span className="font-semibold text-slate-700">{partner.fullname}</span>?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Rating</p>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const value = i + 1;
                const filled = value <= (hovered || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(value)}
                    className="rounded p-0.5"
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  >
                    <Star
                      size={28}
                      className={filled ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Review
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Share what went well or what could improve…"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand/50"
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              Later
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {isPending ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
