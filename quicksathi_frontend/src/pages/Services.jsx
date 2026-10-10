import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldCheck,
} from "lucide-react";
import api from "../config/api";
import SEO from "../components/SEO";
import { useLocation as useGeoLocation } from "../context/LocationContext";

// ── Default Banners matching Home CategoryBannersCarousel ────────────────────
const DEFAULT_HOME_BANNERS = [
  {
    id: "ac",
    badge: "Top Summer Pick",
    title: "Deep clean with foam-jet AC service",
    subtitle: "AC service, gas refill & doorstep repair",
    cta: "BOOK",
    link: "/services/ac",
    textColor: "#ffffff",
    buttonBg: "#0284c7",
    image: "/images/ac/foam-jet.webp",
    bgFallback: "#0d2b45",
  },
  {
    id: "repair",
    badge: "Home Essential",
    title: "Home repairs at affordable prices",
    subtitle: "Electricians, plumbers & carpentry help",
    cta: "BOOK",
    link: "/category/house-services",
    textColor: "#ffffff",
    buttonBg: "#0066cc",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#00488f",
  },
  {
    id: "salon",
    badge: "Salon at Home",
    title: "Glow at home with expert salon",
    subtitle: "Hair styling, facials, waxing & makeup",
    cta: "BOOK",
    link: "/category/home-salon",
    textColor: "#ffffff",
    buttonBg: "#be185d",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#5c133a",
  },
  {
    id: "rental",
    badge: "Instant Booking",
    title: "Chauffeur & self-drive rentals",
    subtitle: "Sedans, SUVs & luxury wedding cars",
    cta: "BOOK",
    link: "/category/vehicle-rental",
    textColor: "#ffffff",
    buttonBg: "#1d4ed8",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#091a38",
  },
  {
    id: "wedding",
    badge: "Grand Setup",
    title: "Plan Your Perfect Wedding",
    subtitle: "Venues, decor, photo & catering",
    cta: "BOOK",
    link: "/category/wedding",
    textColor: "#ffffff",
    buttonBg: "#e11d48",
    image: "/banners/wedding_banner.webp",
    bgFallback: "#320b1e",
  },
  {
    id: "help",
    badge: "Verified Staff",
    title: "Deep home cleaning & maids",
    subtitle: "Kitchen, bathroom & daily house help",
    cta: "BOOK",
    link: "/category/house-help",
    textColor: "#ffffff",
    buttonBg: "#0f766e",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#09534c",
  },
  {
    id: "tuition",
    badge: "1st Class Free",
    title: "Find trusted home tutors",
    subtitle: "Maths, Science, English & Computer",
    cta: "BOOK",
    link: "/category/home-tuition",
    textColor: "#ffffff",
    buttonBg: "#0284c7",
    image: "/banners/tuition_banner.webp",
    bgFallback: "#0d2b45",
  },
  {
    id: "painting",
    badge: "Clean Finish",
    title: "Professional home painting",
    subtitle: "Waterproof, dust-free wall makeover",
    cta: "BOOK",
    link: "/category/painting",
    textColor: "#ffffff",
    buttonBg: "#4f46e5",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#271f65",
  },
  {
    id: "cctv",
    badge: "Same-Day Setup",
    title: "24/7 Smart CCTV surveillance",
    subtitle: "HD cameras, smart locks & live feed",
    cta: "BOOK",
    link: "/service/cctv-installation",
    textColor: "#ffffff",
    buttonBg: "#ea580c",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800&auto=format&fit=crop",
    bgFallback: "#0f172a",
  },
];

// ── Cute E-Commerce Shopping Gift Bag Icon for "For You" (Zero AI Feel) ───────
const ForYouBagIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
  >
    <rect x="3.5" y="6.5" width="17" height="15" rx="3.5" fill="url(#forYouBagGradient)" />
    <path
      d="M8.5 8V5C8.5 3.34315 9.84315 2 11.5 2H12.5C14.1569 2 15.5 3.34315 15.5 5V8"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="13.5" r="3.2" fill="rgba(255,255,255,0.24)" />
    <path
      d="M10.8 14.7L13.2 12.3M10.8 12.5H10.81M13.2 14.5H13.21"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="forYouBagGradient" x1="3.5" y1="6.5" x2="20.5" y2="21.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#9333ea" />
        <stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Exact Categories Matching Popups in Home Section ─────────────────────────
// Every category here strictly mirrors its respective CategoryModal in src/components/modals/
const POPUP_CATEGORIES = [
  {
    id: "for-you",
    name: "For You",
    shortName: "For You",
    vertical: "FEATURED",
    isCustomIcon: true,
    bannerImage: "/banners/ac_banner.webp",
    bannerTitle: "Handpicked Doorstep Services",
    bannerSubtitle: "Verified pros • 100% upfront pricing",
    categoryLink: null,
    badgeColor: "bg-indigo-600 text-white",
    sections: [
      {
        title: "POPULAR IN YOUR CITY",
        items: [
          {
            id: "maid-services",
            name: "Maid Services (Monthly/Daily)",
            badge: "Popular",
            badgeColor: "bg-emerald-600 text-white",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "cctv-installation",
            name: "CCTV Installation",
            badge: "Security",
            badgeColor: "bg-indigo-600 text-white",
            image: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315770/TiptoBook/services/cctv-main.jpg",
            fallbackIcon: "/icons/categories/cctv.png",
            route: "/service/cctv-installation",
          },
          {
            id: "ac-repair",
            name: "AC Repair & Services",
            badge: "Popular",
            badgeColor: "bg-indigo-600 text-white",
            image: "/icons/appliances/ac-repair.jpg",
            fallbackIcon: "/icons/appliances/ac-repair.png",
            route: "/services/ac",
          },
          {
            id: "plumbing",
            name: "Plumbing",
            badge: "Popular",
            badgeColor: "bg-indigo-600 text-white",
            image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-repair.png",
            route: "/category/house-services",
          },
          {
            id: "wedding-car",
            name: "Wedding Car Rental",
            badge: "Popular",
            badgeColor: "bg-blue-600 text-white",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
          {
            id: "photography-videography",
            name: "Photography & Videography",
            badge: "Popular",
            badgeColor: "bg-rose-600 text-white",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/service/photography",
          },
          {
            id: "laundry-ironing",
            name: "Laundry & Ironing Services",
            badge: "New",
            badgeColor: "bg-emerald-600 text-white",
            image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
        ],
      },
      {
        title: "HOME ESSENTIALS & TUTORS",
        items: [
          {
            id: "nursery-to-class-5",
            name: "Nursery to Class 5",
            badge: "Foundation",
            badgeColor: "bg-indigo-600 text-white",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
          {
            id: "electrician",
            name: "Electrician",
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-repair.png",
            route: "/category/house-services",
          },
          {
            id: "full-home-painting",
            name: "Full Home Painting",
            badge: "Popular",
            badgeColor: "bg-indigo-600 text-white",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
          {
            id: "elder-care",
            name: "Elder Care Services",
            badge: "Coming Soon",
            badgeColor: "bg-emerald-600 text-white",
            image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "home-cook",
            name: "Home Cook & Chef",
            image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "babysitting",
            name: "Babysitting / Nanny",
            image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "washing-machine",
            name: "Washing Machine Repair",
            image: "/icons/appliances/washing-machine.jpg",
            fallbackIcon: "/icons/appliances/washing-machine.png",
            route: "/service/washing-machine-repair",
          },
          {
            id: "refrigerator",
            name: "Refrigerator Repair & Services",
            image: "/icons/appliances/refrigerator.jpg",
            fallbackIcon: "/icons/appliances/refrigerator.png",
            route: "/service/refrigerator-repair",
          },
          {
            id: "classes-6-8",
            name: "Classes 6–8",
            badge: "Middle School",
            badgeColor: "bg-indigo-600 text-white",
            image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
          {
            id: "pandit-booking",
            name: "Pandit Booking",
            badge: "Vedic",
            badgeColor: "bg-rose-600 text-white",
            image: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/service/pandit-service",
          },
        ],
      },
    ],
  },
  {
    id: "ac",
    name: "AC & Appliances",
    shortName: "AC & Appliances",
    vertical: "AC_APPLIANCES",
    iconUrl: "/icons/categories/ac-appliances.png",
    bannerImage: "/banners/ac_banner.webp",
    bannerTitle: "Doorstep AC & Appliance Repair",
    bannerSubtitle: "Certified technicians • 30-Day warranty",
    categoryLink: "/services/ac",
    badgeColor: "bg-purple-600 text-white",
    sections: [
      {
        title: "AC & APPLIANCE REPAIR",
        items: [
          {
            id: "ac-repair",
            name: "AC Repair & Services",
            badge: "Popular",
            image: "/icons/appliances/ac-repair.jpg",
            fallbackIcon: "/icons/appliances/ac-repair.png",
            route: "/services/ac",
          },
          {
            id: "washing-machine",
            name: "Washing Machine Repair",
            image: "/icons/appliances/washing-machine.jpg",
            fallbackIcon: "/icons/appliances/washing-machine.png",
            route: "/service/washing-machine-repair",
          },
          {
            id: "refrigerator",
            name: "Refrigerator Repair & Services",
            image: "/icons/appliances/refrigerator.jpg",
            fallbackIcon: "/icons/appliances/refrigerator.png",
            route: "/service/refrigerator-repair",
          },
          {
            id: "tv-repair",
            name: "TV Repair & Services",
            image: "/icons/appliances/tv-repair.jpg",
            fallbackIcon: "/icons/appliances/tv-repair.png",
            route: "/service/tv-repair",
          },
        ],
      },
      {
        title: "OTHER APPLIANCES",
        items: [
          {
            id: "geyser-repair",
            name: "Geyser Repair & Services",
            badge: "Essential",
            image: "/icons/appliances/geyser-repair.jpg",
            fallbackIcon: "/icons/appliances/geyser-repair.png",
            route: "/service/geyser-repair",
          },
          {
            id: "foam-jet",
            name: "Foam-Jet AC Deep Clean",
            badge: "Popular",
            image: "/images/ac/foam-jet.webp",
            fallbackIcon: "/icons/appliances/ac-repair.png",
            route: "/services/ac",
          },
          {
            id: "gas-refill",
            name: "AC Gas Refill & Leak Fix",
            image: "/images/ac/gas-refill.webp",
            fallbackIcon: "/icons/appliances/ac-repair.png",
            route: "/services/ac",
          },
          {
            id: "ac-install",
            name: "AC Installation & Setup",
            image: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
            fallbackIcon: "/icons/appliances/ac-repair.png",
            route: "/services/ac",
          },
        ],
      },
    ],
  },
  {
    id: "rental",
    name: "Vehicle Rental",
    shortName: "Vehicle Rental",
    vertical: "VEHICLE_RENTAL",
    iconUrl: "/icons/categories/car-rental.png",
    bannerImage: "/banners/rental_banner.webp",
    bannerTitle: "Chauffeur & Self-Drive Fleet",
    bannerSubtitle: "Clean cars • Verified drivers • Zero hidden charges",
    categoryLink: "/category/vehicle-rental",
    badgeColor: "bg-blue-600 text-white",
    sections: [
      {
        title: "VEHICLE RENTAL SERVICES",
        items: [
          {
            id: "wedding-car",
            name: "Wedding Car Rental",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
          {
            id: "daily-car",
            name: "Daily Car Rental",
            image: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315770/TiptoBook/services/outstation-airport-cab.jpg",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
          {
            id: "airport-cabs",
            name: "Outstation & Airport Cab",
            image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
          {
            id: "self-drive",
            name: "Self-Drive Car Fleet",
            badge: "Zero Deposit",
            image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
        ],
      },
    ],
  },
  {
    id: "weddings",
    name: "Wedding & Event",
    shortName: "Wedding & Event",
    vertical: "WEDDING",
    iconUrl: "/icons/categories/wedding-events.png",
    bannerImage: "/banners/wedding_banner.webp",
    bannerTitle: "Complete Wedding & Celebration Services",
    bannerSubtitle: "Venues, photography, catering & decor",
    categoryLink: "/category/wedding",
    badgeColor: "bg-rose-600 text-white",
    sections: [
      {
        title: "WEDDING & EVENT SERVICES",
        items: [
          {
            id: "photography-videography",
            name: "Photography & Videography",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/service/photography",
          },
          {
            id: "wedding-decoration",
            name: "Wedding Decoration",
            image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/category/wedding",
          },
          {
            id: "venue-booking",
            name: "Venue Booking",
            badge: "New",
            image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/category/wedding",
          },
          {
            id: "catering-services",
            name: "Catering Services",
            image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/category/wedding",
          },
          {
            id: "pandit-booking",
            name: "Pandit Booking",
            badge: "Vedic",
            image: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/wedding-events.png",
            route: "/service/pandit-service",
          },
          {
            id: "wedding-car-rental",
            name: "Wedding Car Rental",
            badge: "Luxury",
            image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/car-rental.png",
            route: "/category/vehicle-rental",
            isRental: true,
          },
        ],
      },
    ],
  },
  {
    id: "repair",
    name: "Home Services & Repair",
    shortName: "Home Repair",
    vertical: "HOUSE_SERVICES",
    iconUrl: "/icons/categories/home-repair.png",
    bannerImage: "/banners/repair_banner.webp",
    bannerTitle: "Expert Repairs, Maintenance & CCTV",
    bannerSubtitle: "Plumbing, Electrical, Carpentry & Security",
    categoryLink: "/category/house-services",
    badgeColor: "bg-indigo-600 text-white",
    sections: [
      {
        title: "HOME SERVICES & REPAIR",
        items: [
          {
            id: "cctv-installation",
            name: "CCTV Installation",
            badge: "Security",
            image: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315770/TiptoBook/services/cctv-main.jpg",
            fallbackIcon: "/icons/categories/cctv.png",
            route: "/service/cctv-installation",
          },
          {
            id: "plumbing",
            name: "Plumbing",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-repair.png",
            route: "/category/house-services",
          },
          {
            id: "electrician",
            name: "Electrician",
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-repair.png",
            route: "/category/house-services",
          },
          {
            id: "carpentry",
            name: "Carpentry",
            image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-repair.png",
            route: "/category/house-services",
          },
          {
            id: "painting",
            name: "Painting Services",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
        ],
      },
    ],
  },
  {
    id: "help",
    name: "House Help",
    shortName: "House Help",
    vertical: "HOUSE_HELP",
    iconUrl: "/icons/categories/house-help.png",
    bannerImage: "/banners/help_banner.webp",
    bannerTitle: "Verified Doorstep House Help",
    bannerSubtitle: "Background checked • Maid, cook, laundry & elder care",
    categoryLink: "/category/house-help",
    badgeColor: "bg-emerald-600 text-white",
    sections: [
      {
        title: "HOUSE HELP SERVICES",
        items: [
          {
            id: "maid-services",
            name: "Maid Services (Monthly/Daily)",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "laundry-ironing",
            name: "Laundry & Ironing Services",
            badge: "New",
            image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "elder-care",
            name: "Elder Care Services",
            badge: "Coming Soon",
            image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "home-cook",
            name: "Home Cook & Chef",
            image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
          {
            id: "babysitting",
            name: "Babysitting / Nanny",
            image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/house-help.png",
            route: "/category/house-help",
          },
        ],
      },
    ],
  },
  {
    id: "salon",
    name: "Home Salon & Beauty",
    shortName: "Home Salon",
    vertical: "HOME_SALON",
    iconUrl: "/icons/categories/home-salon.png",
    bannerImage: "/banners/salon_banner.webp",
    bannerTitle: "Doorstep Salon & Grooming",
    bannerSubtitle: "Single-use hygiene kits • Certified beauticians",
    categoryLink: "/category/home-salon",
    badgeColor: "bg-pink-600 text-white",
    sections: [
      {
        title: "SALON & GROOMING SERVICES",
        items: [
          {
            id: "salon-women",
            name: "Women's Beauty Services",
            badge: "Women",
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=480&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon?gender=women",
          },
          {
            id: "salon-men",
            name: "Men's Grooming",
            badge: "Men",
            image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=480&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon?gender=men",
          },
          {
            id: "hair-styling",
            name: "Hair Styling & Care",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon",
          },
          {
            id: "facial-cleanup",
            name: "Facial & Cleanup",
            image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon",
          },
          {
            id: "bridal-makeup",
            name: "Bridal & Party Makeup",
            badge: "Luxury",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon",
          },
          {
            id: "manicure-pedicure",
            name: "Manicure & Pedicure",
            image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon",
          },
          {
            id: "waxing-threading",
            name: "Waxing & Threading",
            image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-salon.png",
            route: "/category/home-salon",
          },
        ],
      },
    ],
  },
  {
    id: "tuition",
    name: "Home Tuition",
    shortName: "Home Tuition",
    vertical: "HOME_TUITION",
    iconUrl: "/icons/categories/home-tuition.png",
    bannerImage: "/banners/tuition_banner.webp",
    bannerTitle: "Verified Expert Home Tutors",
    bannerSubtitle: "One-on-one personalized teaching across CBSE & ICSE",
    categoryLink: "/category/home-tuition",
    badgeColor: "bg-indigo-600 text-white",
    sections: [
      {
        title: "SCHOOL & ACADEMIC TUITION",
        items: [
          {
            id: "nursery-to-class-5",
            name: "Nursery to Class 5",
            badge: "Foundation",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
          {
            id: "classes-6-8",
            name: "Classes 6–8",
            badge: "Middle School",
            image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
          {
            id: "classes-9-10",
            name: "Classes 9–10",
            badge: "Board Prep",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
          {
            id: "classes-11-12",
            name: "Classes 11–12",
            badge: "Competitive",
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/home-tuition.png",
            route: "/category/home-tuition",
          },
        ],
      },
    ],
  },
  {
    id: "painting",
    name: "Painting",
    shortName: "Painting",
    vertical: "PAINTING",
    iconUrl: "/icons/categories/painting.png",
    bannerImage: "/banners/painting_banner.webp",
    bannerTitle: "Flawless House Painting & Texture",
    bannerSubtitle: "Dustless sanding • Weatherproof guarantee",
    categoryLink: "/category/painting",
    badgeColor: "bg-indigo-600 text-white",
    sections: [
      {
        title: "PAINTING & WATERPROOFING",
        items: [
          {
            id: "full-home-painting",
            name: "Full Home Painting",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
          {
            id: "room-by-room-painting",
            name: "Room-by-Room Painting",
            badge: "Flexible",
            image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
          {
            id: "interior-painting",
            name: "Interior Wall Painting",
            image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
          {
            id: "exterior-painting",
            name: "Exterior House Painting",
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
          {
            id: "waterproofing-texture",
            name: "Waterproofing & Texture",
            badge: "Damp Proof",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/painting.png",
            route: "/category/painting",
          },
        ],
      },
    ],
  },
  {
    id: "construction",
    name: "Construction & Interior Design",
    shortName: "Construction",
    vertical: "CONSTRUCTION",
    iconUrl: "/icons/categories/construction.png",
    bannerImage: "/banners/repair_banner.webp",
    bannerTitle: "Turnkey Construction & Luxury Interiors",
    bannerSubtitle: "Complete building • False ceiling • 3D floor layouts",
    categoryLink: "/category/construction",
    badgeColor: "bg-blue-600 text-white",
    sections: [
      {
        title: "CONSTRUCTION & DESIGN",
        items: [
          {
            id: "new-home-construction",
            name: "New Home Construction",
            badge: "Turnkey",
            image: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/construction.png",
            route: "/services?q=construction",
          },
          {
            id: "renovation-remodeling",
            name: "Renovation & Remodeling",
            badge: "Popular",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/construction.png",
            route: "/services?q=renovation",
          },
          {
            id: "interior-design",
            name: "Interior Design",
            badge: "Luxury",
            image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/construction.png",
            route: "/services?q=interior",
          },
          {
            id: "false-ceiling-lighting",
            name: "False Ceiling & Lighting",
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/construction.png",
            route: "/services?q=ceiling",
          },
          {
            id: "design-planning-2d-3d",
            name: "2D/3D Design & Planning",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=300&auto=format&fit=crop",
            fallbackIcon: "/icons/categories/construction.png",
            route: "/services?q=planning",
          },
        ],
      },
    ],
  },
];

const Services = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { city } = useGeoLocation();

  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("cat") || "for-you";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(initialSearch));
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategory);

  // Real-time backend state
  const [backendServices, setBackendServices] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [carouselBanners, setCarouselBanners] = useState(DEFAULT_HOME_BANNERS);
  const [bookingCount, setBookingCount] = useState(0);

  const searchInputRef = useRef(null);
  const rightContentRef = useRef(null);
  const leftRailRef = useRef(null);
  const bannerScrollRef = useRef(null);

  // Auto-scroll timer for Home Banners in "For You"
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // ── Fetch Real-Time Data from Backend ───────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const cityParam = city ? `?city=${encodeURIComponent(city)}` : "";
        const [servicesRes, categoriesRes, bannersRes, bookingsRes] = await Promise.allSettled([
          api.get(`/services${cityParam}`),
          api.get(`/categories`),
          api.get(`/banners?section=carousel`),
          api.get(`/bookings/my-bookings`).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        if (servicesRes.status === "fulfilled" && servicesRes.value?.data) {
          const list = Array.isArray(servicesRes.value.data)
            ? servicesRes.value.data
            : servicesRes.value.data.services || [];
          setBackendServices(list);
        }

        if (categoriesRes.status === "fulfilled" && categoriesRes.value?.data) {
          const catList = Array.isArray(categoriesRes.value.data)
            ? categoriesRes.value.data
            : categoriesRes.value.data.categories || [];
          setBackendCategories(catList);
        }

        if (bannersRes.status === "fulfilled" && bannersRes.value?.data) {
          const bList = Array.isArray(bannersRes.value.data)
            ? bannersRes.value.data
            : bannersRes.value.data.banners || [];
          if (bList.length > 0) {
            setCarouselBanners(bList);
          }
        }

        if (bookingsRes.status === "fulfilled" && bookingsRes.value?.data) {
          const bCount = Array.isArray(bookingsRes.value.data)
            ? bookingsRes.value.data.length
            : bookingsRes.value.data.bookings?.length || 0;
          setBookingCount(bCount);
        }
      } catch (err) {
        console.warn("Backend real-time sync completed with fallbacks:", err);
      }
    };

    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, [city]);

  // Sync category from URL param if user navigates with ?cat=
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat && POPUP_CATEGORIES.some((c) => c.id === cat)) {
      setActiveCategoryId(cat);
    }
  }, [searchParams]);

  // Switch category handler
  const handleSelectCategory = (catId) => {
    setActiveCategoryId(catId);
    setSearchQuery("");
    if (rightContentRef.current) {
      rightContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Find currently active category
  const activeCategory = useMemo(() => {
    return POPUP_CATEGORIES.find((c) => c.id === activeCategoryId) || POPUP_CATEGORIES[0];
  }, [activeCategoryId]);

  // Real-time helper: Match item with live backend service data (slugs & links)
  const getEnrichedItem = useCallback(
    (item) => {
      const match = backendServices.find(
        (s) =>
          s.name?.toLowerCase() === item.name?.toLowerCase() ||
          s.slug === item.id ||
          item.route?.includes(s.slug) ||
          item.name?.toLowerCase().includes(s.name?.toLowerCase())
      );

      return {
        ...item,
        destinationUrl: match?.slug
          ? item.isRental
            ? `/product/${match.slug}`
            : `/service/${match.slug}`
          : item.route,
      };
    },
    [backendServices]
  );

  // Search Results across ALL categories and items
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results = [];
    const seenNames = new Set();

    POPUP_CATEGORIES.forEach((cat) => {
      cat.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (
            item.name.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q) ||
            sec.title.toLowerCase().includes(q)
          ) {
            if (!seenNames.has(item.name.toLowerCase())) {
              seenNames.add(item.name.toLowerCase());
              results.push(getEnrichedItem(item));
            }
          }
        });
      });
    });

    // Also include any backend service not in popup list
    backendServices.forEach((s) => {
      if (
        (s.name?.toLowerCase().includes(q) || s.shortDescription?.toLowerCase().includes(q)) &&
        !seenNames.has(s.name.toLowerCase())
      ) {
        seenNames.add(s.name.toLowerCase());
        results.push({
          id: s._id || s.slug,
          name: s.name,
          image: s.thumbnail || s.bannerImage || "/icons/appliances/ac-repair.jpg",
          fallbackIcon: "/icons/appliances/ac-repair.png",
          destinationUrl: s.name?.toLowerCase().includes("car") ? `/product/${s.slug}` : `/service/${s.slug}`,
        });
      }
    });

    return results;
  }, [searchQuery, backendServices, getEnrichedItem]);

  // Focus input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // ── Auto-scroll carousel banners in "For You" ──────────────────────────────
  useEffect(() => {
    if (activeCategoryId !== "for-you" || isBannerHovered || carouselBanners.length <= 1) return;
    const interval = setInterval(() => {
      if (bannerScrollRef.current) {
        const nextIndex = (bannerIndex + 1) % carouselBanners.length;
        setBannerIndex(nextIndex);
        const cardWidth = bannerScrollRef.current.querySelector(".promo-banner-slide")?.offsetWidth || 340;
        bannerScrollRef.current.scrollTo({
          left: nextIndex * (cardWidth + 12),
          behavior: "smooth",
        });
      }
    }, 3600);
    return () => clearInterval(interval);
  }, [activeCategoryId, isBannerHovered, bannerIndex, carouselBanners.length]);

  const handleBannerScrollBy = (dir) => {
    if (!bannerScrollRef.current) return;
    const cardWidth = bannerScrollRef.current.querySelector(".promo-banner-slide")?.offsetWidth || 340;
    const scrollAmount = dir === "left" ? -cardWidth - 12 : cardWidth + 12;
    bannerScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="w-full min-w-full bg-[#f6f8fb] select-none overflow-x-hidden">
      <SEO
        title="All Services & Categories — Verified Experts at Doorstep | TiptoBook"
        description="Browse all verified on-demand services across India: AC repairs, car rentals, wedding photography, home salon, house help, tutors, CCTV & electricians."
        canonical="https://www.tiptobook.com/services"
      />

      {/* ──────────────────────────────────────────────────────────
          TOP BAR (Full Width Edge-to-Edge)
          - Left: <- All Categories
          - Right: Search icon & Cart / Bookings icon with badge
      ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-xs">
        <div className="w-full flex items-center justify-between gap-3">
          {/* Back button & Page title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
              aria-label="Back"
            >
              <ArrowLeft size={22} className="stroke-[2.2]" />
            </button>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight m-0">
              All Categories
            </h1>
          </div>

          {/* Search Bar / Search Input or Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-md">
            {isSearchOpen ? (
              <div className="relative w-full flex items-center">
                <Search
                  size={16}
                  className="absolute left-3 text-slate-400 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services (e.g. AC, maid, tuition, car)..."
                  className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100 rounded-full border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer p-0.5"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border-0 bg-transparent cursor-pointer flex items-center justify-center"
                  aria-label="Search services"
                >
                  <Search size={20} className="stroke-[2.2]" />
                </button>

                {/* My Bookings Bag Icon with Real-Time Badge */}
                <Link
                  to="/my-bookings"
                  className="relative p-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center no-underline"
                  aria-label="View bookings"
                >
                  <ShoppingBag size={20} className="stroke-[2.2]" />
                  {bookingCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {bookingCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
          MAIN 2-COLUMN SPLIT BROWSER (Full Width Edge-to-Edge)
          - Left Column: Vertical Category Navigation Rail
          - Right Column: Category Content with Popup Service Cards
      ────────────────────────────────────────────────────────── */}
      <div className="w-full flex h-[calc(100vh-57px)] sm:h-[calc(100vh-61px)] overflow-hidden">
        {/* =======================================================
            LEFT CATEGORY RAIL (Width 84px on mobile, 105px on tablet/desktop)
        ======================================================= */}
        <aside
          ref={leftRailRef}
          aria-label="Service categories navigation rail"
          className="w-[82px] sm:w-[98px] md:w-[108px] shrink-0 h-full overflow-y-auto bg-[#eef2f7] border-r border-slate-200/90 no-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex flex-col py-1.5">
            {POPUP_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId && !searchQuery;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`relative w-full py-2.5 sm:py-3 px-1.5 flex flex-col items-center justify-center gap-1.5 transition-all text-center border-0 cursor-pointer ${
                    isActive
                      ? "bg-white shadow-xs font-semibold text-blue-600"
                      : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-medium"
                  }`}
                >
                  {/* Active Indicator Bar (Signature blue strip on the left edge) */}
                  {isActive && (
                    <motion.div
                      layoutId="categoryActiveIndicator"
                      className="absolute left-0 top-1 bottom-1 w-[3.5px] rounded-r-md bg-[#0b4fd8]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Category Thumbnail Container (Circle / Soft Rounded Square) */}
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center p-1.5 transition-transform duration-200 ${
                      isActive
                        ? "bg-blue-50/80 scale-105 shadow-xs"
                        : "bg-white/90 border border-slate-200/50 shadow-2xs"
                    }`}
                  >
                    {cat.isCustomIcon ? (
                      /* Human E-commerce Purple Shopping Gift Bag Icon (NO AI STAR FEEL) */
                      <ForYouBagIcon />
                    ) : cat.iconUrl ? (
                      <img
                        src={cat.iconUrl}
                        alt={cat.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/icons/categories/ac-appliances.png";
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Category Title Below Thumbnail (Max 2 lines, centered) */}
                  <span
                    className={`text-[10px] sm:text-[11.5px] leading-tight line-clamp-2 px-0.5 tracking-tight ${
                      isActive
                        ? "text-[#0b4fd8] font-bold"
                        : "text-slate-700 font-medium"
                    }`}
                  >
                    {cat.shortName || cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* =======================================================
            RIGHT CONTENT PANEL (Full Width Across Rest of Screen)
        ======================================================= */}
        <main
          ref={rightContentRef}
          className="flex-1 w-full h-full overflow-y-auto bg-white p-3.5 sm:p-5 md:p-6 lg:p-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* SEARCH RESULTS VIEW (if search input has content) */}
          {searchQuery.trim() ? (
            <div className="w-full">
              <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-blue-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Results for "{searchQuery}"
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                    {searchResults.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-blue-600 hover:underline border-0 bg-transparent cursor-pointer"
                >
                  Clear search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 m-0 mb-1">
                    No services found
                  </h3>
                  <p className="text-xs text-slate-500 m-0 max-w-xs mx-auto">
                    We couldn't find matches for "{searchQuery}". Try searching for
                    "AC", "wedding", "maid", "salon", or "plumber".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4 md:gap-5">
                  {searchResults.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="w-full"
                    >
                      <Link
                        to={item.destinationUrl}
                        className="group flex flex-col items-center text-center p-1.5 sm:p-2.5 rounded-2xl bg-transparent hover:bg-slate-50/90 transition-colors duration-150 cursor-pointer outline-none relative border-0 no-underline w-full"
                        style={{ transform: "translateZ(0)" }}
                      >
                        {/* Clean High-res Image / Icon Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center relative p-1 shrink-0 aspect-square">
                          <img
                            src={item.image || item.icon}
                            alt={item.name}
                            loading="eager"
                            decoding="async"
                            draggable="false"
                            className="w-full h-full object-cover rounded-2xl drop-shadow-xs group-hover:scale-105 transition-transform duration-200 ease-out select-none pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = item.fallbackIcon || "/icons/categories/house-help.png";
                            }}
                          />
                        </div>

                        {/* Title ONLY */}
                        <span className="mt-2 text-[11px] sm:text-[12.5px] font-semibold text-slate-800 group-hover:text-indigo-600 leading-snug line-clamp-2 transition-colors duration-150 text-center">
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STANDARD CATEGORY VIEW */
            <div className="w-full pb-10">


              {/* ──────────────────────────────────────────────────────────
                  "FOR YOU" SECTION AUTO-SCROLLING BANNERS (Same as Home)
                  Rendered at the top of "For You"
              ────────────────────────────────────────────────────────── */}
              {activeCategory.id === "for-you" && carouselBanners.length > 0 && (
                <div
                  className="mb-6 sm:mb-8 relative"
                  onMouseEnter={() => setIsBannerHovered(true)}
                  onMouseLeave={() => setIsBannerHovered(false)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Featured Offers & Top Deals
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleBannerScrollBy("left")}
                        className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 cursor-pointer flex items-center justify-center transition-colors"
                        aria-label="Previous banner"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBannerScrollBy("right")}
                        className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border-0 cursor-pointer flex items-center justify-center transition-colors"
                        aria-label="Next banner"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal scrolling banner slider */}
                  <div
                    ref={bannerScrollRef}
                    className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {carouselBanners.map((banner, bIdx) => (
                      <Link
                        key={banner._id || banner.id || bIdx}
                        to={banner.link || "/services"}
                        className="promo-banner-slide snap-start shrink-0 rounded-2xl overflow-hidden relative no-underline block transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-xs"
                        style={{
                          width: "clamp(260px, 48vw, 360px)",
                          height: "140px",
                          backgroundColor: banner.bgFallback || "#0d2b45",
                        }}
                      >
                        {/* Background Image */}
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        {/* Gradient Scrim */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(10,25,50,0.92) 0%, rgba(10,25,50,0.72) 58%, rgba(10,25,50,0.2) 100%)",
                          }}
                        />

                        {/* Content text overlay */}
                        <div className="relative z-10 p-3.5 h-full flex flex-col justify-between text-white">
                          <div>
                            {banner.badge && (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white mb-1.5">
                                {banner.badge}
                              </span>
                            )}
                            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 m-0 leading-tight">
                              {banner.title}
                            </h3>
                            <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5 m-0">
                              {banner.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                              style={{ backgroundColor: banner.buttonBg || "#0284c7" }}
                            >
                              {banner.cta || "BOOK"} →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  GROUPED SECTIONS WITH SERVICES & ICONS FROM HOME MODALS
                  Exact cards: Image/Icon with a Title ONLY + Badge
              ────────────────────────────────────────────────────────── */}
              <div className="space-y-6 sm:space-y-8">
                {activeCategory.sections.map((section, sIdx) => (
                  <div key={sIdx} className="w-full">
                    {/* Section Label matching Modal Popup */}
                    {section.title && (
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="text-[10.5px] sm:text-[11.5px] font-bold tracking-wider uppercase text-slate-400">
                          {section.title}
                        </span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                    )}

                    {/* Exact Popup Cards Grid (3 cols on mobile, up to 7 on desktop) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3.5 md:gap-4.5">
                      {section.items.map((rawItem) => {
                        const item = getEnrichedItem(rawItem);

                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="w-full"
                          >
                            <Link
                              to={item.destinationUrl}
                              className="group flex flex-col items-center text-center p-2 sm:p-2.5 rounded-2xl bg-transparent hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer outline-none relative border-0 no-underline w-full"
                              style={{ transform: "translateZ(0)" }}
                            >
                              {/* Optional Badge from popup (e.g. Popular, New, Foundation, Security) */}
                              {item.badge && (
                                <span
                                  className={`absolute top-0.5 right-1 sm:top-1 sm:right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    item.badgeColor || activeCategory.badgeColor || "bg-indigo-600 text-white"
                                  } tracking-wide shadow-xs z-10 pointer-events-none`}
                                >
                                  {item.badge}
                                </span>
                              )}

                              {/* Clean High-res Image / Icon Thumbnail */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative p-1 shrink-0 aspect-square">
                                <img
                                  src={item.image || item.icon}
                                  alt={item.name}
                                  loading="eager"
                                  decoding="async"
                                  draggable="false"
                                  className="w-full h-full object-cover rounded-2xl drop-shadow-xs group-hover:scale-108 transition-transform duration-200 ease-out select-none pointer-events-none"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = item.fallbackIcon || "/icons/categories/house-help.png";
                                  }}
                                />
                              </div>

                              {/* Title ONLY */}
                              <span className="mt-2 text-[11px] sm:text-[12px] font-semibold text-slate-800 group-hover:text-indigo-600 leading-snug line-clamp-2 transition-colors duration-150 text-center">
                                {item.name}
                              </span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ──────────────────────────────────────────────────────────
                  BOTTOM ASSURANCE FOOTNOTE
              ────────────────────────────────────────────────────────── */}
              <div className="mt-10 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>All providers background verified & skill certified</span>
                </div>
                {activeCategory.categoryLink && (
                  <Link
                    to={activeCategory.categoryLink}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View full category page</span>
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Services;
