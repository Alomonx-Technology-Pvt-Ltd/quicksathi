import { useNavigate } from "react-router-dom";

const BookingCard = ({ service, pkg }) => {
  const navigate = useNavigate();

  return (
    <div
      className="static lg:sticky lg:top-24 rounded-2xl sm:rounded-3xl border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5"
      style={{
        backgroundColor: "var(--color-bg-white)",
        borderColor: "var(--color-border)",
        boxShadow: "0 8px 40px rgba(44,24,16,0.08)",
      }}
    >
      {/* Selected Package */}
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            letterSpacing: "0.1em",
          }}
        >
          Selected Package
        </p>

        <h3
          className="text-base sm:text-lg font-normal m-0 mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-dark)",
          }}
        >
          {pkg?.title ?? service.name}
        </h3>

        <p
          className="text-2xl sm:text-3xl font-bold m-0"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
          }}
        >
          ₹{(pkg?.price ?? service.startingPrice)?.toLocaleString()}
        </p>

        <p
          className="text-xs mt-1 m-0"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
          }}
        >
          {service.priceUnit}
        </p>
      </div>

      {/* Features */}
      {pkg?.features && (
        <ul
          className="m-0 p-0 list-none flex flex-col gap-2 border-t border-b py-3 sm:py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          {pkg.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-xs sm:text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-mid)",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>

              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Service Mode */}
      <div
        className="flex items-center gap-2 text-xs sm:text-sm"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-mid)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>

        {service.serviceMode?.replace(/_/g, " ")}
      </div>

      {/* Book Button */}
      <button
        onClick={() =>
          navigate(
            `/booking/${service.id || service._id}?name=${encodeURIComponent(
              service.name
            )}&package=${encodeURIComponent(
              pkg?.title ?? ""
            )}&price=${pkg?.price ?? service.startingPrice}`
          )
        }
        className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold border-0 cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "var(--color-primary)",
          color: "#fff",
          boxShadow: "0 6px 24px rgba(139,26,26,0.30)",
        }}
      >
        Book Now
      </button>

      {/* Contact Button */}
      <button
        className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border cursor-pointer transition-all duration-200 hover:opacity-80"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "transparent",
          color: "var(--color-text-dark)",
          borderColor: "var(--color-border)",
        }}
      >
        Contact Provider
      </button>
    </div>
  );
};

export default BookingCard;