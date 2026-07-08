
import homeCCTV1 from "../assets/cctv/cctvHeroImg.avif";
import homeCCTV2 from "../assets/cctv/cctvImg1.avif";


export const mockServices = [
  {
    id: 101,
    slug: "photography",
    name: "Photography",
    shortDescription: "Professional wedding photography and cinematic shoots",
    fullDescription:
      "Capture your special moments with professional photographers, cinematic wedding films, candid photography, and premium editing services.",
    categoryId: 10,
    categoryName: "Wedding Services",
    thumbnail:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2070&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
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
      {
        id: 1,
        title: "Basic Wedding Package",
        price: 15000,
        features: ["1 Photographer", "4 Hours Coverage", "100 Edited Photos"],
      },
      {
        id: 2,
        title: "Premium Cinematic Package",
        price: 35000,
        features: [
          "2 Photographers",
          "Drone Shoot",
          "Cinematic Video",
          "Full Day Coverage",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you provide drone shots?",
        answer: "Yes, drone coverage is included in premium packages.",
      },
      {
        question: "How many edited photos will we receive?",
        answer: "Usually between 100-500 depending on the package.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Rahul Sharma",
        rating: 5,
        comment: "Amazing photography and very professional team.",
      },
    ],
    providers: [
      {
        id: 1,
        name: "Royal Wedding Studio",
        rating: 4.9,
        experience: "10 Years",
        location: "Patna",
        startingPrice: 18000,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 102,
    slug: "decoration",
    name: "Decoration",
    shortDescription: "Wedding venue and stage decoration services",
    fullDescription:
      "Transform your wedding venue with stunning floral arrangements, stage setups, lighting, and thematic décor crafted by expert designers.",
    categoryId: 10,
    categoryName: "Wedding Services",
    thumbnail:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1561128290-002b5a7c1ea7?q=80&w=2070&auto=format&fit=crop",
    ],
    startingPrice: 25000,
    priceUnit: "per event",
    rating: 4.7,
    totalReviews: 98,
    experience: "6 Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: ["Wedding", "Decoration", "Floral"],
    featured: true,
    packages: [
      {
        id: 1,
        title: "Basic Décor",
        price: 25000,
        features: ["Stage Setup", "Basic Floral", "Lighting"],
      },
      {
        id: 2,
        title: "Premium Décor",
        price: 75000,
        features: [
          "Full Venue Decoration",
          "Floral Arch",
          "LED Lighting",
          "Theme Setup",
        ],
      },
    ],
    faqs: [
      {
        question: "Can we choose our own theme?",
        answer: "Yes, we offer fully customizable themes.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Priya Verma",
        rating: 5,
        comment: "The decoration was absolutely breathtaking!",
      },
    ],
    providers: [
      {
        id: 2,
        name: "Dream Décor Studio",
        rating: 4.8,
        experience: "8 Years",
        location: "Patna",
        startingPrice: 30000,
        image:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 103,
    slug: "catering",
    name: "Catering",
    shortDescription: "Food and catering services for wedding events",
    fullDescription:
      "Delight your guests with expertly prepared multi-cuisine menus, live counters, and full-service catering for weddings and large events.",
    categoryId: 10,
    categoryName: "Wedding Services",
    thumbnail:
      "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
    ],
    startingPrice: 50000,
    priceUnit: "per event",
    rating: 4.6,
    totalReviews: 145,
    experience: "10 Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: ["Wedding", "Catering", "Food"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Standard Menu",
        price: 50000,
        features: ["200 Guests", "Veg Menu", "Buffet Setup"],
      },
      {
        id: 2,
        title: "Premium Menu",
        price: 120000,
        features: [
          "500 Guests",
          "Veg + Non-Veg",
          "Live Counters",
          "Dessert Station",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle custom menu requests?",
        answer: "Yes, we customize menus based on your preferences.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Amit Sinha",
        rating: 5,
        comment: "Food was outstanding, guests loved every dish!",
      },
    ],
    providers: [
      {
        id: 3,
        name: "Royal Feast Caterers",
        rating: 4.7,
        experience: "12 Years",
        location: "Patna",
        startingPrice: 60000,
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 104,
    slug: "makeup-artist",
    name: "Makeup Artist",
    shortDescription: "Professional bridal makeup and styling services",
    fullDescription:
      "Look your absolute best on your special day with our certified bridal makeup artists specializing in HD, airbrush, and traditional looks.",
    categoryId: 10,
    categoryName: "Wedding Services",
    thumbnail:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop",
    gallery: [],
    startingPrice: 8000,
    priceUnit: "per session",
    rating: 4.9,
    totalReviews: 201,
    experience: "5 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["Bridal", "Makeup", "Styling"],
    featured: true,
    packages: [
      {
        id: 1,
        title: "Basic Bridal",
        price: 8000,
        features: ["HD Makeup", "Saree Draping", "Hair Setting"],
      },
      {
        id: 2,
        title: "Premium Bridal",
        price: 20000,
        features: [
          "Airbrush Makeup",
          "Hair Styling",
          "Pre-Bridal Session",
          "Touch-up Kit",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you offer trials before the event?",
        answer: "Yes, trial sessions are available at an additional cost.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Sneha Kumari",
        rating: 5,
        comment: "I felt like a queen! Absolutely loved the look.",
      },
    ],
    providers: [
      {
        id: 4,
        name: "Glam Studio by Riya",
        rating: 4.9,
        experience: "7 Years",
        location: "Patna",
        startingPrice: 10000,
        image:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 105,
    slug: "home-cctv",
    name: "Home CCTV Installation",
    shortDescription: "Professional electrical installation and repair",
    fullDescription:
      "Certified electricians for wiring, switchboard repair, fan installation, inverter setup, and complete home electrical maintenance.",
    categoryId: 1,
    categoryName: "CCTV Security",
    thumbnail: homeCCTV2,
    bannerImage: homeCCTV1,
    gallery: [homeCCTV2],
    startingPrice: 499,
    priceUnit: "per visit",
    rating: 4.6,
    totalReviews: 87,
    experience: "5 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["Electrician", "Repair", "Installation"],
    featured: true,
    packages: [
      {
        id: 1,
        title: "Basic Repair",
        price: 499,
        features: ["Minor Wiring Fix", "Switch Repair", "30 Minutes Support"],
      },
      {
        id: 2,
        title: "Home Inspection",
        price: 1999,
        features: ["Full Home Check", "Wiring Testing", "Safety Inspection"],
      },
    ],
    faqs: [
      {
        question: "Do you provide emergency service?",
        answer: "Yes, emergency electrician support is available 24/7.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Aman Kumar",
        rating: 5,
        comment: "Quick response and affordable pricing.",
      },
    ],
    providers: [
      {
        id: 5,
        name: "PowerFix Electricians",
        rating: 4.7,
        experience: "6 Years",
        location: "Delhi",
        startingPrice: 599,
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 106,
    slug: "commercial-cctv",
    name: "Commercial CCTV Setup",
    shortDescription: "Pipe fitting and leakage repair services",
    fullDescription:
      "Expert plumbers for pipe fitting, leakage repair, bathroom fixtures, water tank cleaning, and complete plumbing maintenance.",
    categoryId: 1,
    categoryName: "CCTV Security",
    thumbnail: "/images/cctv-main.png",
    bannerImage: "/images/cctv-main.png",
    gallery: [],
    startingPrice: 399,
    priceUnit: "per visit",
    rating: 4.4,
    totalReviews: 63,
    experience: "4 Years",
    available: true,
    serviceMode: "AT_HOME",
    tags: ["Plumbing", "Leakage", "Repair"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Basic Fix",
        price: 399,
        features: ["Leakage Repair", "Tap Replacement", "30 Min Support"],
      },
      {
        id: 2,
        title: "Full Bathroom Service",
        price: 1499,
        features: [
          "Full Bathroom Check",
          "Fixture Replacement",
          "Pipe Inspection",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you bring your own tools?",
        answer:
          "Yes, all tools and basic spare parts are carried by our plumbers.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Ravi Prasad",
        rating: 4,
        comment: "Fixed the issue quickly, good service.",
      },
    ],
    providers: [
      {
        id: 6,
        name: "AquaFix Plumbers",
        rating: 4.5,
        experience: "5 Years",
        location: "Patna",
        startingPrice: 499,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 107,
    slug: "cctv-maintenance",
    name: "Security Maintenance",
    shortDescription: "Home and office cleaning services",
    fullDescription:
      "Professional deep cleaning for homes, offices, and kitchens. We use eco-friendly products for a spotless, hygienic environment.",
    categoryId: 1,
    categoryName: "CCTV Security",
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
    tags: ["Cleaning", "Deep Clean", "Home"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Basic Clean",
        price: 699,
        features: ["2 BHK", "Sweeping & Mopping", "Bathroom Clean"],
      },
      {
        id: 2,
        title: "Deep Clean",
        price: 2499,
        features: [
          "Full Home",
          "Kitchen Scrub",
          "Sofa & Carpet Clean",
          "Eco Products",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you provide cleaning supplies?",
        answer: "Yes, all cleaning equipment and supplies are included.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Pooja Mishra",
        rating: 5,
        comment: "The house looked brand new after the cleaning!",
      },
    ],
    providers: [
      {
        id: 7,
        name: "SparkleClean Services",
        rating: 4.6,
        experience: "4 Years",
        location: "Patna",
        startingPrice: 799,
        image:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 108,
    slug: "smart-locks",
    name: "Smart Lock Installation",
    shortDescription: "Air conditioner installation and maintenance",
    fullDescription:
      "Certified technicians for AC installation, gas refilling, filter cleaning, PCB repair, and annual maintenance contracts.",
    categoryId: 1,
    categoryName: "CCTV Security",
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
    tags: ["AC", "Repair", "Installation"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Basic Service",
        price: 599,
        features: ["Filter Clean", "Gas Check", "Performance Test"],
      },
      {
        id: 2,
        title: "Full Service",
        price: 1799,
        features: ["Deep Clean", "Gas Refill", "PCB Check", "1 Month Warranty"],
      },
    ],
    faqs: [
      {
        question: "How long does AC servicing take?",
        answer: "A standard service takes about 1-2 hours.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Vikram Singh",
        rating: 4,
        comment: "AC is working perfectly now, good technician.",
      },
    ],
    providers: [
      {
        id: 8,
        name: "CoolTech AC Services",
        rating: 4.6,
        experience: "7 Years",
        location: "Patna",
        startingPrice: 699,
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 109,
    slug: "car-rental",
    name: "Car Rental",
    shortDescription: "Affordable self-drive and chauffeur car rentals",
    fullDescription:
      "Rent premium hatchbacks, SUVs, and luxury cars for weddings, travel, airport pickup, and corporate trips.",
    categoryId: 6,
    categoryName: "Vehicle Rental",
    thumbnail:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2183&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=2070&auto=format&fit=crop",
    ],
    startingPrice: 2499,
    priceUnit: "per day",
    rating: 4.5,
    totalReviews: 212,
    experience: "8 Years",
    available: true,
    serviceMode: "RENTAL",
    tags: ["Cars", "Rental", "Travel"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Daily Rental",
        price: 2499,
        features: ["24 Hour Usage", "100 KM Included", "Fuel Extra"],
      },
      {
        id: 2,
        title: "Wedding Rental",
        price: 7999,
        features: ["Luxury Car", "Decorated Vehicle", "Driver Included"],
      },
    ],
    faqs: [
      {
        question: "Is fuel included?",
        answer: "Fuel charges are separate unless specified.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Neha Singh",
        rating: 4,
        comment: "Car condition was excellent and pickup was smooth.",
      },
    ],
    providers: [
      {
        id: 9,
        name: "DriveEasy Rentals",
        rating: 4.6,
        experience: "8 Years",
        location: "Mumbai",
        startingPrice: 2999,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 110,
    slug: "bike-rental",
    name: "Bike Rental",
    shortDescription: "Bike and scooter rental services",
    fullDescription:
      "Ride freely with our wide range of bikes and scooters — perfect for city commutes, trips, and daily errands.",
    categoryId: 6,
    categoryName: "Vehicle Rental",
    thumbnail:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1974&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1974&auto=format&fit=crop",
    gallery: [],
    startingPrice: 499,
    priceUnit: "per day",
    rating: 4.3,
    totalReviews: 134,
    experience: "5 Years",
    available: true,
    serviceMode: "RENTAL",
    tags: ["Bike", "Scooter", "Rental"],
    featured: false,
    packages: [
      {
        id: 1,
        title: "Half Day",
        price: 299,
        features: ["4 Hours", "50 KM Included", "Helmet Included"],
      },
      {
        id: 2,
        title: "Full Day",
        price: 499,
        features: ["12 Hours", "100 KM Included", "Helmet + Lock"],
      },
    ],
    faqs: [
      {
        question: "Is a license required?",
        answer: "Yes, a valid driving license is mandatory.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Rohit Das",
        rating: 4,
        comment: "Good condition bikes, smooth booking process.",
      },
    ],
    providers: [
      {
        id: 10,
        name: "RideFast Rentals",
        rating: 4.4,
        experience: "5 Years",
        location: "Patna",
        startingPrice: 399,
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },

  {
    id: 111,
    slug: "luxury-cars",
    name: "Luxury Cars",
    shortDescription: "Premium luxury car rental services",
    fullDescription:
      "Arrive in style with our fleet of premium luxury vehicles — perfect for weddings, corporate events, and special occasions.",
    categoryId: 6,
    categoryName: "Vehicle Rental",
    thumbnail:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
    bannerImage:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
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
      {
        id: 1,
        title: "Standard Luxury",
        price: 8999,
        features: ["BMW / Audi", "Driver Included", "8 Hours"],
      },
      {
        id: 2,
        title: "Wedding Special",
        price: 19999,
        features: [
          "Rolls Royce / Mercedes",
          "Decorated",
          "Full Day",
          "Red Carpet",
        ],
      },
    ],
    faqs: [
      {
        question: "Can we decorate the car for a wedding?",
        answer: "Yes, decoration is available with the wedding package.",
      },
    ],
    reviews: [
      {
        id: 1,
        user: "Ananya Gupta",
        rating: 5,
        comment: "Absolutely stunning car, made our wedding day perfect!",
      },
    ],
    providers: [
      {
        id: 11,
        name: "Elite Drive Luxury",
        rating: 4.9,
        experience: "10 Years",
        location: "Delhi",
        startingPrice: 10000,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
      },
    ],
  },
];
