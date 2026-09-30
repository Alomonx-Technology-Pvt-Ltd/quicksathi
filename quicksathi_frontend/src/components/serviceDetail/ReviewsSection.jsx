import SectionHeader from "./SectionHeader";
import { Star, CheckCircle2 } from "lucide-react";

const ReviewsSection = ({ reviews = [], totalReviews }) => {
  if (!reviews?.length) return null;

  return (
    <div id="reviews-section" className="scroll-mt-24">
      <SectionHeader
        title={`Verified Customer Reviews (${(totalReviews ?? reviews.length).toLocaleString("en-IN")})`}
        subtitle="Genuine feedback from customers in your city"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reviews.map((review, idx) => {
          const userName =
            typeof review.user === "string"
              ? review.user
              : review.user?.name || review.userName || "Verified Customer";
          const initial = userName ? userName.charAt(0).toUpperCase() : "U";

          return (
            <div
              key={review.id || review._id || idx}
              className="p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 m-0">
                        {userName}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        Verified Booking
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-xs font-bold text-amber-700">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{review.rating || 5}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed m-0 italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{review.date || "Recent Service"}</span>
                <span>Bihar, India</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewsSection;
