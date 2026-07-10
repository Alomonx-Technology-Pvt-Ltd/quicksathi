import homeCCTV1 from "../assets/cctv/cctvHeroImg.avif";
import homeCCTV2 from "../assets/cctv/cctvImg1.avif";
import commercialCCTV1 from "../assets/cctv/commercialCCTV1.avif";
import smartLock from "../assets/cctv/smartLock.avif";
import maintenance from "../assets/cctv/maintenance.avif";
import bikeRental from "../assets/Bike/bikeRental.avif";
import hondaImg from "../assets/hondaImg.avif";
import carRental from "../assets/Bike/carRental.avif";
import photographyImg from "../assets/photographyImg.avif";
import photographyImg1 from "../assets/photographyImg1.avif";
import decorationImg from "../assets/decorationImg.avif";
import cateringImg from "../assets/cateringImg.avif";
import makeupArtist from "../assets/makeupArtist.avif";
import weddingImg from "../assets/weddingImg.avif";
import weddingImgg from "../assets/weddingImgg.avif";
import carImg from "../assets/carImg.avif";
import audiImg from "../assets/audiImg.avif";
import rangeRover from "../assets/rangeRover.avif";
import venueImg from "../assets/venueImg.avif";
import catering from "../assets/catering.avif";


export const mockCategories = [
  {
    id: 1,
    name: "CCTV Security",
    description:
      "Enterprise-grade CCTV and monitoring systems with expert installation and 24/7 support.",
    vertical: "CCTV_SECURITY",
    type: "BOTH",
    imageUrl: homeCCTV1,
    secondaryImageUrl: homeCCTV1,
    displayOrder: 1,
    active: true,
    parent: null,
    subCategories: [
      {
        id: 2,
        name: "Home CCTV Installation",
        description:
          "Comprehensive residential security setups with high-res cameras, motion alerts, and mobile monitoring.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: homeCCTV1,
        secondaryImageUrl: homeCCTV2,
        displayOrder: 1,
        active: true,
        parent: 1,
        subCategories: [],
      },
      {
        id: 3,
        name: "Commercial CCTV Setup",
        description:
          "Scalable security infrastructure for businesses, featuring AI monitoring and central control station access.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: commercialCCTV1,
        secondaryImageUrl: commercialCCTV1,
        displayOrder: 2,
        active: true,
        parent: 1,
        subCategories: [],
      },
      {
        id: 4,
        name: "Security Maintenance",
        description:
          "Professional deep cleaning for homes, offices, and kitchens. We use eco-friendly products for a spotless, hygienic environment.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: maintenance,
        secondaryImageUrl: "/images/cctv-main.png",
        displayOrder: 3,
        active: true,
        parent: 1,
        subCategories: [],
      },
      {
        id: 5,
        name: "Smart Lock Installation",
        description:
          "Certified technicians for AC installation, gas refilling, filter cleaning, PCB repair, and annual maintenance contracts.",
        vertical: "CCTV_SECURITY",
        type: "SERVICE_ONLY",
        imageUrl: smartLock,
        secondaryImageUrl: smartLock,
        displayOrder: 4,
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
    imageUrl: carRental,
    secondaryImageUrl: carRental,
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
        imageUrl: bikeRental,
        secondaryImageUrl: carRental,
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
        imageUrl: hondaImg,
        secondaryImageUrl: carImg,
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
        imageUrl: carRental,
        secondaryImageUrl: rangeRover,
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
    imageUrl: weddingImg,
    secondaryImageUrl: weddingImgg,
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
          photographyImg,
        secondaryImageUrl:
          photographyImg1,
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
          decorationImg,
        secondaryImageUrl: venueImg,
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
          cateringImg,
        secondaryImageUrl: catering,
        displayOrder: 3,
        active: true,
        parent: 10,
        subCategories: [],
      },
      {
        id: 14,
        name: "Makeup Artist",
        description:
          "Look your absolute best on your special day with our certified bridal makeup artists specializing in HD, airbrush, and traditional looks.",
        vertical: "WEDDING",
        type: "SERVICE_ONLY",
        imageUrl:
          makeupArtist
          ,
        secondaryImageUrl: makeupArtist,
        displayOrder: 4,
        active: true,
        parent: 10,
        subCategories: [],
      },
    ],
  },
];
