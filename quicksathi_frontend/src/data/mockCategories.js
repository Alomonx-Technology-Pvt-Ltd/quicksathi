export const mockCategories = [
  {
    id: 1,
    name: "CCTV Security",
    description:
      "Enterprise-grade CCTV and monitoring systems with expert installation and 24/7 support.",
    vertical: "CCTV_SECURITY",
    type: "BOTH",
    imageUrl:
      "/images/cctv-main.png",
    secondaryImageUrl:
      "/images/cctv-main.png",
    displayOrder: 1,
    active: true,
    parent: null,
    subCategories: [
      {
        id: 2,
        name: "Home Security",
        description:
          "Comprehensive residential security setups with high-res cameras, motion alerts, and mobile monitoring.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl:
          "/images/cctv-main.png",
        secondaryImageUrl:
          "/images/cctv-main.png",
        displayOrder: 1,
        active: true,
        parent: 1,
        subCategories: [],
      },
      {
        id: 3,
        name: "Commercial Pro",
        description:
          "Scalable security infrastructure for businesses, featuring AI monitoring and central control station access.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl:
          "/images/cctv-main.png",
        secondaryImageUrl:
          "/images/cctv-main.png",
        displayOrder: 2,
        active: true,
        parent: 1,
        subCategories: [],
      },
    ],
  },

  {
    id: 6,
    name: "Vehicle Rental",
    description:
      "Flexible vehicle rentals for every occasion — transparent pricing, well-maintained fleet, zero hidden charges.",
    vertical: "VEHICLE_RENTAL",
    type: "BOTH",
    imageUrl:
      "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778413946/VehicleRental_eeacbd.png",
    secondaryImageUrl:
      "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Bike_Rental_1_bmaj4c.png",
    displayOrder: 2,
    active: true,
    parent: null,
    subCategories: [
      {
        id: 8,
        name: "Bike Rental",
        description:
          "Scooters and motorcycles available by the hour or week — perfect for city commutes and open-road adventures.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Bike_Rental_1_bmaj4c.png",
        secondaryImageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475577/Bike_Rental_2_vh5oua.png",
        displayOrder: 2,
        active: true,
        parent: 6,
        subCategories: [],
      },
      {
        id: 7,
        name: "Car Rental",
        description:
          "Self-drive or chauffeur-driven cars — GPS-enabled, fully insured, and always road-ready.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl:
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2183&auto=format&fit=crop",
        secondaryImageUrl:
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2070&auto=format&fit=crop",
        displayOrder: 1,
        active: true,
        parent: 6,
        subCategories: [],
      },
      {
        id: 9,
        name: "Luxury Cars",
        description:
          "Premium sedans and SUVs for weddings, corporate events, and airport transfers — always impressive.",
        vertical: "VEHICLE_RENTAL",
        type: "PRODUCT_ONLY",
        imageUrl:
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop",
        secondaryImageUrl:
          "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2070&auto=format&fit=crop",
        displayOrder: 3,
        active: true,
        parent: 6,
        subCategories: [],
      },
    ],
  },

  {
    id: 10,
    name: "Wedding & Party Services",
    description:
      "Everything you need for the perfect wedding day — from photography and decor to catering and bridal styling.",
    vertical: "WEDDING",
    type: "BOTH",
    imageUrl:
      "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    secondaryImageUrl:
      "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778413707/Wedding_Photo_flultf.png",
    displayOrder: 3,
    active: true,
    parent: null,
    subCategories: [
      {
        id: 11,
        name: "Photography",
        description:
          "Candid and artistic wedding photography services designed to beautifully capture every emotion, ritual, celebration, and unforgettable moment of your special day with creativity, precision, and cinematic storytelling.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475579/Photography_2_rymouy.png",
        secondaryImageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475580/Photograph_1_z2oxvb.png",
        displayOrder: 1,
        active: true,
        parent: 10,
        subCategories: [],
      },
      {
        id: 12,
        name: "Decoration",
        description:
          "Elegant wedding decoration services featuring floral arrangements, stage setups, lighting concepts, entrance styling, and customized venue themes crafted to perfectly match your dream wedding vision.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475580/Wedding_1_aensgu.png",
        secondaryImageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475578/Party_1_lb5rhi.png",
        displayOrder: 2,
        active: true,
        parent: 10,
        subCategories: [],
      },
      {
        id: 13,
        name: "Catering",
        description:
          "Premium wedding catering services offering rich multi-cuisine menus, live food counters, professional hospitality staff, and beautifully presented dining experiences tailored for every celebration size.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475582/Catering_1_v2p0sf.png",
        secondaryImageUrl:
          "https://res.cloudinary.com/dtrhtdngp/image/upload/q_auto/f_auto/v1778475582/Catering_2_kpv9z9.png",
        displayOrder: 3,
        active: true,
        parent: 10,
        subCategories: [],
      },
    ],
  },
];
