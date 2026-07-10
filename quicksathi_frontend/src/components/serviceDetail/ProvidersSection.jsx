import SectionHeader from "./SectionHeader";
import Stars from "./Stars";

const ProvidersSection = ({ providers }) => {
  if (!providers?.length) return null;

  return (
    <div>
      <SectionHeader title="Service Providers" />

      <div className="flex flex-col gap-4">
        {providers.map((provider, idx) => (
          <div
            key={provider.id || provider._id || idx}
            className="flex items-center gap-5 p-5 rounded-2xl border"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
              boxShadow: "0 2px 8px rgba(44,24,16,0.05)",
            }}
          >
            <img
              src={provider.image}
              alt={provider.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              style={{ border: "3px solid var(--color-border)" }}
            />

            <div className="flex-1">
              <p
                className="font-semibold m-0 mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                  fontSize: "16px",
                }}
              >
                {provider.name}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Stars rating={provider.rating} />

                <span
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {provider.rating} rating
                </span>

                <span style={{ color: "var(--color-accent)" }}>·</span>

                <span
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {provider.experience} exp
                </span>

                <span style={{ color: "var(--color-accent)" }}>·</span>

                <span
                  className="text-xs"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {provider.location}
                </span>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p
                className="text-xs mb-1"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                From
              </p>

              <p
                className="font-bold m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text-dark)",
                  fontSize: "18px",
                }}
              >
                ₹{provider.startingPrice?.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProvidersSection;
