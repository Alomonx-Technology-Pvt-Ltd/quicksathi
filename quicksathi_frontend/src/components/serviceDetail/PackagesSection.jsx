import SectionHeader from "./SectionHeader";

const PackagesSection = ({ packages, selectedPkg, setSelectedPkg }) => {
  if (!packages?.length) return null;

  return (
    <div>
      <SectionHeader title="Packages" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {packages.map((p, i) => (
          <button
            key={p.id || p._id || i}
            onClick={() => setSelectedPkg(i)}
            className="relative text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: "var(--font-body)",
              backgroundColor:
                i === selectedPkg
                  ? "var(--color-primary)"
                  : "var(--color-bg-white)",
              borderColor:
                i === selectedPkg
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              boxShadow:
                i === selectedPkg
                  ? "0 8px 24px rgba(139,26,26,0.25)"
                  : "0 2px 8px rgba(44,24,16,0.05)",
            }}
          >
            {p.recommended && (
              <span
                className="absolute -top-2 -right-2 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full"
                style={{
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--color-accent)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                Best Value
              </span>
            )}

            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
              <h3
                className="text-sm sm:text-base font-semibold m-0"
                style={{
                  color: i === selectedPkg ? "#fff" : "var(--color-text-dark)",
                }}
              >
                {p.title}
              </h3>

              <span
                className="text-base sm:text-lg font-bold flex-shrink-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color:
                    i === selectedPkg ? "#fff" : "var(--color-primary)",
                }}
              >
                ₹{p.price?.toLocaleString()}
              </span>
            </div>

            <ul className="m-0 p-0 list-none flex flex-col gap-1 sm:gap-1.5">
              {p.features?.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  style={{
                    color:
                      i === selectedPkg
                        ? "rgba(255,255,255,0.80)"
                        : "var(--color-text-mid)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={
                      i === selectedPkg
                        ? "rgba(255,255,255,0.8)"
                        : "var(--color-primary)"
                    }
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default PackagesSection;