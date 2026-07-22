import SectionHeader from "./SectionHeader";
import Stars from "./Stars";

const ReviewsSection = ({ reviews, totalReviews }) => {
  if (!reviews?.length) return null;

  return (
    <div>
      <SectionHeader title={`Reviews (${totalReviews ?? reviews.length})`} />

      <div className="flex flex-col gap-4">
        {reviews.map((review, idx) => {
          const userName =
            typeof review.user === "string"
              ? review.user
              : review.user?.name || review.userName || "User";
          const initial = userName ? userName.charAt(0).toUpperCase() : "U";

          return (
            <div
              key={review.id || review._id || idx}
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: "var(--color-bg-white)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {initial}
                </div>

                <div>
                  <p
                    className="font-semibold text-sm m-0"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {userName}
                  </p>

                  <Stars rating={review.rating} />
                </div>
              </div>

              <p
                className="text-sm italic m-0 leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-mid)",
                }}
              >
                "{review.comment}"
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewsSection;
