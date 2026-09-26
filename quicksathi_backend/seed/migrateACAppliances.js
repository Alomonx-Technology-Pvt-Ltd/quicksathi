import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";

/**
 * ADDITIVE MIGRATION SCRIPT
 * ─────────────────────────
 * Does NOT wipe the database. Instead it:
 * 1. Creates "AC & Appliances" category if it doesn't exist
 * 2. Moves CCTV sub-categories into "House Services & Repair"
 * 3. Moves CCTV services to "House Services & Repair" category
 * 4. Deactivates the old "CCTV Security" category
 * 5. Creates 7 real AC & Appliances services
 */

const migrate = async () => {
  await connectDB();

  console.log("\n🔧 AC & Appliances Migration — Non-destructive\n");

  // ── Step 1: Create "AC & Appliances" category ────────────────────────────
  let acCategory = await Category.findOne({ vertical: "AC_APPLIANCES" });
  if (!acCategory) {
    console.log("📦 Creating AC & Appliances category...");
    acCategory = await Category.create({
      name: "AC & Appliances",
      description:
        "Professional AC repair, servicing, gas refill, installation & uninstallation — trusted technicians at your doorstep.",
      vertical: "AC_APPLIANCES",
      type: "SERVICE_ONLY",
      imageUrl:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-checkup.jpg",
      secondaryImageUrl:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315768/TiptoBook/services/ac-annual-maintenance.jpg",
      iconUrl: "/icons/categories/ac-appliances.png",
      displayOrder: 7,
      active: true,
      comingSoon: false,
      subCategories: [
        {
          name: "Repair & Services",
          description:
            "AC check-up, lite service, foam jet deep cleaning — diagnose and fix cooling issues fast.",
          vertical: "AC_APPLIANCES",
          type: "SERVICE_ONLY",
          imageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-checkup.jpg",
          secondaryImageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330173/TiptoBook/services/foam-jet-ac-service.png",
          displayOrder: 1,
          active: true,
        },
        {
          name: "Gas Refill",
          description:
            "AC gas refill and leak detection for instant cooling restoration.",
          vertical: "AC_APPLIANCES",
          type: "SERVICE_ONLY",
          imageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-gas-refill.png",
          secondaryImageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-gas-refill.png",
          displayOrder: 2,
          active: true,
        },
        {
          name: "Install & Uninstall",
          description:
            "Safe AC installation and uninstallation with performance checks by certified technicians.",
          vertical: "AC_APPLIANCES",
          type: "SERVICE_ONLY",
          imageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
          secondaryImageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315767/TiptoBook/services/ac-uninstallation.jpg",
          displayOrder: 3,
          active: true,
        },
        {
          name: "Saver Packs",
          description:
            "Annual maintenance contracts and combo service packs at discounted rates.",
          vertical: "AC_APPLIANCES",
          type: "SERVICE_ONLY",
          imageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315768/TiptoBook/services/ac-annual-maintenance.jpg",
          secondaryImageUrl:
            "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315768/TiptoBook/services/ac-annual-maintenance.jpg",
          displayOrder: 4,
          active: true,
        },
      ],
    });
    console.log(`   ✅ Created category: ${acCategory.name} (${acCategory._id})`);
  } else {
    console.log(`   ℹ️  AC & Appliances category already exists (${acCategory._id})`);
  }

  // ── Step 2: Move CCTV sub-categories into House Services & Repair ────────
  const houseServicesCategory = await Category.findOne({
    vertical: "HOUSE_SERVICES",
  });

  if (houseServicesCategory) {
    const cctvSubNames = ["Home Security", "Commercial Pro", "CCTV Installation", "Smart Lock"];
    const existingSubNames = houseServicesCategory.subCategories.map((s) => s.name);

    // Add CCTV-related subcategories if not already present
    const cctvSubs = [
      {
        name: "CCTV & Security",
        description:
          "Comprehensive CCTV camera installation, smart locks, and security system maintenance for homes and businesses.",
        vertical: "HOUSE_SERVICES",
        type: "SERVICE_ONLY",
        imageUrl: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315770/TiptoBook/services/cctv-main.jpg",
        secondaryImageUrl: "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315770/TiptoBook/services/cctv-main.jpg",
        displayOrder: 5,
        active: true,
      },
    ];

    let addedCount = 0;
    for (const sub of cctvSubs) {
      if (!existingSubNames.includes(sub.name)) {
        houseServicesCategory.subCategories.push(sub);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await houseServicesCategory.save();
      console.log(
        `   ✅ Added ${addedCount} CCTV sub-category to "House Services & Repair"`
      );
    } else {
      console.log(`   ℹ️  CCTV sub-categories already in House Services & Repair`);
    }
  } else {
    console.warn("   ⚠️  House Services & Repair category not found!");
  }

  // ── Step 3: Move existing CCTV services to House Services & Repair ───────
  const cctvCategory = await Category.findOne({ vertical: "CCTV_SECURITY" });
  if (cctvCategory && houseServicesCategory) {
    const movedServices = await Service.updateMany(
      { category: cctvCategory._id },
      {
        $set: {
          category: houseServicesCategory._id,
          categoryName: houseServicesCategory.name,
        },
      }
    );
    console.log(
      `   ✅ Moved ${movedServices.modifiedCount} CCTV services → House Services & Repair`
    );

    // Deactivate old CCTV category
    cctvCategory.active = false;
    await cctvCategory.save();
    console.log(`   ✅ Deactivated old CCTV Security category`);
  } else if (!cctvCategory) {
    console.log(`   ℹ️  No CCTV Security category found to migrate`);
  }

  // ── Step 4: Create 7 real AC & Appliances services ───────────────────────
  const acServicesSeed = [
    {
      slug: "ac-checkup",
      name: "AC Check-up",
      shortDescription:
        "Accurate AC issue diagnosis before any repair",
      fullDescription:
        "Get a thorough AC health check-up by certified technicians. Includes compressor testing, gas pressure check, thermostat calibration, electrical connection audit, and a detailed report with repair recommendations. Visitation fee will be adjusted in the final repair quote.",
      thumbnail:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-checkup.jpg",
      bannerImage:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-checkup.jpg",
      gallery: [
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-checkup.jpg",
      ],
      startingPrice: 299,
      priceUnit: "per visit",
      rating: 4.7,
      totalReviews: 8831,
      experience: "5 Years",
      available: true,
      serviceMode: "AT_HOME",
      tags: ["AC", "Check-up", "Diagnosis", "Repair", "Air Conditioner"],
      featured: true,
      packages: [
        {
          title: "Split AC Check-up",
          price: 299,
          features: [
            "Compressor & gas pressure test",
            "Thermostat calibration",
            "Electrical connection check",
            "Detailed diagnosis report",
          ],
        },
        {
          title: "Window AC Check-up",
          price: 249,
          features: [
            "Full unit inspection",
            "Cooling efficiency test",
            "Filter & coil check",
            "Written diagnosis report",
          ],
        },
      ],
      faqs: [
        {
          question: "Will the check-up fee be adjusted if I proceed with repair?",
          answer:
            "Yes, the visitation fee is fully adjusted against the final repair bill.",
        },
        {
          question: "How long does the check-up take?",
          answer:
            "A standard AC check-up takes about 20-30 minutes depending on the issue.",
        },
      ],
      reviews: [
        {
          userName: "Rajesh Kumar",
          rating: 5,
          comment:
            "Very thorough diagnosis. Technician explained everything clearly before proceeding with repair.",
        },
      ],
      providers: [
        {
          name: "CoolTech AC Services",
          rating: 4.7,
          experience: "5 Years",
          location: "Patna",
          startingPrice: 299,
          image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "foam-jet-ac-service",
      name: "Foam Jet AC Service",
      shortDescription:
        "Deep foam and jet cleaning for dust buildup",
      fullDescription:
        "Our premium foam jet AC service restores cooling with deep foam cleaning of evaporator coils, high-pressure jet wash of indoor and outdoor units, anti-bacterial treatment, and comprehensive performance testing. Best for ACs with heavy dust buildup or weak airflow.",
      thumbnail:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330173/TiptoBook/services/foam-jet-ac-service.png",
      bannerImage:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330173/TiptoBook/services/foam-jet-ac-service.png",
      gallery: ["https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330173/TiptoBook/services/foam-jet-ac-service.png"],
      startingPrice: 699,
      priceUnit: "per unit",
      rating: 4.6,
      totalReviews: 8853,
      experience: "5 Years",
      available: true,
      serviceMode: "AT_HOME",
      tags: ["AC", "Foam Jet", "Deep Clean", "Cooling", "Dust"],
      featured: true,
      packages: [
        {
          title: "Split AC Foam Jet Service",
          price: 699,
          features: [
            "Foam cleaning of evaporator coils",
            "High-pressure indoor jet wash",
            "Outdoor unit wash",
            "Anti-bacterial spray treatment",
            "Gas pressure check",
          ],
        },
        {
          title: "Window AC Foam Jet Service",
          price: 649,
          features: [
            "Full unit foam treatment",
            "Coil & filter deep cleaning",
            "Drain pipe flush",
            "Anti-bacterial treatment",
          ],
        },
      ],
      faqs: [
        {
          question: "Is foam jet better than regular service?",
          answer:
            "Yes, foam jet cleaning removes deep-seated dust and bacteria that a regular wash cannot, restoring up to 95% cooling efficiency.",
        },
        {
          question: "How long does a foam jet service take?",
          answer: "About 45-60 minutes per AC unit.",
        },
      ],
      reviews: [
        {
          userName: "Ankit Sharma",
          rating: 5,
          comment:
            "Amazing difference! AC feels brand new after the foam jet cleaning. Highly recommended for old ACs.",
        },
      ],
      providers: [
        {
          name: "CoolTech AC Services",
          rating: 4.6,
          experience: "5 Years",
          location: "Patna",
          startingPrice: 699,
          image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "ac-gas-refill",
      name: "Gas Refill & Check-up",
      shortDescription:
        "AC gas refill for instant cooling restoration",
      fullDescription:
        "Professional AC gas refill service with leak detection and pressure testing. Fix leaks, refill gas, and restore optimal cooling. Includes R32/R410A refrigerant top-up, leak detection using electronic sensors, pressure gauge testing, and post-refill performance validation.",
      thumbnail:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-gas-refill.png",
      bannerImage:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-gas-refill.png",
      gallery: ["https://res.cloudinary.com/bnmn9cbp/image/upload/v1790330172/TiptoBook/services/ac-gas-refill.png"],
      startingPrice: 2499,
      priceUnit: "per unit",
      rating: 4.7,
      totalReviews: 9069,
      experience: "6 Years",
      available: true,
      serviceMode: "AT_HOME",
      tags: ["AC", "Gas Refill", "R32", "R410A", "Cooling", "Leak"],
      featured: true,
      packages: [
        {
          title: "Split AC Gas Refill (R32/R410A)",
          price: 2499,
          features: [
            "Full gas refill (R32 or R410A)",
            "Electronic leak detection",
            "Pressure gauge testing",
            "Cooling performance check",
          ],
        },
        {
          title: "Split AC Gas Refill (R22)",
          price: 2999,
          features: [
            "Full R22 gas refill",
            "Leak detection & sealing",
            "Compressor health check",
            "Post-refill validation",
          ],
        },
      ],
      faqs: [
        {
          question: "How do I know if my AC needs a gas refill?",
          answer:
            "Signs include reduced cooling, ice formation on pipes, and unusual hissing sounds from the unit.",
        },
        {
          question: "Which gas type does my AC use?",
          answer:
            "Our technician will check your AC model and use the correct refrigerant (R32, R410A, or R22).",
        },
      ],
      reviews: [
        {
          userName: "Suresh Verma",
          rating: 5,
          comment:
            "AC is cooling like new after the gas refill. Technician also fixed a small leak for free!",
        },
      ],
      providers: [
        {
          name: "CoolBreeze Experts",
          rating: 4.7,
          experience: "7 Years",
          location: "Patna",
          startingPrice: 2499,
          image:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "ac-installation",
      name: "AC Installation",
      shortDescription:
        "Quick, safe AC installation for optimal cooling",
      fullDescription:
        "Professional split & window AC installation by certified technicians. Includes wall mounting, copper piping, electrical connection, drain pipe setup, gas charging verification, and a final performance check to ensure optimal cooling from day one.",
      thumbnail:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
      bannerImage:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg",
      gallery: ["https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315766/TiptoBook/services/ac-installation.jpg"],
      startingPrice: 1199,
      priceUnit: "per unit",
      rating: 4.7,
      totalReviews: 8935,
      experience: "5 Years",
      available: true,
      serviceMode: "AT_HOME",
      tags: ["AC", "Installation", "Split AC", "Window AC", "Setup"],
      featured: false,
      packages: [
        {
          title: "Split AC Installation",
          price: 1199,
          features: [
            "Indoor & outdoor unit mounting",
            "Up to 3ft copper piping",
            "Electrical connection & drain pipe",
            "Gas check & performance test",
          ],
        },
        {
          title: "Window AC Installation",
          price: 699,
          features: [
            "Window frame fitting",
            "Electrical connection",
            "Drain setup",
            "Cooling performance check",
          ],
        },
      ],
      faqs: [
        {
          question: "Is copper piping included in the price?",
          answer:
            "Up to 3 feet of copper piping is included. Additional piping is charged at ₹150/foot.",
        },
        {
          question: "How long does AC installation take?",
          answer:
            "A standard split AC installation takes about 1.5-2 hours.",
        },
      ],
      reviews: [
        {
          userName: "Deepak Gupta",
          rating: 5,
          comment:
            "Very neat installation. Wiring was hidden properly and AC works perfectly.",
        },
      ],
      providers: [
        {
          name: "CoolTech AC Services",
          rating: 4.7,
          experience: "5 Years",
          location: "Patna",
          startingPrice: 1199,
          image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "ac-uninstallation",
      name: "AC Uninstallation",
      shortDescription:
        "Safe AC removal with gas recovery",
      fullDescription:
        "Professional AC uninstallation with proper gas recovery, safe dismounting of indoor and outdoor units, electrical disconnection, and piping removal. Ideal when shifting homes, renovating, or upgrading your AC unit.",
      thumbnail:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315767/TiptoBook/services/ac-uninstallation.jpg",
      bannerImage:
        "https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315767/TiptoBook/services/ac-uninstallation.jpg",
      gallery: ["https://res.cloudinary.com/bnmn9cbp/image/upload/v1790315767/TiptoBook/services/ac-uninstallation.jpg"],
      startingPrice: 499,
      priceUnit: "per unit",
      rating: 4.7,
      totalReviews: 8829,
      experience: "4 Years",
      available: true,
      serviceMode: "AT_HOME",
      tags: ["AC", "Uninstallation", "Removal", "Shifting", "Dismount"],
      featured: false,
      packages: [
        {
          title: "Split AC Uninstallation",
          price: 499,
          features: [
            "Safe gas recovery",
            "Indoor & outdoor unit removal",
            "Piping & wiring disconnect",
            "Wall hole sealing (basic)",
          ],
        },
        {
          title: "Window AC Uninstallation",
          price: 399,
          features: [
            "Safe unit removal",
            "Electrical disconnection",
            "Frame cleanup",
          ],
        },
      ],
      faqs: [
        {
          question: "Will the gas be saved during uninstallation?",
          answer:
            "Yes, our technicians perform proper gas recovery (pump-down) to preserve the refrigerant for reinstallation.",
        },
        {
          question: "Can you also re-install the AC at a new location?",
          answer:
            "Yes, you can book both uninstallation and installation services. We offer combo discounts.",
        },
      ],
      reviews: [
        {
          userName: "Kavita Devi",
          rating: 5,
          comment:
            "Shifting was stress-free. They removed and packed both units carefully.",
        },
      ],
      providers: [
        {
          name: "QuickCool Services",
          rating: 4.6,
          experience: "4 Years",
          location: "Patna",
          startingPrice: 499,
          image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
  ];

  console.log("\n🌱 Seeding AC & Appliances services...\n");

  let createdCount = 0;
  let skippedCount = 0;

  for (const svcData of acServicesSeed) {
    const existing = await Service.findOne({ slug: svcData.slug });
    if (existing) {
      console.log(`   ℹ️  Service "${svcData.name}" already exists — skipping`);
      skippedCount++;
      continue;
    }

    await Service.create({
      ...svcData,
      category: acCategory._id,
      categoryName: acCategory.name,
    });
    console.log(`   ✅ Created: ${svcData.name} (₹${svcData.startingPrice})`);
    createdCount++;
  }

  console.log(
    `\n📊 Summary: ${createdCount} services created, ${skippedCount} skipped`
  );

  console.log("\n🎉 Migration complete! No existing data was deleted.\n");
  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
