import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
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
    console.warn(`   ⚠️ Cloudinary upload failed for ${publicId}:`, err.message);
    // If it's a URL, return the source as fallback
    if (typeof source === "string" && source.startsWith("http")) {
      return source;
    }
    return "";
  }
}

async function run() {
  await connectDB();
  console.log("\n🏗️  Starting Construction & Interior Design Cloudinary & MongoDB Seeding...\n");

  // ── Step 1: Upload Images to Cloudinary ────────────────────────────────────
  const localIconPath = path.resolve(__dirname, "../../quicksathi_frontend/public/icons/categories/construction.png");
  let iconUrl = "/icons/categories/construction.png";

  if (fs.existsSync(localIconPath)) {
    const uploadedIcon = await uploadAsset(localIconPath, "TiptoBook/categories", "construction-icon");
    if (uploadedIcon) iconUrl = uploadedIcon;
  }

  const categoryMainUrl = await uploadAsset(
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2070&auto=format&fit=crop",
    "TiptoBook/categories",
    "construction-main"
  );

  const categorySecondaryUrl = await uploadAsset(
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2070&auto=format&fit=crop",
    "TiptoBook/categories",
    "construction-secondary"
  );

  const subImages = {
    newHome: await uploadAsset(
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2071&auto=format&fit=crop",
      "TiptoBook/services",
      "new-home-construction"
    ),
    renovation: await uploadAsset(
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=2070&auto=format&fit=crop",
      "TiptoBook/services",
      "renovation-remodeling"
    ),
    interior: await uploadAsset(
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2070&auto=format&fit=crop",
      "TiptoBook/services",
      "interior-design"
    ),
    ceiling: await uploadAsset(
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
      "TiptoBook/services",
      "false-ceiling-lighting"
    ),
    planning: await uploadAsset(
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
      "TiptoBook/services",
      "design-planning-2d-3d"
    ),
  };

  // ── Step 2: Seed or Update Category in MongoDB ────────────────────────────
  console.log("\n📦 Upserting Category in MongoDB...");

  const categoryData = {
    name: "Construction & Interior Design",
    description:
      "Turnkey home construction, luxury interior design, renovation, false ceiling, and expert 2D/3D architectural planning.",
    vertical: "CONSTRUCTION",
    type: "BOTH",
    imageUrl: categoryMainUrl,
    secondaryImageUrl: categorySecondaryUrl,
    iconUrl: iconUrl,
    displayOrder: 9,
    active: true,
    comingSoon: false,
    subCategories: [
      {
        name: "New Home Construction",
        description:
          "End-to-end residential and commercial building construction with quality materials and structural guarantees.",
        vertical: "CONSTRUCTION",
        type: "SERVICE_ONLY",
        imageUrl: subImages.newHome,
        secondaryImageUrl: subImages.newHome,
        iconUrl: iconUrl,
        displayOrder: 1,
        active: true,
      },
      {
        name: "Renovation & Remodeling",
        description:
          "Complete home transformation, kitchen remodels, bathroom revamps, and structural restoration.",
        vertical: "CONSTRUCTION",
        type: "SERVICE_ONLY",
        imageUrl: subImages.renovation,
        secondaryImageUrl: subImages.renovation,
        iconUrl: iconUrl,
        displayOrder: 2,
        active: true,
      },
      {
        name: "Interior Design",
        description:
          "Bespoke modern interiors, custom woodwork, space styling, and turnkey residential aesthetics.",
        vertical: "CONSTRUCTION",
        type: "SERVICE_ONLY",
        imageUrl: subImages.interior,
        secondaryImageUrl: subImages.interior,
        iconUrl: iconUrl,
        displayOrder: 3,
        active: true,
      },
      {
        name: "False Ceiling & Lighting",
        description:
          "Designer gypsum and POP false ceilings, ambient profile lighting, and energy-efficient LED concepts.",
        vertical: "CONSTRUCTION",
        type: "SERVICE_ONLY",
        imageUrl: subImages.ceiling,
        secondaryImageUrl: subImages.ceiling,
        iconUrl: iconUrl,
        displayOrder: 4,
        active: true,
      },
      {
        name: "2D/3D Design & Planning",
        description:
          "Architectural floor blueprints, 3D elevation renders, structural drafting, and municipal approval layouts.",
        vertical: "CONSTRUCTION",
        type: "SERVICE_ONLY",
        imageUrl: subImages.planning,
        secondaryImageUrl: subImages.planning,
        iconUrl: iconUrl,
        displayOrder: 5,
        active: true,
      },
    ],
  };

  let category = await Category.findOne({ vertical: "CONSTRUCTION" });
  if (category) {
    Object.assign(category, categoryData);
    await category.save();
    console.log(`   ✅ Updated existing Construction category (ID: ${category._id})`);
  } else {
    category = await Category.create(categoryData);
    console.log(`   ✅ Created new Construction category (ID: ${category._id})`);
  }

  // ── Step 3: Seed Real Construction Services ──────────────────────────────
  console.log("\n🛠️  Upserting 5 Real Construction Services in MongoDB...");

  const servicesData = [
    {
      slug: "new-home-construction",
      name: "New Home Construction",
      shortDescription: "Turnkey residential and commercial construction with structural warranty",
      fullDescription:
        "Build your dream home with certified civil engineers, premium grade raw materials, architectural planning, soil testing, foundation work, and structural warranties. We manage everything from excavation to finishing with on-time milestones and transparent milestone-based payments.",
      category: category._id,
      categoryName: category.name,
      thumbnail: subImages.newHome,
      bannerImage: subImages.newHome,
      gallery: [subImages.newHome, categoryMainUrl],
      startingPrice: 1650,
      priceUnit: "per sq.ft",
      rating: 4.9,
      totalReviews: 312,
      experience: "12+ Years",
      available: true,
      serviceMode: "ON_SITE",
      tags: ["Construction", "Home Building", "Civil Works", "Turnkey", "Architectural Design"],
      featured: true,
      packages: [
        {
          title: "Standard Home Build",
          price: 1650,
          features: [
            "RCC Framed Structure",
            "ACC / UltraTech Cement",
            "Branded ISI Grade TMT Steel",
            "Vitrified Floor Tiles",
            "Standard Sanitary & Electrical Fittings",
          ],
        },
        {
          title: "Premium Luxury Villa Build",
          price: 2150,
          features: [
            "Fe 550D Super-Ductile Steel",
            "Italian Marble / Granite Flooring",
            "Jaquar / Kohler Luxury Sanitary",
            "Custom False Ceiling & Paint",
            "10-Year Structural Guarantee",
          ],
        },
        {
          title: "Custom Duplex / Commercial Turnkey",
          price: 2750,
          features: [
            "Multi-Story Architectural Elevation",
            "Smart Home Automation Pre-wiring",
            "Toughened Glass Balcony Railings",
            "Full Modular Kitchen Included",
            "Dedicated Site Engineer & Milestone Audits",
          ],
        },
      ],
      faqs: [
        {
          question: "Do you provide architectural drawings and municipal approvals?",
          answer: "Yes, complete 2D blueprints, 3D elevation renders, structural designs, and local municipal map approvals are included.",
        },
        {
          question: "How is the payment structured?",
          answer: "Payments are phased across clear construction milestones (Excavation, Foundation, Plinth, Slab casting, Brickwork, Plastering, Finishing, Handover).",
        },
        {
          question: "Is there a structural warranty provided?",
          answer: "Yes, we provide up to 10 years of structural warranty backed by registered civil engineering guarantees.",
        },
      ],
      reviews: [
        {
          userName: "Amitav Verma",
          rating: 5,
          comment: "Outstanding construction quality and completed our 3-story home on schedule with zero hidden costs.",
        },
        {
          userName: "Prakash Sinha",
          rating: 5,
          comment: "The structural finishing and civil engineering team were very professional. Daily WhatsApp progress photos were great.",
        },
      ],
      providers: [
        {
          name: "BuildCraft Infrastructure",
          rating: 4.9,
          experience: "12 Years",
          location: "Patna",
          startingPrice: 1650,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "renovation-remodeling",
      name: "Renovation & Remodeling",
      shortDescription: "Complete home makeover, structural revamp, kitchen & bath remodeling",
      fullDescription:
        "Transform older properties into modern luxury spaces. We offer end-to-end remodeling including structural modifications, wall demolition, damp-proof plastering, plumbing/electrical re-routing, modular kitchen installations, and bathroom modernizations.",
      category: category._id,
      categoryName: category.name,
      thumbnail: subImages.renovation,
      bannerImage: subImages.renovation,
      gallery: [subImages.renovation, categoryMainUrl],
      startingPrice: 499,
      priceUnit: "estimate visit",
      rating: 4.8,
      totalReviews: 428,
      experience: "9+ Years",
      available: true,
      serviceMode: "ON_SITE",
      tags: ["Renovation", "Remodeling", "Kitchen Remodel", "Bathroom Revamp", "Home Makeover"],
      featured: true,
      packages: [
        {
          title: "Site Inspection & 3D Estimation",
          price: 499,
          features: [
            "Complete Site Measurement",
            "Damp & Structural Health Audit",
            "Detailed Cost Breakdown Bill of Quantities",
            "Fee Adjusted in Project Advance",
          ],
        },
        {
          title: "Modular Kitchen Remodel",
          price: 45000,
          features: [
            "BWP Marine Plywood Cabinets",
            "Quartz / Granite Countertop Fitting",
            "Soft-Close German Tandem Drawers",
            "Chimney & Hob Re-ducting",
          ],
        },
        {
          title: "Complete Bathroom Makeover",
          price: 35000,
          features: [
            "Waterproofing Membrane Coating",
            "Anti-skid Designer Wall & Floor Tiles",
            "Concealed Diverters & CPVC Plumbing",
            "Vanity Cabinet & LED Backlit Mirror",
          ],
        },
      ],
      faqs: [
        {
          question: "Can we live in the home while renovation is ongoing?",
          answer: "Yes, for phased room-by-room renovations our team isolates the workspace using dust protection screens.",
        },
        {
          question: "Will the ₹499 inspection fee be refunded?",
          answer: "Yes, the entire inspection fee is deducted from your final project bill upon booking confirmation.",
        },
      ],
      reviews: [
        {
          userName: "Priya Ranjan",
          rating: 5,
          comment: "Renovated our 20-year-old ancestral house. Looks completely modern and brand new now!",
        },
      ],
      providers: [
        {
          name: "Apex Renovation Experts",
          rating: 4.8,
          experience: "9 Years",
          location: "Patna",
          startingPrice: 499,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "interior-design",
      name: "Interior Design",
      shortDescription: "Bespoke modern interiors, custom woodwork, space styling & 3D renders",
      fullDescription:
        "Turnkey interior designing curated for luxury and functionality. From custom TV units, bedroom wardrobes, and modular kitchens to false ceiling ambient lights and wallpaper styling, our certified interior designers craft your perfect living space.",
      category: category._id,
      categoryName: category.name,
      thumbnail: subImages.interior,
      bannerImage: subImages.interior,
      gallery: [subImages.interior, categorySecondaryUrl],
      startingPrice: 2999,
      priceUnit: "consultation",
      rating: 4.9,
      totalReviews: 540,
      experience: "8+ Years",
      available: true,
      serviceMode: "ON_SITE",
      tags: ["Interior Design", "Luxury Interiors", "Modular Kitchen", "Wardrobes", "Space Planning"],
      featured: true,
      packages: [
        {
          title: "Design Consultation & 3D Visualizer",
          price: 2999,
          features: [
            "1-on-1 Interior Designer Consultation",
            "Photorealistic 3D Room Renderings",
            "Material & Color Palette Selection",
            "Accurate Cost Estimation Sheet",
          ],
        },
        {
          title: "Living Room Transformation",
          price: 35000,
          features: [
            "Designer Floating TV Unit with Louvers",
            "Accent Wall Paneling / Fluted Panels",
            "False Ceiling Design with Ambient Lights",
            "Integrated Hidden Cable Management",
          ],
        },
        {
          title: "Complete 2BHK/3BHK Turnkey Interiors",
          price: 225000,
          features: [
            "Modular Kitchen with Soft-Close Accessories",
            "Floor-to-Ceiling Wardrobes in all Bedrooms",
            "Complete False Ceilings with COB Lights",
            "Crockery Unit & Shoe Rack Foyer Styling",
            "45 Days Move-In Guarantee",
          ],
        },
      ],
      faqs: [
        {
          question: "What wood and laminates do you use?",
          answer: "We use ISO-certified BWP (Boiling Water Proof) Marine Grade plywood with 1mm anti-scratch laminates and premium acrylics.",
        },
        {
          question: "How long does the turnkey execution take?",
          answer: "Typically 35 to 45 business days from 3D design approval.",
        },
      ],
      reviews: [
        {
          userName: "Swati Narayan",
          rating: 5,
          comment: "The 3D design matched the actual execution 100%. Very neat carpentry and on-time delivery.",
        },
      ],
      providers: [
        {
          name: "UrbanNest Interior Studio",
          rating: 4.9,
          experience: "8 Years",
          location: "Patna",
          startingPrice: 2999,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "false-ceiling-lighting",
      name: "False Ceiling & Lighting",
      shortDescription: "Designer Gypsum/POP ceilings, COB spotlights & ambient LED strip lighting",
      fullDescription:
        "Enhance your rooms with modern suspended false ceilings. We install Saint-Gobain gypsum boards, heavy-gauge GI channels, recessed LED channels, magnetic track lights, and perimeter cove lighting that gives your home a grand 5-star hotel look.",
      category: category._id,
      categoryName: category.name,
      thumbnail: subImages.ceiling,
      bannerImage: subImages.ceiling,
      gallery: [subImages.ceiling, categorySecondaryUrl],
      startingPrice: 85,
      priceUnit: "per sq.ft",
      rating: 4.8,
      totalReviews: 389,
      experience: "7+ Years",
      available: true,
      serviceMode: "ON_SITE",
      tags: ["False Ceiling", "Gypsum", "POP", "LED Lighting", "Cove Lights", "Profile Light"],
      featured: true,
      packages: [
        {
          title: "Saint-Gobain Gypsum Ceiling",
          price: 85,
          features: [
            "Authentic Saint-Gobain 12.5mm Gyproc Board",
            "Rust-Proof Heavy GI Metal Framing",
            "Fiber Tape Jointing & Leveling Plaster",
            "Precision Cutouts for Downlights",
          ],
        },
        {
          title: "Designer Cove & Ambient Lighting",
          price: 120,
          features: [
            "Dual-Tier Perimeter Cove Troughs",
            "Warm White / Ice Blue LED Strip Recesses",
            "Smooth Jointless Primer Ready Finish",
            "Thermal & Acoustic Insulation Support",
          ],
        },
        {
          title: "Luxury Wooden Louver & Profile Lights",
          price: 175,
          features: [
            "Charcoal / Wood-Finish Fluted Louver Inlays",
            "Magnetic Track Lighting Channels",
            "Concealed AC Vent Framework",
            "5-Year Sag-Free Warranty",
          ],
        },
      ],
      faqs: [
        {
          question: "Does false ceiling reduce room height?",
          answer: "A standard ceiling only drops by 4 to 5 inches, which preserves spacious room proportions while hiding cables and providing insulation.",
        },
        {
          question: "Are electrical wiring and light fittings included?",
          answer: "Framing, board fixing, cutouts, and wiring are included. Light fixtures can be supplied by us or provided by the client.",
        },
      ],
      reviews: [
        {
          userName: "Vikram Aditya",
          rating: 5,
          comment: "The warm cove lights in our hall look incredible. Very clean work with minimal dust.",
        },
      ],
      providers: [
        {
          name: "LumiCeil Studio",
          rating: 4.8,
          experience: "7 Years",
          location: "Patna",
          startingPrice: 85,
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
    {
      slug: "design-planning-2d-3d",
      name: "2D/3D Design & Planning",
      shortDescription: "Architectural floor blueprints, 3D elevation renders & municipal sanction drawings",
      fullDescription:
        "Professional architectural and civil engineering drafting services. Get Vastu-compliant 2D floor plans, photorealistic 3D exterior elevations, structural column/beam layout drawings, electrical/plumbing schematics, and municipal sanction documentation.",
      category: category._id,
      categoryName: category.name,
      thumbnail: subImages.planning,
      bannerImage: subImages.planning,
      gallery: [subImages.planning, categoryMainUrl],
      startingPrice: 3499,
      priceUnit: "per floor plan",
      rating: 4.9,
      totalReviews: 275,
      experience: "10+ Years",
      available: true,
      serviceMode: "ON_SITE",
      tags: ["Architectural Planning", "2D Floor Plan", "3D Elevation", "Vastu Planning", "Structural Drawings"],
      featured: true,
      packages: [
        {
          title: "Vastu 2D Floor Plan",
          price: 3499,
          features: [
            "Precise Room Layout & Furniture Placement",
            "100% Vastu Directional Compliance Check",
            "Door / Window Schedule & Openings",
            "2 Detailed Revision Rounds",
          ],
        },
        {
          title: "Photorealistic 3D Exterior Elevation",
          price: 7999,
          features: [
            "Day & Night 4K Facade Renders",
            "Color, Texture & Cladding Material Specs",
            "Compound Wall & Gate Design",
            "360-Degree Panoramic View",
          ],
        },
        {
          title: "Complete Working Drawing Architecture Set",
          price: 14999,
          features: [
            "Full Structural RCC Column / Footing / Beam Drawings",
            "Concealed Plumbing & Electrical Schematics",
            "Municipal Building Map Sanction Format",
            "Signed by Certified Architect / Engineer",
          ],
        },
      ],
      faqs: [
        {
          question: "Can I use these blueprints for municipal building permit?",
          answer: "Yes, our drawings strictly follow standard municipal bylaws and can be directly submitted for approvals.",
        },
        {
          question: "How long does it take to deliver the plans?",
          answer: "2D floor plans are delivered within 48 hours. 3D elevations take 3-4 days.",
        },
      ],
      reviews: [
        {
          userName: "Deepak Kashyap",
          rating: 5,
          comment: "The 3D elevation was jaw-dropping. Everyone in our neighborhood compliments the house design!",
        },
      ],
      providers: [
        {
          name: "VastuArch Planners",
          rating: 4.9,
          experience: "10 Years",
          location: "Patna",
          startingPrice: 3499,
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop",
        },
      ],
    },
  ];

  for (const s of servicesData) {
    const existing = await Service.findOne({ slug: s.slug });
    if (existing) {
      Object.assign(existing, s);
      await existing.save();
      console.log(`   ✅ Updated service: ${s.name} (${s.slug})`);
    } else {
      await Service.create(s);
      console.log(`   ✅ Created service: ${s.name} (${s.slug})`);
    }
  }

  console.log("\n🎉 Construction category & 5 services successfully seeded to MongoDB & Cloudinary!\n");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
