import structure from "./structure.json";
import carRental from "../../assets/Bike/carRental.avif";
import catering from "../../assets/cateringImg.avif";
import cctvHome from "../../assets/cctv/cctvImg1.avif";
import cctvCommercial from "../../assets/cctv/commercialCctv.avif";
import cctvMaintenance from "../../assets/cctv/maintenance.avif";
import decoration from "../../assets/decorationImg.avif";
import homeTuition from "../../assets/HomeTution/homeTuitionImg.avif";
import makeup from "../../assets/makeupArtist.avif";
import photography from "../../assets/photographyImg.avif";
import venue from "../../assets/venueImg.avif";

/**
 * Per-service photos: drop `<slug>.webp` (or .jpg/.png/.avif) into
 * `src/assets/services/` and it is picked up at build time.
 */
const files = import.meta.glob("../../assets/services/*.{webp,jpg,jpeg,png,avif}", {
  eager: true,
  import: "default",
});
const BY_SLUG = Object.fromEntries(
  Object.entries(files).map(([file, url]) => [file.split("/").pop().replace(/\.[^.]+$/, ""), url])
);

// Photos already in the repo that show the service itself.
const EXISTING_BY_SLUG = {
  photography,
  decoration,
  "venue-booking": venue,
  catering,
  "home-cctv": cctvHome,
  "commercial-cctv": cctvCommercial,
  "cctv-maintenance": cctvMaintenance,
  "outstation-car-rental": carRental,
  "bridal-party-makeup": makeup,
  "foam-jet-ac-service": "/images/ac/foam-jet-ac-service.jpg",
  "ac-gas-refill": "/images/ac/ac-gas-refill.jpg",
  "ac-installation": "/images/ac/ac-installation.jpg",
  "ac-uninstallation": "/images/ac/ac-uninstallation.jpg",
};

// Group-level photo when nothing more specific exists. Groups without a fitting
// photo are left out on purpose: cards show a neutral placeholder instead of a wrong picture.
const BY_GROUP = {
  "car-rental": carRental,
  "wedding-photo-decor-venue": photography,
  "wedding-catering-pandit": catering,
  cctv: cctvHome,
  "salon-women-makeup": makeup,
  "home-tuition": homeTuition,
  ac: "/images/ac/ac-checkup.webp",
};

/**
 * Photo for a service: the DB image the admin set, then a per-slug file,
 * then a group photo; null when none fits (callers render a placeholder).
 */
export const serviceImage = (service) => {
  if (!service) return null;
  const slug = service.slug;
  return (
    service.thumbnail ||
    service.bannerImage ||
    (Array.isArray(service.gallery) && service.gallery[0]) ||
    (slug && (BY_SLUG[slug] || EXISTING_BY_SLUG[slug] || BY_GROUP[structure.services[slug]?.group])) ||
    null
  );
};
