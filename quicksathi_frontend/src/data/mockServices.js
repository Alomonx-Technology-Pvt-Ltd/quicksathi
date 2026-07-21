
import homeCCTV1 from "../assets/cctv/cctvHeroImg.avif";
import homeCCTV2 from "../assets/cctv/cctvImg1.avif";
import photogarphyHeroImg from "../assets/photographyService/photographyImg1.avif"
import homeTuitionImg from "../assets/HomeTution/homeTuitionImg.avif"

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
      photogarphyHeroImg,
    bannerImage:
      photogarphyHeroImg,
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
    shortDescription: "Professional CCTV camera installation with smart monitoring solutions",
    fullDescription:
      "Secure your home with high-resolution CCTV cameras, remote monitoring, motion detection, and professional installation support.",
    categoryId: 1,
    categoryName: "CCTV Security",
    thumbnail: homeCCTV1,
    bannerImage: homeCCTV2,
    gallery: [homeCCTV1],
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
  {
 id: 16,
slug: "school-tuition",
name: "School Tuition",
  shortDescription:
    "Experienced home tutors for all classes and competitive exams.",

  fullDescription:
    "Learn from verified and experienced tutors at home. We provide personalized coaching for school students, college subjects, spoken English, coding, and competitive exam preparation.",

  categoryId: 15,
  categoryName: "Home Tuition",

  thumbnail: homeTuitionImg,
  bannerImage: homeTuitionImg,
  gallery: [homeTuitionImg],

  startingPrice: 499,
  priceUnit: "per session",

  rating: 4.8,
  totalReviews: 165,
  experience: "6 Years",

  available: true,
  serviceMode: "AT_HOME",

  tags: [
    "Home Tutor",
    "Math",
    "Science",
    "English",
    "Coding",
  ],

  featured: true,

  packages: [
    {
      id: 1,
      title: "School Tuition",
      price: 499,
      features: [
        "1 Hour Session",
        "Class 1-10",
        "Weekly Progress",
      ],
    },
    {
      id: 2,
      title: "Advanced Coaching",
      price: 999,
      features: [
        "Class 11-12",
        "JEE/NEET Foundation",
        "Experienced Tutor",
      ],
    },
  ],

  faqs: [
    {
      question: "Can I choose the tutor?",
      answer:
        "Yes. You can select tutors based on subject, experience, and ratings.",
    },
    {
      question: "Do you provide demo classes?",
      answer: "Yes, a free demo class is available.",
    },
  ],

  reviews: [
    {
      id: 1,
      user: "Aarav Patel",
      rating: 5,
      comment:
        "Excellent tutor. My son's grades improved significantly.",
    },
  ],

  providers: [
    {
      id: 12,
      name: "EduHome Tutors",
      rating: 4.9,
      experience: "8 Years",
      location: "Pune",
      startingPrice: 600,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    },
  ],
},
{
  id: 17,
  slug: "online-tuition",
  name: "Online Tuition",

  shortDescription:
    "Live online classes with experienced tutors for all subjects.",

  fullDescription:
    "Attend interactive online classes from the comfort of your home. Learn through live video sessions, digital notes, recorded lectures, and one-on-one doubt solving.",

  categoryId: 15,
  categoryName: "Home Tuition",

  thumbnail: homeTuitionImg,
  bannerImage: homeTuitionImg,
  gallery: [homeTuitionImg],

  startingPrice: 599,
  priceUnit: "per session",

  rating: 4.8,
  totalReviews: 120,
  experience: "5 Years",

  available: true,
  serviceMode: "ONLINE",

  tags: [
    "Online",
    "Tutor",
    "Live Classes",
    "Education",
  ],

  featured: true,

  packages: [
    {
      id: 1,
      title: "Basic Online",
      price: 599,
      features: [
        "1 Hour Live Class",
        "Recorded Session",
        "Doubt Solving",
      ],
    },
    {
      id: 2,
      title: "Premium Online",
      price: 999,
      features: [
        "Personal Mentor",
        "Assignments",
        "Weekly Tests",
      ],
    },
  ],

  faqs: [
    {
      question: "Do classes get recorded?",
      answer: "Yes, every session is recorded.",
    },
  ],

  reviews: [
    {
      id: 1,
      user: "Riya Sharma",
      rating: 5,
      comment: "Very interactive online classes.",
    },
  ],

  providers: [
    {
      id: 13,
      name: "Edu Online Academy",
      rating: 4.8,
      experience: "6 Years",
      location: "Pune",
      startingPrice: 599,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    },
  ],
},
{
  id: 18,
  slug: "competitive-exam-coaching",
  name: "Competitive Exam Coaching",

  shortDescription:
    "Expert coaching for JEE, NEET, UPSC, SSC, Banking and more.",

  fullDescription:
    "Prepare with experienced faculty through structured study plans, mock tests, doubt solving sessions, and personalized mentorship.",

  categoryId: 15,
  categoryName: "Home Tuition",

  thumbnail: homeTuitionImg,
  bannerImage: homeTuitionImg,
  gallery: [homeTuitionImg],

  startingPrice: 999,
  priceUnit: "per session",

  rating: 4.9,
  totalReviews: 210,
  experience: "10 Years",

  available: true,
  serviceMode: "BOTH",

  tags: [
    "JEE",
    "NEET",
    "UPSC",
    "SSC",
  ],

  featured: true,

  packages: [
    {
      id: 1,
      title: "Foundation Batch",
      price: 999,
      features: [
        "Live Classes",
        "Weekly Tests",
        "Study Material",
      ],
    },
    {
      id: 2,
      title: "Advanced Batch",
      price: 1999,
      features: [
        "Mock Tests",
        "Personal Mentor",
        "Performance Analysis",
      ],
    },
  ],

  faqs: [
    {
      question: "Do you provide mock tests?",
      answer: "Yes, every week.",
    },
  ],

  reviews: [
    {
      id: 1,
      user: "Akash Verma",
      rating: 5,
      comment: "Best coaching experience.",
    },
  ],

  providers: [
    {
      id: 14,
      name: "Success Academy",
      rating: 4.9,
      experience: "10 Years",
      location: "Pune",
      startingPrice: 999,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    },
  ],
},
{
  id: 19,
  slug: "language-classes",
  name: "Language Classes",

  shortDescription:
    "Learn English, Hindi, Marathi, German, French and more.",

  fullDescription:
    "Master new languages with certified trainers through practical speaking sessions, grammar lessons, and interactive activities.",

  categoryId: 15,
  categoryName: "Home Tuition",

  thumbnail: homeTuitionImg,
  bannerImage: homeTuitionImg,
  gallery: [homeTuitionImg],

  startingPrice: 699,
  priceUnit: "per session",

  rating: 4.7,
  totalReviews: 140,
  experience: "7 Years",

  available: true,
  serviceMode: "BOTH",

  tags: [
    "English",
    "French",
    "German",
    "Spoken English",
  ],

  featured: true,

  packages: [
    {
      id: 1,
      title: "Basic Language Course",
      price: 699,
      features: [
        "Speaking Practice",
        "Grammar",
        "Vocabulary",
      ],
    },
    {
      id: 2,
      title: "Advanced Fluency",
      price: 1299,
      features: [
        "Conversation",
        "Interview Preparation",
        "Certification",
      ],
    },
  ],

  faqs: [
    {
      question: "Do you provide certificates?",
      answer: "Yes, after successful course completion.",
    },
  ],

  reviews: [
    {
      id: 1,
      user: "Priya Patil",
      rating: 5,
      comment: "My spoken English improved a lot.",
    },
  ],

  providers: [
    {
      id: 15,
      name: "Speak Fluent Academy",
      rating: 4.8,
      experience: "7 Years",
      location: "Pune",
      startingPrice: 699,
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
    },
  ],
},
{
  id: 20,
  slug: "maid-service",
  name: "Maid Service",
  shortDescription: "Daily cleaning, dusting, and sweeping services",
  fullDescription: "Background-verified, professional, and reliable daily maid services for sweeping, mopping, utensil washing, and keeping your home clean and hygienic.",
  categoryId: 20,
  categoryName: "House Help",
  thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
  bannerImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop",
  gallery: [],
  startingPrice: 2000,
  priceUnit: "per month",
  rating: 4.8,
  totalReviews: 195,
  experience: "4 Years",
  available: true,
  serviceMode: "AT_HOME",
  tags: ["Maid", "Cleaning", "Housekeeping", "Helper"],
  featured: true,
  packages: [
    { id: 1, title: "Standard Housekeeping", price: 2000, features: ["Daily Sweeping & Mopping", "Utensil Washing", "Light dusting"] },
    { id: 2, title: "Premium Full-Day Maid", price: 4500, features: ["All standard features", "Laundry & Ironing", "Kitchen cleaning", "Flexible hours"] }
  ],
  faqs: [
    { question: "Are your maids background verified?", answer: "Yes, police verification and ID checks are completed for all partners." }
  ],
  reviews: [
    { id: 1, user: "Deepak Joshi", rating: 5, comment: "Very punctual and cleans the house perfectly." }
  ],
  providers: [
    { id: 20, name: "Homely Comfort Housekeepers", rating: 4.8, experience: "4 Years", location: "Patna", startingPrice: 2000, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" }
  ]
},
{
  id: 21,
  slug: "cooking-service",
  name: "Cooking Service",
  shortDescription: "Delicious home-cooked healthy meals",
  fullDescription: "Hire highly experienced home cooks and professional chefs for preparation of hygienic, delicious, and customized home-cooked meals (Veg/Non-Veg) matching your taste.",
  categoryId: 20,
  categoryName: "House Help",
  thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
  bannerImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
  gallery: [],
  startingPrice: 3000,
  priceUnit: "per month",
  rating: 4.7,
  totalReviews: 124,
  experience: "5 Years",
  available: true,
  serviceMode: "AT_HOME",
  tags: ["Cook", "Chef", "Food", "Kitchen"],
  featured: true,
  packages: [
    { id: 1, title: "Single Meal Cook", price: 3000, features: ["Lunch or Dinner preparation", "Daily clean-up of cooktop", "Simple Indian Menus"] },
    { id: 2, title: "Full Day Cook", price: 6000, features: ["Breakfast, Lunch, & Dinner prep", "Dietary adjustments (low salt/sugar)", "Up to 5 family members", "Snack prep support"] }
  ],
  faqs: [
    { question: "Does the cook buy groceries?", answer: "Grocery shopping can be arranged at an additional cost, or you can provide materials." }
  ],
  reviews: [
    { id: 1, user: "Sneha Kapoor", rating: 5, comment: "Cook makes excellent North Indian dishes. Very polite too." }
  ],
  providers: [
    { id: 21, name: "Patna Foodies Kitchen Cooks", rating: 4.7, experience: "5 Years", location: "Patna", startingPrice: 3000, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" }
  ]
},
{
  id: 22,
  slug: "babysitting-nanny",
  name: "Babysitting / Nanny",
  shortDescription: "Caring child care and babysitting services",
  fullDescription: "Trained, gentle, and child-loving nannies and babysitters to support your family. Experienced in child feeding, playtime interaction, and maintaining a safe and clean environment for kids.",
  categoryId: 20,
  categoryName: "House Help",
  thumbnail: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2038&auto=format&fit=crop",
  bannerImage: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=2038&auto=format&fit=crop",
  gallery: [],
  startingPrice: 5000,
  priceUnit: "per month",
  rating: 4.6,
  totalReviews: 54,
  experience: "3 Years",
  available: true,
  serviceMode: "AT_HOME",
  tags: ["Nanny", "Babysitting", "Child Care", "Toddler"],
  featured: false,
  packages: [
    { id: 1, title: "Part-Time Nanny", price: 5000, features: ["4 Hours Daily Coverage", "Feeding support", "Safety Monitoring", "Creative Play"] },
    { id: 2, title: "Full-Time Care Nanny", price: 10000, features: ["8-10 Hours Daily Coverage", "Bathing & dressing support", "Nap schedule maintenance", "Homework/reading support"] }
  ],
  faqs: [
    { question: "Do babysitters have CPR training?", answer: "Many of our elite nannies are certified in basic child safety and first aid." }
  ],
  reviews: [
    { id: 1, user: "Ankita Patel", rating: 4, comment: "Excellent nanny. Very patient with my active toddler." }
  ],
  providers: [
    { id: 22, name: "TinyTots Babysitting Co.", rating: 4.6, experience: "3 Years", location: "Patna", startingPrice: 5000, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1974&auto=format&fit=crop" }
  ]
},
{
  id: 23,
  slug: "elder-care",
  name: "Elder Care / Patient Care",
  shortDescription: "Compassionate nursing and elder assistance",
  fullDescription: "Dedicated elderly care assistants and home nurse aides to assist your loved ones with daily activities, medication schedules, mobility support, and companionship.",
  categoryId: 20,
  categoryName: "House Help",
  thumbnail: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2018&auto=format&fit=crop",
  bannerImage: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2018&auto=format&fit=crop",
  gallery: [],
  startingPrice: 8000,
  priceUnit: "per month",
  rating: 4.8,
  totalReviews: 96,
  experience: "7 Years",
  available: true,
  serviceMode: "AT_HOME",
  tags: ["Elder Care", "Senior", "Patient Care", "Nurse Helper"],
  featured: false,
  packages: [
    { id: 1, title: "Day Companion", price: 8000, features: ["Medication reminders", "Daily walk support", "Companion talks (4 hrs/day)"] },
    { id: 2, title: "Full-Time Nursing Assistant", price: 15000, features: ["10 Hours daily assistance", "Grooming & bathing help", "Vitals monitoring", "Doctor coordination support"] }
  ],
  faqs: [
    { question: "Do they handle medical injections?", answer: "They provide general caregiver support. For medical nursing like IVs or injections, ask for our specialized nurse list." }
  ],
  reviews: [
    { id: 1, user: "Prabhat Sinha", rating: 5, comment: "Provided excellent care for my grandfather post-surgery." }
  ],
  providers: [
    { id: 23, name: "Caring Hearts Elder Care", rating: 4.8, experience: "7 Years", location: "Patna", startingPrice: 8000, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" }
  ]
}
];
