import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";
import Card from "../components/common/Card";

const INTERVAL_MS = 4000;

const CategoryBanner = ({
  category,
  activeSub,
  activeIndex,
  subs,
  setActiveIndex,
}) => (
  <div
    className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
    style={{
      backgroundColor: "#EDE9F4",
      minHeight: "240px",
      margin: "72px 16px 0",
      width: "calc(100% - 32px)",
    }}
  >
    {/* Left: text */}
    <div className="relative z-10 p-6 sm:p-10 max-w-lg">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs mb-4"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <Link
          to="/"
          className="no-underline hover:opacity-70"
          style={{ color: "var(--color-text-mid)" }}
        >
          Home
        </Link>
        <span style={{ color: "var(--color-accent)" }}>/</span>
        <span
          className="font-semibold"
          style={{ color: "var(--color-text-dark)" }}
        >
          {category.name}
        </span>
      </nav>

      {/* Badge */}
      <span
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "rgba(255,255,255,0.55)",
          borderColor: "rgba(0,0,0,0.08)",
          color: "var(--color-text-mid)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {activeSub?.name ?? category.name}
      </span>

      {/* Heading */}
      <h1
        className="font-normal leading-[1.08] mb-4"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3.5vw, 52px)",
          color: "var(--color-text-dark)",
          letterSpacing: "-0.02em",
          transition: "all 0.5s ease",
        }}
      >
        {activeSub?.name ?? category.name}
      </h1>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-6"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-mid)",
          maxWidth: "380px",
          transition: "all 0.5s ease",
        }}
      >
        {activeSub?.description ?? category.description}
      </p>

      {/* CTA */}
      <a
        href="#services"
        className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-105"
        style={{
          fontFamily: "var(--font-body)",
          backgroundColor: "var(--color-text-dark)",
          color: "#ffffff",
          boxShadow: "0 4px 16px rgba(44,24,16,0.18)",
        }}
      >
        Explore {activeSub?.name ?? category.name}
      </a>
    </div>

    {/* Right: rotating subcategory image — hidden on mobile, visible sm+ */}
    <div className="absolute top-0 right-0 bottom-0 w-1/2 z-0 overflow-hidden rounded-r-3xl hidden sm:block">
      {subs.length > 0 ? (
        subs.map((sub, i) => (
          <img
            key={sub.id}
            src={sub.imageUrl}
            alt={sub.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))
      ) : (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, #EDE9F4 0%, transparent 30%)",
        }}
      />
    </div>

    {/* Dots */}
    {subs.length > 1 && (
      <div className="absolute bottom-5 right-6 z-10 flex items-center gap-2">
        {subs.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="rounded-full border-0 cursor-pointer transition-all duration-300"
            style={{
              width: i === activeIndex ? "20px" : "7px",
              height: "7px",
              backgroundColor:
                i === activeIndex
                  ? "var(--color-text-dark)"
                  : "rgba(44,24,16,0.25)",
              padding: 0,
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    )}
  </div>
);

const Category = () => {
  const { id } = useParams();
  const { data, loading } = useFetch(mockCategories);
  const [activeIndex, setActiveIndex] = useState(0);

  const category = data?.find((c) => c.id === parseInt(id));
  const subs = category?.subCategories ?? [];

  useEffect(() => {
    if (subs.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % subs.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [subs.length]);

  const activeSub = subs[activeIndex] ?? null;

  const getServiceLink = (name) => {
    const match = mockServices?.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    return match ? `/service/${match.id}` : undefined;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
        <span
          className="text-sm italic"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-mid)",
          }}
        >
          Loading category…
        </span>
      </div>
    );

  if (!category)
    return (
      <div
        className="text-center py-20 text-2xl"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-dark)",
        }}
      >
        Category not found
      </div>
    );

  return (
    <div
      className="min-h-screen pb-16 sm:pb-20"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Light banner ── */}
      <CategoryBanner
        category={category}
        activeSub={activeSub}
        activeIndex={activeIndex}
        subs={subs}
        setActiveIndex={setActiveIndex}
      />

      {/* ── Services grid ── */}
      <div id="services" className="px-4 sm:px-8 lg:px-10 mt-10 sm:mt-14">
        <div className="flex items-center gap-5 mb-8 sm:mb-10">
          <h2
            className="text-xl sm:text-2xl font-normal whitespace-nowrap m-0"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-dark)",
            }}
          >
            Available Services
          </h2>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(to right, var(--color-accent), transparent)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {category.subCategories?.map((service) => (
            <Card
              key={service.id}
              title={service.name}
              description={service.description}
              image={service.imageUrl}
              primaryAction="Book Service"
              variant="overlay"
              linkTo={getServiceLink(service.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
