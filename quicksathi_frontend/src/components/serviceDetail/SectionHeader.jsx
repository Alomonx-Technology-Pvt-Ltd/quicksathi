const SectionHeader = ({ title, subtitle }) => {
  return (
    <div className="mb-5 pb-3 border-b border-slate-100 flex flex-col gap-1">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight m-0">
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs sm:text-sm text-slate-500 m-0">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;