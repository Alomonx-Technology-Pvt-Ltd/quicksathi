import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";

async function seedPanditService() {
  await connectDB();
  console.log("Connected to MongoDB for Pandit Service seeding...");

  // 1. Find Wedding Category
  let weddingCat = await Category.findOne({
    $or: [{ vertical: "WEDDING" }, { name: /Wedding/i }],
  });

  if (!weddingCat) {
    console.error("Wedding category not found! Creating Wedding Category...");
    weddingCat = await Category.create({
      name: "Wedding & Party Services",
      description: "Everything you need for the perfect wedding day — from photography and pandit puja to decor and catering.",
      vertical: "WEDDING",
      type: "BOTH",
      imageUrl: "https://images.unsplash.com/photo-1610173826608-bd1f53a52db1?q=80&w=2070&auto=format&fit=crop",
      secondaryImageUrl: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=2070&auto=format&fit=crop",
      iconUrl: "/icons/categories/wedding-events.png",
      displayOrder: 2,
      active: true,
      subCategories: [],
    });
  }

  // 2. Add or Update Pandit SubCategory in Wedding
  const panditSubCategory = {
    name: "Pandit for Puja & Occasions",
    description: "Certified Vedic Pandits & Acharyas for Vivah Sanskar, Griha Pravesh, Hawan, and sacred ceremonies across India.",
    vertical: "WEDDING",
    type: "SERVICE_ONLY",
    imageUrl: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=2070&auto=format&fit=crop",
    secondaryImageUrl: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=2070&auto=format&fit=crop",
    iconUrl: "/icons/categories/pandit.png",
    displayOrder: 4,
    active: true,
  };

  const existingSubCatIndex = weddingCat.subCategories.findIndex(
    (sc) => sc.name.toLowerCase().includes("pandit") || sc.name.toLowerCase().includes("puja")
  );

  if (existingSubCatIndex >= 0) {
    weddingCat.subCategories[existingSubCatIndex] = {
      ...weddingCat.subCategories[existingSubCatIndex].toObject(),
      ...panditSubCategory,
    };
  } else {
    weddingCat.subCategories.push(panditSubCategory);
  }

  await weddingCat.save();
  console.log("✅ Wedding Category updated with 'Pandit for Puja & Occasions' subcategory!");

  // 3. Define the Pandit Service
  const panditServiceData = {
    slug: "pandit-service",
    name: "Pandit for Puja & Wedding Occasions",
    shortDescription: "Experienced Vedic Pandits for weddings, Griha Pravesh, Hawan, and sacred ceremonies across India",
    fullDescription:
      "Book certified, learned Vedic Pandits & Acharyas for all sacred ceremonies and family occasions across India. From full Vedic wedding rituals (Vivah Sanskar), pre-wedding Haldi & Tilak, to Griha Pravesh, Satyanarayan Katha, Rudrabhishek, Hawan, and Navgrah Shanti. Complete ritual guidance with authentic Sanskrit Vedic mantras, detailed samagri checklist, and Shubh Muhurat consultation included.",
    category: weddingCat._id,
    categoryName: weddingCat.name,
    categoryGroup: "Wedding & Party Services",
    thumbnail: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=2070&auto=format&fit=crop",
    bannerImage: "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1609358905581-e5381612486e?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2070&auto=format&fit=crop",
    ],
    startingPrice: 2100,
    priceUnit: "per ceremony",
    rating: 4.9,
    totalReviews: 215,
    experience: "12+ Years",
    available: true,
    serviceMode: "ON_SITE",
    tags: [
      "Pandit",
      "Purohit",
      "Wedding",
      "Vivah",
      "Puja",
      "Hawan",
      "Griha Pravesh",
      "Satyanarayan Katha",
      "Rudrabhishek",
      "Vedic",
    ],
    featured: true,
    packages: [
      {
        title: "Satyanarayan Katha & Hawan",
        price: 2100,
        features: [
          "Complete Shri Satyanarayan Puja & 5-Chapter Katha",
          "Hawan & Purnahuti Vedic Rituals",
          "Aarti, Sankalp & Prasad Blessing",
          "1 Certified Vedic Pandit",
          "Duration: ~2.5 to 3 Hours",
        ],
      },
      {
        title: "Griha Pravesh & Vastu Shanti",
        price: 4500,
        features: [
          "Dwar Puja, Kalash Sthapana & Navgrah Puja",
          "Vastu Dosh Nivaran & Shanti Hawan",
          "Ganesh-Lakshmi Abhishek & Shankh Naad",
          "First Cooking (Doodh Ubalna) blessing",
          "Senior Vedic Acharya (~3.5 to 4 Hours)",
        ],
      },
      {
        title: "Pre-Wedding (Engagement / Roka / Tilak / Haldi)",
        price: 5100,
        features: [
          "Shubh Muhurat calculation & Gotra Sankalp",
          "Ganesh & Gauri Puja, Tilak Vidhi",
          "Ring Ceremony & Auspicious Blessing",
          "Haldi / Mehendi Sanctification Rituals",
          "Complete guidance for bride & groom families",
        ],
      },
      {
        title: "Wedding Ceremony (Full Vivah Sanskar)",
        price: 11000,
        features: [
          "Complete Vedic Vivah Vidhi (2 Experienced Pandits)",
          "Mandap Sthapana, Dwar Puja, Jai Mala",
          "Kanyadaan, Panigrahana & Hasta Melap",
          "Agni Sthapana, Saptapadi (7 Pheras) & Laja Homa",
          "Sindoor Daan, Mangalsutra & Elder Ashirwad Samaroh",
        ],
      },
      {
        title: "Rudrabhishek & Mahamrityunjaya Puja",
        price: 3500,
        features: [
          "Laghu Rudri Path with Authentic Vedic Chanting",
          "Panchamrit & Gangajal Shivling Abhishek",
          "Bilva Patra & 108 Sacred Name Archana",
          "Aarti, Hawan & Raksha Sutra blessing",
          "Duration: ~2.5 Hours",
        ],
      },
      {
        title: "Namkaran / Mundan / Janeu Sanskar",
        price: 3100,
        features: [
          "Traditional Sanskar as per Vedic astrology",
          "Nakshatra & Rashi calculation for auspicious name",
          "Ganesh Puja, Navgrah & Homa rituals",
          "Ayushya Sukta & family Ashirwad",
          "Duration: ~2 to 2.5 Hours",
        ],
      },
    ],
    faqs: [
      {
        question: "Will the Pandit bring the Puja Samagri?",
        answer:
          "We provide a comprehensive checklist of all necessary samagri well in advance. If preferred, an all-inclusive fresh puja samagri kit can also be arranged upon request.",
      },
      {
        question: "Can we book a Pandit who follows our specific regional traditions?",
        answer:
          "Yes! We have verified Vedic Pandits proficient in North Indian, Bihari, Maithil, Bhojpuri, Marwari, Gujarati, Bengali, and South Indian customs and Vedic traditions.",
      },
      {
        question: "Is Shubh Muhurat consultation included with this service?",
        answer:
          "Yes, after booking, our senior Acharya calculates and confirms the exact auspicious Shubh Muhurat based on your Gotra and Nakshatra at no extra cost.",
      },
      {
        question: "How far in advance should we book for a wedding ceremony?",
        answer:
          "For wedding ceremonies, we recommend booking at least 1 to 2 weeks in advance so our senior Acharyas can be reserved for your wedding dates.",
      },
    ],
    reviews: [
      {
        userName: "Vikramaditya Roy",
        rating: 5,
        comment:
          "Pandit ji conducted our Griha Pravesh with complete Vedic authenticity and explained the spiritual meaning behind every mantra. Highly recommended!",
      },
      {
        userName: "Ananya Mishra",
        rating: 5,
        comment:
          "Booked for our brother's wedding ceremony. The rituals were performed with utmost devotion and without any hurry. Wonderful experience!",
      },
    ],
    providers: [
      {
        name: "Acharya Ramashray Shastri",
        rating: 4.9,
        experience: "15+ Years",
        location: "Pan-India",
        startingPrice: 2100,
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1974&auto=format&fit=crop",
      },
      {
        name: "Pt. Devendra Upadhyay",
        rating: 4.8,
        experience: "11+ Years",
        location: "Pan-India",
        startingPrice: 2100,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      },
    ],
  };

  const existingService = await Service.findOne({ slug: "pandit-service" });
  if (existingService) {
    Object.assign(existingService, panditServiceData);
    await existingService.save();
    console.log("✅ Pandit Service updated successfully!");
  } else {
    await Service.create(panditServiceData);
    console.log("✅ Pandit Service created successfully!");
  }

  // (Removed) This script used to rewrite the provider location of EVERY service from "Patna" to "Pan-India".
  // A seed for one service must only touch that service.

  await mongoose.disconnect();
  console.log("MongoDB disconnected. Pandit seeding complete!");
}

seedPanditService().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
