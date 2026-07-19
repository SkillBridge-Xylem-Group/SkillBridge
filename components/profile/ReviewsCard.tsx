"use client";

import { Star, MessageSquare } from "lucide-react";
import type { Review } from "@/lib/types/profile";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { formatAppDate } from "@/lib/i18n/locales";

type ReviewsCardProps = {
  reviews: Review[];
};

export default function ReviewsCard({ reviews }: ReviewsCardProps) {
  const { locale, dictionary } = useLocale();
  const p = dictionary.profile;

  return (
    <div className="nb-card p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: "var(--sb-gradient)" }}
        >
          <Star size={18} />
        </div>
        <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>{p.reviews}</h2>
      </div>

      {reviews.length === 0 ? (
        <div
          className="mt-4 flex items-center gap-4 rounded-2xl p-4"
          style={{ background: "#f6fffb" }}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: "var(--sb-gradient)" }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{p.noReviews}</p>
            <p className="text-sm" style={{ color: "var(--sb-muted)" }}>
              {p.noReviewsHint}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((review) => (
            <div key={review.review_id} className="rounded-2xl p-4" style={{ boxShadow: "var(--sb-shadow-sm)" }}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>{review.reviewer_fullname}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-emerald-500 text-emerald-500" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--sb-muted)" }}>{review.comment}</p>
              <p className="mt-2 text-xs" style={{ color: "var(--sb-muted)" }}>
                {formatAppDate(review.created_at, locale, { month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
