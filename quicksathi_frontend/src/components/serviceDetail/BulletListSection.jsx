import SectionHeader from "./SectionHeader";

const BulletListSection = ({ id, title, subtitle, items = [], icon: Icon, iconClassName = "" }) => {
  if (!items?.length) return null;

  return (
    <div id={id} className="scroll-mt-24">
      <SectionHeader title={title} subtitle={subtitle} />
      <ul className="list-none m-0 space-y-2 bg-slate-50/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/70">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
            {Icon && <Icon size={16} className={`shrink-0 mt-0.5 ${iconClassName}`} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BulletListSection;
