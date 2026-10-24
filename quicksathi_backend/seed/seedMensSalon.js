import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAsset(source, folder, publicId) {
  try {
    console.log(`📤 Uploading to Cloudinary [${folder}/${publicId}]...`);
    const res = await cloudinary.uploader.upload(source, {
      folder,
      public_id: publicId,
      overwrite: true,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    console.log(`   ✅ Success: ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.warn(`   ⚠️ Cloudinary upload fallback for ${publicId}:`, err.message);
    return source;
  }
}

const MEN_SERVICES_DATA = [
  {
    slug: "mens-grooming",
    name: "Men's Grooming & Styling",
    shortDescription: "Complete doorstep grooming packages for men: haircut, beard styling & relaxation",
    fullDescription: "Experience comprehensive doorstep grooming designed specifically for modern men. Services include personalized precision haircuts, bespoke beard shaping, exfoliating face cleanups, and tension-relieving head massages using premium men's grooming products.",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "mens-grooming-main",
    startingPrice: 349,
    priceUnit: "per package",
    rating: 4.8,
    totalReviews: 240,
    experience: "6 Years",
    tags: ["Men", "Men's Grooming", "Haircut", "Beard Styling", "Salon for Men", "Doorstep Salon"],
    packages: [
      {
        title: "Classic Grooming Combo",
        price: 349,
        features: ["Precision haircut", "Beard shaping / clean shave", "Cool towel finish", "Styling product application"]
      },
      {
        title: "Executive Men's Makeover",
        price: 799,
        features: ["Precision haircut", "Beard styling & edging", "De-tan face scrub & steam", "15-min head & shoulder massage", "Premium aftershave balm"]
      }
    ],
    faqs: [
      {
        question: "Do salon professionals carry their own equipment?",
        answer: "Yes, our certified barbers bring sanitized single-use blades, professional cordless clippers, capes, and branded grooming products."
      },
      {
        question: "How long does a full men's grooming session take?",
        answer: "A standard haircut and beard styling session takes approximately 35 to 45 minutes."
      }
    ]
  },
  {
    slug: "mens-haircut",
    name: "Men's Haircut & Styling",
    shortDescription: "Precision haircut, fade, taper, and hair styling by verified barbers at home",
    fullDescription: "Get a sharp, modern haircut without waiting in crowded barbershops. Whether you want a classic pompadour, skin fade, crew cut, or textured crop, our certified stylists tailor the cut to your face shape and hair texture.",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "mens-haircut-main",
    startingPrice: 249,
    priceUnit: "per cut",
    rating: 4.9,
    totalReviews: 310,
    experience: "7 Years",
    tags: ["Haircut", "Men's Haircut", "Fade Cut", "Hair Styling", "Barber at Home"],
    packages: [
      {
        title: "Standard Precision Haircut",
        price: 249,
        features: ["Style consultation", "Precision scissor & clipper cut", "Neck hairline trim", "Styling matte clay / wax"]
      },
      {
        title: "Haircut + Revitalizing Hair Wash",
        price: 399,
        features: ["Precision cut", "Dry shampoo cleansing wash", "Scalp tonic application", "Blow dry styling"]
      }
    ],
    faqs: [
      {
        question: "Can I show a photo of the hairstyle I want?",
        answer: "Absolutely! Our barbers welcome style photos and will advise on what works best for your hair density and face profile."
      }
    ]
  },
  {
    slug: "beard-grooming",
    name: "Beard Shaping & Trim",
    shortDescription: "Expert beard trimming, cheek line-up, moustache shaping & beard oil conditioning",
    fullDescription: "Keep your beard looking sharp, defined, and healthy. Our master barbers specialize in razor line-ups, clipper gradient trims, moustache styling, and nourishing beard oil hot towel treatments.",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "beard-grooming-main",
    startingPrice: 199,
    priceUnit: "per session",
    rating: 4.8,
    totalReviews: 195,
    experience: "5 Years",
    tags: ["Beard Trim", "Beard Shaping", "Moustache Styling", "Men", "Grooming"],
    packages: [
      {
        title: "Signature Beard Trim & Line-Up",
        price: 199,
        features: ["Clipper length trim", "Cheek & jawline defining", "Moustache trim", "Nourishing beard oil"]
      },
      {
        title: "Spa Beard Treatment & Shape",
        price: 349,
        features: ["Beard wash & steam", "Custom beard shape", "Single-use blade edging", "Deep conditioning beard butter"]
      }
    ],
    faqs: [
      {
        question: "Do you sanitize clippers between customers?",
        answer: "Yes, our clippers and trimmers undergo UV sterilization and disinfectant spray prior to every single appointment."
      }
    ]
  },
  {
    slug: "mens-facial",
    name: "Men's Facial & Glow",
    shortDescription: "Deep pore cleansing, blackhead extraction & brightening facial tailored for men's skin",
    fullDescription: "Tough on pollution, gentle on skin. Formulated specifically for male skin, our facials eliminate excess oil, extract stubborn blackheads, unclog congested pores, and restore a fresh, radiant complexion.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "mens-facial-main",
    startingPrice: 599,
    priceUnit: "per session",
    rating: 4.9,
    totalReviews: 160,
    experience: "6 Years",
    tags: ["Facial", "Men's Facial", "Glow Cleanup", "Skincare", "Blackhead Removal"],
    packages: [
      {
        title: "Deep Cleanse Charcoal Facial",
        price: 599,
        features: ["Activated charcoal face wash", "Steam & blackhead extraction", "Clay detox mask", "Hydrating serum"]
      },
      {
        title: "O3+ Men's Power Brightening Facial",
        price: 1199,
        features: ["Skin micro-exfoliation", "O3+ brightening peel", "Lymphatic drainage facial massage", "Vitamin C firming pack"]
      }
    ],
    faqs: [
      {
        question: "Should I shave before getting a facial?",
        answer: "We recommend shaving at least 6 to 8 hours prior to a facial to prevent skin sensitivity or micro-irritation during steam."
      }
    ]
  },
  {
    slug: "mens-shave",
    name: "Clean Shave & D-Tan",
    shortDescription: "Ultra-smooth straight razor shave with cooling post-shave balm & tan removal scrub",
    fullDescription: "Relive the classic luxury of a master barber shave at home. Includes warm lather preparation, precision single-use blade glide, gentle de-tan face buffing, and an invigorating cold towel finish.",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "mens-shave-main",
    startingPrice: 299,
    priceUnit: "per session",
    rating: 4.7,
    totalReviews: 135,
    experience: "5 Years",
    tags: ["Clean Shave", "Shaving", "D-Tan", "Face Scrub", "Men"],
    packages: [
      {
        title: "Classic Clean Shave",
        price: 299,
        features: ["Hot towel prep", "Rich foaming lather", "Single-use safety blade shave", "Alcohol-free soothing lotion"]
      },
      {
        title: "Royal Shave + De-Tan Pack",
        price: 499,
        features: ["Pre-shave essential oil", "Smooth close shave", "Fruit-acid de-tan face pack", "Chilled ice-globe massage"]
      }
    ],
    faqs: [
      {
        question: "Is razor irritation or razor burn prevented?",
        answer: "Yes, our barbers use pre-shave oils, warm softens, and brand-new fresh blades with anti-bacterial soothing gels."
      }
    ]
  },
  {
    slug: "mens-massage",
    name: "Head & Scalp Massage",
    shortDescription: "Relieve stress, headaches & muscle fatigue with therapeutic herbal oil scalp massage",
    fullDescription: "Melt away workday tension and mental exhaustion with our traditional pressure-point scalp and shoulder massage. Uses warm Ayurvedic or almond oils to stimulate blood circulation and deeply nourish hair roots.",
    imageUrl: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop",
    cloudinaryId: "mens-massage-main",
    startingPrice: 299,
    priceUnit: "per session",
    rating: 4.9,
    totalReviews: 280,
    experience: "8 Years",
    tags: ["Head Massage", "Scalp Massage", "Stress Relief", "Men", "Relaxation", "Ayurvedic"],
    packages: [
      {
        title: "20-Min Herbal Scalp Massage",
        price: 299,
        features: ["Warm Bhringraj / Almond oil", "Acupressure temple & scalp massage", "Neck tension release"]
      },
      {
        title: "40-Min Deep Relaxation Head & Shoulder Massage",
        price: 549,
        features: ["Warm therapeutic oil blend", "Full crown, temple & occipital massage", "Upper back & trapezoid shoulder pressure work", "Hot towel wrap"]
      }
    ],
    faqs: [
      {
        question: "Can I choose not to have oil in my hair?",
        answer: "Yes, we also provide dry acupressure head massages that require no oil or post-wash."
      }
    ]
  }
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB!");

    // 1. Find the Home Salon & Beauty Category
    let category = await Category.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId("6ab29208980407ffb3533466") },
        { vertical: "HOME_SALON" },
        { name: /Home Salon/i }
      ]
    });

    if (!category) {
      console.error("Home Salon & Beauty category not found!");
      process.exit(1);
    }

    console.log(`Found category: ${category.name} (${category._id})`);

    // 2. Add Men's Grooming subcategory if missing
    const hasMenSub = category.subCategories.some(sub => sub.name.toLowerCase().includes("men"));
    if (!hasMenSub) {
      category.subCategories.push({
        name: "Men's Salon & Grooming",
        description: "Doorstep haircuts, beard grooming, clean shaves, facials, and relaxing massages for men.",
        vertical: "HOME_SALON",
        type: "SERVICE_ONLY",
        imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop",
        secondaryImageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
        iconUrl: "",
        displayOrder: 6,
        active: true
      });
      await category.save();
      console.log("✅ Added Men's Salon & Grooming subcategory to Category document!");
    }

    // 3. Upsert Men's Grooming services with Cloudinary images
    for (const item of MEN_SERVICES_DATA) {
      console.log(`\nProcessing service: ${item.name} (${item.slug})...`);
      
      const uploadedImg = await uploadAsset(item.imageUrl, "TiptoBook/services", item.cloudinaryId);

      const serviceDoc = {
        slug: item.slug,
        name: item.name,
        shortDescription: item.shortDescription,
        fullDescription: item.fullDescription,
        category: category._id,
        categoryName: category.name,
        thumbnail: uploadedImg,
        bannerImage: uploadedImg,
        gallery: [uploadedImg],
        startingPrice: item.startingPrice,
        priceUnit: item.priceUnit,
        rating: item.rating,
        totalReviews: item.totalReviews,
        experience: item.experience,
        available: true,
        serviceMode: "AT_HOME",
        tags: item.tags,
        featured: true,
        perKmRate: 10,
        cities: [],
        approvalStatus: "approved",
        rejectionReason: "",
        packages: item.packages,
        faqs: item.faqs,
        reviews: [
          {
            userName: "Amit Verma",
            rating: 5,
            comment: "Super professional! Arrived right on time with completely sanitized tools. The haircut and beard shaping was top notch."
          },
          {
            userName: "Rohan Sharma",
            rating: 5,
            comment: "Very relaxing and convenient. Highly recommended for busy professionals."
          }
        ]
      };

      const result = await Service.findOneAndUpdate(
        { slug: item.slug },
        serviceDoc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`   ✅ Upserted service: ${result.name} (id: ${result._id})`);
    }

    console.log("\n🎉 ALL 6 Men's Grooming services seeded into MongoDB Atlas successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding Men's Salon services:", err);
    process.exit(1);
  }
}

seed();
