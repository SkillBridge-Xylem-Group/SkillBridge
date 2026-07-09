import { Star, MessageSquare } from "lucide-react";
import type { Review } from "@/lib/types/profile";

type ReviewsCardProps = {
  reviews: Review[];
};

// FR-010: rating + written review shown on the reviewed user's profile.
export default function ReviewsCard({ reviews }: ReviewsCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star size={18} />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Reviews</h2>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">No reviews yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Complete your first skill swap to receive reviews
              <br className="hidden sm:block" /> and build your Trust Score.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((review) => (
            <div key={review.review_id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{review.reviewer_fullname}</p>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-amber-400" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}