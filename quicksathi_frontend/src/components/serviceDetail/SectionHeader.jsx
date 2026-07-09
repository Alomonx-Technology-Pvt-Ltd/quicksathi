const SectionHeader = ({ title }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2
        className="text-xl font-normal whitespace-nowrap m-0"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-dark)",
        }}
      >
        {title}
      </h2>

      <div
        className="flex-1 h-px"
        style={{
          background:
            "linear-gradient(to right, var(--color-accent), transparent)",
        }}
      />
    </div>
  );
};

export default SectionHeader;