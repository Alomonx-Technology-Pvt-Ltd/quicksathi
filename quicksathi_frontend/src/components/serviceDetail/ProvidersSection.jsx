import SectionHeader from "./SectionHeader";
import { Star, ShieldCheck, MapPin, Award } from "lucide-react";

const ProvidersSection = ({ providers = [] }) => {
  if (!providers?.length) return null;

  return (
    <div id="providers-section" className="scroll-mt-24">
      <SectionHeader
        title="Top Verified Professionals"
        subtitle="Vetted service partners assigned to deliver this service"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {providers.map((provider, idx) => (
          <div
            key={provider.id || provider._id || idx}
            className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:border-purple-200 transition-all"
          >
            <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop";
                }}
              />
              <div className="absolute bottom-0 right-0 p-0.5 bg-emerald-500 rounded-tl-lg text-white">
                <ShieldCheck size={10} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 m-0 truncate">
                {provider.name}
              </h4>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {provider.rating}
                </span>
                <span>•</span>
                <span>{provider.experience} exp</span>
                {provider.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin size={10} />
                      {provider.location}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-2 text-xs font-bold text-purple-700">
                Starting ₹{(provider.startingPrice || 349).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProvidersSection;
