import { useState } from "react";
import { ImageIcon } from "lucide-react";

/**
 * Photo with a neutral placeholder when there is no fitting photo (`src` empty)
 * or it fails to load. Pick `src` with `serviceImage()` from content/catalogue/images.
 */
const ServiceImage = ({ src, alt, label, className = "", imgClassName = "", loading = "lazy" }) => {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-purple-50 via-white to-orange-50 text-purple-300 ${className}`}
      >
        <ImageIcon size={26} strokeWidth={1.5} />
        {label && <span className="text-[11px] font-semibold text-purple-400/90 px-3 text-center line-clamp-2">{label}</span>}
      </div>
    );
  }
  return (
    <div className={className}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </div>
  );
};

export default ServiceImage;
