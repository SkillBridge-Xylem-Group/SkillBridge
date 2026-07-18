import { Star, MessageSquare } from "lucide-react";
import type { Review } from "@/lib/types/profile";

type ReviewsCardProps = {
  reviews: Review[];
};

// FR-010: rating + written review shown on the reviewed user's profile.
export default function ReviewsCard({ reviews }: ReviewsCardProps) {
  return (
    <div className="nb-card p-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: "var(--sb-gradient)" }}
        >
          <Star size={18} />
        </div>
        <h2 className="text-lg font-extrabold nb-heading" style={{ color: "var(--sb-ink)" }}>Reviews</h2>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-4 py-8 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white"
            style={{ background: "var(--sb-gradient)" }}
          >
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--sb-ink)" }}>No reviews yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--sb-muted)" }}>
              Complete your first skill swap to receive reviews
              <br className="hidden sm:block" /> and build your Trust Score.
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
                {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}