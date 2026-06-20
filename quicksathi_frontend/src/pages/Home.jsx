import { useFetch } from "../hooks/useFetch";
import { mockCategories } from "../data/mockCategories";
import { mockServices } from "../data/mockServices";
import Card from "../components/common/Card";
import Hero from "../components/Hero";
import { Link } from "react-router-dom";
import AboutSection from "./AboutSection";

// Same helper as Category.jsx — match by name, not ID
const getServiceLink = (name) => {
  const match = mockServices?.find(
    (s) => s.name.toLowerCase() === name.toLowerCase(),
  );
  return match ? `/service/${match.id}` : undefined;
};

const Home = () => {
  const { data: categories, loading, error } = useFetch(mockCategories);

  if (loading)
    return (
      <div
        className="flex justify-center items-center"
        style={{ minHeight: "92vh" }}
      >
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
      </div>
    );

  if (error)
    return (
      <div
        className="text-center py-20"
        style={{
          color: "var(--color-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        {error}
      </div>
    );

  return (
    <div>
      <Hero
        categories={categories}
        style={{ backgroundColor: "var(--color-bg)" }}
      />
      <AboutSection
        categories={categories}
        style={{ backgroundColor: "var(--color-bg-soft)" }}
      />

      <section className="px-16 py-12">
        <div className="flex items-baseline gap-4 mb-7">
          <h2
            className="text-xl font-semibold uppercase tracking-[0.2em] flex-shrink-0"
            style={{
              fontFamily: "var(--font-body)",
              color: "#C4A882",
            }}
          >
            Popular Services
          </h2>

          <div
            className="h-px flex-1"
            style={{
              background: "linear-gradient(to right, #C4A88240, transparent)",
            }}
          />

          <p
            className="text-3xl font-normal italic flex-shrink-0"
            style={{
              fontFamily: "var(--font-display)",
              color: "#C4A882",
              opacity: 0.9,
            }}
          >
            Discover our services and how we do it better.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {categories?.map((parent) => {
            const featuredSub = parent.subCategories?.[0];
            if (!featuredSub) return null;

            return (
              <div key={parent.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <h3
                      className="text-xl font-normal m-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-text-dark)",
                      }}
                    >
                      {parent.name}
                    </h3>
                    <div
                      className="h-px w-40"
                      style={{
                        background:
                          "linear-gradient(to right, var(--color-accent), transparent)",
                      }}
                    />
                  </div>

                  <Link
                    to={`/category/${parent.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold no-underline transition-all duration-200 hover:scale-105"
                    style={{
                      fontFamily: "var(--font-body)",
                      backgroundColor: "var(--color-text-dark)",
                      color: "#fff",
                      boxShadow: "0 2px 12px rgba(44,24,16,0.15)",
                    }}
                  >
                    View All Services{" "}
                    <span style={{ fontSize: "12px" }}>→</span>
                  </Link>
                </div>

                <div className="flex flex-col gap-6">
                  {parent.subCategories?.slice(0, 1).map((service) => (
                    <Card
                      key={service.id}
                      title={service.name}
                      description={service.description}
                      image={service.imageUrl}
                      secondaryImage={service.secondaryImageUrl}
                      primaryAction="View Details"
                      secondaryAction="Book Now"
                      variant="servicePreview"
                      linkTo={getServiceLink(service.name)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
