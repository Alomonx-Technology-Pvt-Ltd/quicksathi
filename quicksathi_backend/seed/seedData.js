import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

// Parse admin emails from .env (comma-separated)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const categoriesData = [
  {
    name: "CCTV Security",
    description: "Enterprise-grade CCTV and monitoring systems with expert installation and 24/7 support.",
    vertical: "CCTV_SECURITY",
    type: "BOTH",
    imageUrl: "/images/cctv-main.png",
    secondaryImageUrl: "/images/cctv-main.png",
    displayOrder: 1,
    active: true,
    subCategories: [
      {
        name: "Home Security",
        description: "Comprehensive residential security setups with high-res cameras, motion alerts, and mobile monitoring.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: "/images/cctv-main.png",
        secondaryImageUrl: "/images/cctv-main.png",
        displayOrder: 1,
        active: true
      },
      {
        name: "Commercial Pro",
        description: "Scalable security infrastructure for businesses, featuring AI monitoring and central control station access.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: "/images/cctv-main.png",
        secondaryImageUrl: "/images/cctv-main.png",
        displayOrder: 2,
        active: true
      }
    ]
  },
  {
    name: "Vehicle Rental",
    description: "Flexible vehicle rentals for every occasion — transparent pricing, well-maintained fleet, zero hidden charges.",
    vertical: "VEHICLE_RENTAL",
    type: "BOTH",
    imageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778413946/VehicleRental_eeacbd.png",
    secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Bike_Rental_1_bmaj4c.png",
    displayOrder: 2,
    active: true,
    subCategories: [
      {
        name: "Bike Rental",
        description: "Scooters and motorcycles available by the hour or week — perfect for city commutes and open-road adventures.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Bike_Rental_1_bmaj4c.png",
        secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475577/Bike_Rental_2_vh5oua.png",
        displayOrder: 2,
        active: true
      },
      {
        name: "Car Rental",
        description: "Self-drive or chauffeur-driven cars — GPS-enabled, fully insured, and always road-ready.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2183&auto=format&fit=crop",
        secondaryImageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2070&auto=format&fit=crop",
        displayOrder: 1,
        active: true
      },
      {
        name: "Luxury Cars",
        description: "Premium sedans and SUVs for weddings, corporate events, and airport transfers — always impressive.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
        secondaryImageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop",
        displayOrder: 3,
        active: true
      }
    ]
  },
  {
    name: "Wedding & Party Services",
    description: "Everything you need for the perfect wedding day — from photography and decor to catering and bridal styling.",
    vertical: "WEDDING",
    type: "BOTH",
    imageUrl: "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=2070&auto=format&fit=crop",
    secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778413707/Wedding_Photo_flultf.png",
    displayOrder: 3,
    active: true,
    subCategories: [
      {
        name: "Photography",
        description: "Candid and artistic wedding photography services designed to capture every emotion.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Photography_2_rymouy.png",
        secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475580/Photograph_1_z2oxvb.png",
        displayOrder: 1,
        active: true
      },
      {
        name: "Decoration",
        description: "Elegant wedding decoration services featuring floral arrangements, stage setups, and customized themes.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475580/Wedding_1_aensgu.png",
        secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475578/Party_1_lb5rhi.png",
        displayOrder: 2,
        active: true
      },
      {
        name: "Catering",
        description: "Premium wedding catering services offering rich multi-cuisine menus and live food counters.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475582/Catering_1_v2p0sf.png",
        secondaryImageUrl: "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475582/Catering_2_kpv9z9.png",
        displayOrder: 3,
        active: true
      }
    ]
  }
];

const servicesData = [
  {
    slug: "photography",
    name: "Photography",
    shortDescription: "Professional wedding photography and cinematic shoots",
    fullDescription: "Capture your special moments with professional photographers, cinematic wedding films, candid photography, and premium editing services.",
    categoryGroup: "Wedding & Party Services",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2070&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
    ],
    startingPrice: 15000,
    priceUnit: "per event",
    rating: 4.8,
    totalReviews: 124,
    experience: "7 Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: ["Wedding", "Photography", "Cinematic"],
    featured: true,
    packages: [
      { title: "Basic Wedding Package", price: 15000, features: ["1 Photographer", "4 Hours Coverage", "100 Edited Photos"] },
      { title: "Premium Cinematic Package", price: 35000, features: ["2 Photographers", "Drone Shoot", "Cinematic Video", "Full Day Coverage"] },
    ],
    faqs: [
      { question: "Do you provide drone shots?", answer: "Yes, drone coverage is included in premium packages." },
      { question: "How many edited photos will we receive?", answer: "Usually between 100-500 depending on the package." }
    ],
    reviews: [
      { userName: "Rahul Sharma", rating: 5, comment: "Absolutely stunning photos. Every emotion captured beautifully." }
    ],
    providers: [
      { name: "Meera Sahoo", rating: 4.8, experience: "7 Years", location: "Patna", startingPrice: 15000, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "decoration",
    name: "Decoration",
    shortDescription: "Thematic floral, lighting, and wedding venue decor",
    fullDescription: "Transform your wedding venue with breathtaking floral arrangements, Mandap setups, premium lighting concepts, and custom themed decorations.",
    categoryGroup: "Wedding & Party Services",
    thumbnail: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"
    ],
    startingPrice: 25000,
    priceUnit: "per event",
    rating: 4.7,
    totalReviews: 96,
    experience: "5 Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: ["Decor", "Flowers", "Mandap", "Lighting"],
    featured: true,
    packages: [
      { title: "Standard Decor", price: 25000, features: ["Stage Decoration", "Entry Gate Floral Setup", "Basic Lighting"] },
      { title: "Royal Thematic Decor", price: 75000, features: ["Royal Mandap Setup", "Bespoke Lighting Design", "Full Venue Floral Drape", "Photobooth Spot"] },
    ],
    faqs: [
      { question: "Do you customize setups based on color themes?", answer: "Yes, we fully customize decor colors according to your choice." }
    ],
    reviews: [
      { userName: "Kriti Sen", rating: 5, comment: "The decor was magical. It looked like a fairytale wedding!" }
    ],
    providers: [
      { name: "Chef Jahan", rating: 4.7, experience: "5 Years", location: "Patna", startingPrice: 25000, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
    ]
  },
  {
    slug: "catering",
    name: "Catering",
    shortDescription: "Premium wedding catering and multi-cuisine dining",
    fullDescription: "Delight your guests with bespoke wedding catering, rich multi-cuisine buffets, live interactive counters, and high-end hospitality services.",
    categoryGroup: "Wedding & Party Services",
    thumbnail: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop",
    gallery: [],
    startingPrice: 450,
    priceUnit: "per plate",
    rating: 4.9,
    totalReviews: 184,
    experience: "10 Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: ["Catering", "Food", "Buffet", "Live Counters"],
    featured: true,
    packages: [
      { title: "Silver Menu", price: 450, features: ["2 Welcome Drinks", "2 Starters", "Main Course (6 items)", "1 Dessert"] },
      { title: "Royal Gold Menu", price: 1200, features: ["5 Welcome Drinks", "6 Starters", "Main Course (12 items)", "Live Counter Choice", "3 Desserts"] }
    ],
    faqs: [
      { question: "Do you offer pure vegetarian menus?", answer: "Yes, we specialize in both pure vegetarian and mixed menus." }
    ],
    reviews: [
      { userName: "Amit Sinha", rating: 5, comment: "Food was outstanding, guests loved every dish!" }
    ],
    providers: [
      { name: "Marcus Thorne", rating: 4.9, experience: "10 Years", location: "Patna", startingPrice: 450, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" }
    ]
  },
  {
    slug: "home-cctv",
    name: "Home CCTV Installation",
    shortDescription: "Home and residential security camera setups",
    fullDescription: "Secure your home with high-definition IP cameras, motion-activated alert systems, real-time mobile app streaming, and local+cloud recording setups.",
    categoryGroup: "CCTV Security",
    thumbnail: "/images/cctv-main.png",
    bannerImage: "/images/cctv-main.png",
    gallery: ["/images/cctv-main.png"],
    startingPrice: 499,
    priceUnit: "per visit",
    rating: 4.6,
    totalReviews: 87,
    experience: "5 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["CCTV", "Home Security", "IP Cameras", "Installation"],
    featured: true,
    packages: [
      { title: "Basic Setup", price: 499, features: ["Camera Installation (up to 2)", "Mobile App Config", "1 Month Support"] },
      { title: "Full Home Surveillance", price: 1999, features: ["Full Installation (up to 4 cameras)", "Network Configuration", "Alert Alerts Tuning", "6 Months Warranty"] }
    ],
    faqs: [
      { question: "Do you provide emergency service?", answer: "Yes, emergency support is available 24/7." }
    ],
    reviews: [
      { userName: "Aman Kumar", rating: 5, comment: "Quick response and affordable pricing." }
    ],
    providers: [
      { name: "PowerFix Electricians", rating: 4.7, experience: "6 Years", location: "Patna", startingPrice: 599, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "commercial-cctv",
    name: "Commercial CCTV Setup",
    shortDescription: "Business-scale camera infrastructure and control stations",
    fullDescription: "Enterprise-grade multi-camera networks, digital video recorders (NVR), central monitoring consoles, AI analytics, and high-performance server integration.",
    categoryGroup: "CCTV Security",
    thumbnail: "/images/cctv-main.png",
    bannerImage: "/images/cctv-main.png",
    gallery: [],
    startingPrice: 24999,
    priceUnit: "per setup",
    rating: 4.4,
    totalReviews: 63,
    experience: "4 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["CCTV", "Commercial", "Business", "Security"],
    featured: false,
    packages: [
      { title: "Basic Commercial Setup", price: 24999, features: ["4 High-Res Cameras", "NVR Recorder (1TB)", "Central Consol Config"] },
      { title: "Enterprise AI Security", price: 99999, features: ["16+ IP Cameras", "NVR Server (4TB)", "AI Face Detection Alerts", "1 Year Support AMC"] }
    ],
    faqs: [
      { question: "Do you bring your own tools?", answer: "Yes, all tools and basic spare parts are carried by our installers." }
    ],
    reviews: [
      { userName: "Ravi Prasad", rating: 4, comment: "Fixed the issues quickly, good service." }
    ],
    providers: [
      { name: "AquaFix Plumbers", rating: 4.5, experience: "5 Years", location: "Patna", startingPrice: 24999, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "cctv-maintenance",
    name: "Security Maintenance",
    shortDescription: "CCTV maintenance, wire repairs, and software updates",
    fullDescription: "Comprehensive health check for your security network. Includes camera cleaning, wiring check, software updates, hard drive optimization, and alert testing.",
    categoryGroup: "CCTV Security",
    thumbnail: "/images/cctv-main.png",
    bannerImage: "/images/cctv-main.png",
    gallery: [],
    startingPrice: 699,
    priceUnit: "per session",
    rating: 4.5,
    totalReviews: 112,
    experience: "3 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["Maintenance", "CCTV", "Repair", "Wiring"],
    featured: false,
    packages: [
      { title: "Basic Clean & Tune", price: 699, features: ["Camera Lens Cleaning", "Hard Drive Check", "Wiring Audit"] },
      { title: "Full System Refurbish", price: 2499, features: ["Full rewiring checks", "NVR Firmware Update", "Cloud Backup Integration", "30-day Free Support"] }
    ],
    faqs: [
      { question: "Do you provide cleaning supplies?", answer: "Yes, all specialized equipment and solutions are included." }
    ],
    reviews: [
      { userName: "Pooja Mishra", rating: 5, comment: "The system feels brand new and feeds are clearer!" }
    ],
    providers: [
      { name: "SparkleClean Services", rating: 4.6, experience: "4 Years", location: "Patna", startingPrice: 699, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "smart-locks",
    name: "Smart Lock Installation",
    shortDescription: "Digital smart locks and biometrics integration",
    fullDescription: "Upgrade your main door with high-security electronic smart locks, biometric fingerprint access, Wi-Fi remote unlock control, and smart home integration.",
    categoryGroup: "CCTV Security",
    thumbnail: "/images/cctv-main.png",
    bannerImage: "/images/cctv-main.png",
    gallery: [],
    startingPrice: 599,
    priceUnit: "per visit",
    rating: 4.5,
    totalReviews: 76,
    experience: "6 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["Smart Lock", "Security", "Biometric", "Home Setup"],
    featured: false,
    packages: [
      { title: "Basic Smart Lock Install", price: 599, features: ["Lock Installation", "Keypad Configuration", "App Linking Support"] },
      { title: "Premium Biometric Suite", price: 1799, features: ["Biometric Lock Install", "Smart Home Link", "Backup Key Config", "1 Month Warranty"] }
    ],
    faqs: [
      { question: "How long does installation take?", answer: "A standard installation takes about 1-2 hours." }
    ],
    reviews: [
      { userName: "Vikram Singh", rating: 4, comment: "Highly professional, locks work beautifully." }
    ],
    providers: [
      { name: "CoolTech AC Services", rating: 4.6, experience: "7 Years", location: "Patna", startingPrice: 599, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "car-rental",
    name: "Car Rental",
    shortDescription: "Affordable self-drive and chauffeur car rentals",
    fullDescription: "Rent premium hatchbacks, SUVs, and luxury sedans for weddings, corporate trips, airport pickups, and local commutes.",
    categoryGroup: "Vehicle Rental",
    thumbnail: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2183&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=2070&auto=format&fit=crop"
    ],
    startingPrice: 2499,
    priceUnit: "per day",
    rating: 4.5,
    totalReviews: 212,
    experience: "8 Years",
    available: true,
    serviceMode: "RENTAL",
    tags: ["Cars", "Rentals", "Self-Drive", "Wedding Car"],
    featured: false,
    packages: [
      { title: "Daily Rental Package", price: 2499, features: ["24 Hour Usage", "100 KM Included", "Fully Insured Fleet"] },
      { title: "Wedding Chauffeur Special", price: 7999, features: ["Luxury Car Selection", "Sleek Groom Decor", "Professional Driver Included"] }
    ],
    faqs: [
      { question: "Is fuel included in price?", answer: "Fuel charges are separate unless wedding package is chosen." }
    ],
    reviews: [
      { userName: "Neha Singh", rating: 4, comment: "Car condition was excellent and driver was polite." }
    ],
    providers: [
      { name: "DriveEasy Rentals", rating: 4.6, experience: "8 Years", location: "Patna", startingPrice: 2499, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "bike-rental",
    name: "Bike Rental",
    shortDescription: "Affordable bike and scooter rentals",
    fullDescription: "Rent scooters and commuter motorbikes for your daily errands, city rides, or weekend trips.",
    categoryGroup: "Vehicle Rental",
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1974&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1974&auto=format&fit=crop",
    gallery: [],
    startingPrice: 499,
    priceUnit: "per day",
    rating: 4.3,
    totalReviews: 134,
    experience: "5 Years",
    available: true,
    serviceMode: "RENTAL",
    tags: ["Bike", "Scooter", "Rental", "Commute"],
    featured: false,
    packages: [
      { title: "Half Day Commute", price: 299, features: ["4 Hours Ride", "50 KM Included", "Complimentary Helmet"] },
      { title: "Full Day Explore", price: 499, features: ["12 Hours Ride", "100 KM Included", "Helmet + Locking Gear"] }
    ],
    faqs: [
      { question: "Is a driving license required?", answer: "Yes, a valid driving license is mandatory at pickup." }
    ],
    reviews: [
      { userName: "Rohit Das", rating: 4, comment: "Affordable bike and very convenient for city traffic." }
    ],
    providers: [
      { name: "RideFast Rentals", rating: 4.4, experience: "5 Years", location: "Patna", startingPrice: 499, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" }
    ]
  },
  {
    slug: "luxury-cars",
    name: "Luxury Cars",
    shortDescription: "Premium luxury car rental services",
    fullDescription: "Arrive in style with our fleet of premium luxury vehicles — perfect for weddings, corporate events, and special occasions.",
    categoryGroup: "Vehicle Rental",
    thumbnail: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
    gallery: [],
    startingPrice: 8999,
    priceUnit: "per day",
    rating: 4.8,
    totalReviews: 89,
    experience: "10 Years",
    available: true,
    serviceMode: "RENTAL",
    tags: ["Luxury", "Cars", "Premium"],
    featured: true,
    packages: [
      { title: "Standard Luxury", price: 8999, features: ["BMW / Audi Selection", "Professional Driver", "8 Hours Usage"] },
      { title: "Wedding Special Rolls Royce", price: 19999, features: ["Rolls Royce / Mercedes Select", "Full Floral Decor", "Full Day Coverage", "Red Carpet Arrival"] }
    ],
    faqs: [
      { question: "Can we decorate the car for a wedding?", answer: "Yes, decoration is included in the wedding special package." }
    ],
    reviews: [
      { userName: "Ananya Gupta", rating: 5, comment: "Stunning Mercedes Benz. The driver arrived perfectly on time." }
    ],
    providers: [
      { name: "Elite Drive Luxury", rating: 4.9, experience: "10 Years", location: "Patna", startingPrice: 8999, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
    ]
  }
];

const seedData = async () => {
  await connectDB();

  console.log("🧹 Cleaning database...\n");

  // Remove all dummy services and categories
  const deletedServices = await Service.deleteMany({});
  const deletedCategories = await Category.deleteMany({});
  const deletedBookings = await Booking.deleteMany({});

  console.log(`   Removed ${deletedServices.deletedCount} services`);
  console.log(`   Removed ${deletedCategories.deletedCount} categories`);
  console.log(`   Removed ${deletedBookings.deletedCount} bookings`);

  console.log("\n🌱 Seeding categories...\n");
  const seededCategories = await Category.insertMany(categoriesData);
  console.log(`   Seeded ${seededCategories.length} categories successfully!`);

  // Map category names to their ObjectIDs
  const categoryMap = {};
  seededCategories.forEach((cat) => {
    categoryMap[cat.name] = cat._id;
  });

  console.log("\n🌱 Seeding services...\n");
  const servicesToInsert = servicesData.map((svc) => {
    const parentId = categoryMap[svc.categoryGroup];
    if (!parentId) {
      console.warn(`⚠️ Warning: Category group "${svc.categoryGroup}" not found for service "${svc.name}"`);
    }
    
    // Remove temporary categoryGroup field and add categoryObjectID
    const { categoryGroup, ...rest } = svc;
    return {
      ...rest,
      category: parentId,
      categoryName: svc.categoryGroup
    };
  });

  const seededServices = await Service.insertMany(servicesToInsert);
  console.log(`   Seeded ${seededServices.length} services successfully!`);

  // Promote any existing users with admin emails to admin role
  if (ADMIN_EMAILS.length > 0) {
    console.log(`\n👑 Admin emails from .env: ${ADMIN_EMAILS.join(", ")}`);

    for (const email of ADMIN_EMAILS) {
      const user = await User.findOne({ email });
      if (user) {
        if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
          console.log(`   ✅ Promoted "${user.name}" (${email}) to admin`);
        } else {
          console.log(`   ℹ️  "${user.name}" (${email}) is already admin`);
        }
      } else {
        console.log(`   ⏳ ${email} — not registered yet (will auto-promote on first login/signup)`);
      }
    }
  } else {
    console.log("\n⚠️  No ADMIN_EMAILS set in .env — no admin users configured.");
  }

  console.log("\n🎉 Database seeded successfully! Live changes will now propagate.");
  
  process.exit(0);
};

seedData().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
