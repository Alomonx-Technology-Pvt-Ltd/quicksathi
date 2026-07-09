import SectionHeader from "./SectionHeader";

const AboutSection = ({ service }) => {
  return (
    <div>
      <SectionHeader title="About this Service" />

      <p
        className="text-base leading-relaxed"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-mid)",
        }}
      >
        {service.fullDescription}
      </p>
    </div>
  );
};

export default AboutSection;