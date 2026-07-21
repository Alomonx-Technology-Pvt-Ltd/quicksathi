import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Category from "../models/Category.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const run = async () => {
  await connectDB();

  console.log("Checking for provider accounts...");
  const users = await User.find({ role: "provider" });
  console.log(`Found ${users.length} provider users:`);
  for (const u of users) {
    console.log(`- ${u.name} (${u.email})`);
    const profile = await Provider.findOne({ user: u._id });
    if (profile) {
      console.log(`  Profile: ${profile.businessName}, Status: ${profile.approvalStatus}`);
    } else {
      console.log(`  No provider profile found.`);
    }
  }

  // Check if we already have the test provider
  const testEmail = "provider@example.com";
  let testUser = await User.findOne({ email: testEmail });
  
  if (!testUser) {
    console.log(`Creating new test provider: ${testEmail}...`);
    testUser = new User({
      name: "Mock Provider User",
      email: testEmail,
      password: "password123", // Will be hashed in pre-save hook
      phone: "+919876543210",
      role: "provider",
      isActive: true
    });
    await testUser.save();
    console.log("Test provider user created.");
  } else {
    // Make sure role is provider
    if (testUser.role !== "provider") {
      testUser.role = "provider";
      await testUser.save();
      console.log("Updated test user role to provider.");
    }
  }

  let testProvider = await Provider.findOne({ user: testUser._id });
  if (!testProvider) {
    console.log("Creating new test provider profile...");
    // Find any category to link
    const category = await Category.findOne({});
    testProvider = new Provider({
      user: testUser._id,
      businessName: "Sathi Premium Decorators",
      businessType: "Agency",
      description: "Providing high-quality decorations, styling, and event setups for all occasions.",
      category: category ? category._id : undefined,
      categoryName: category ? category.name : "Wedding & Party Services",
      servicesOffered: ["Floral decoration", "Stage lighting", "Seating arrangements"],
      experience: "5 Years",
      location: {
        address: "123 Main Street, Sector 4",
        city: "Patna",
        state: "Bihar",
        pincode: "800001"
      },
      phone: "+919876543210",
      email: testEmail,
      approvalStatus: "approved"
    });
    await testProvider.save();
    console.log("Test provider profile created.");
  } else {
    if (testProvider.approvalStatus !== "approved") {
      testProvider.approvalStatus = "approved";
      await testProvider.save();
      console.log("Updated test provider status to approved.");
    }
  }

  console.log("\nSuccess! Credentials to use for login:");
  console.log(`Email: ${testEmail}`);
  console.log("Password: password123");
  
  // Update or append to .env
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env");
  try {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    const vars = {
      MOCK_PROVIDER_EMAIL: testEmail,
      MOCK_PROVIDER_PASSWORD: "password123",
      MOCK_PROVIDER_USER_ID: testUser._id.toString(),
      MOCK_PROVIDER_ID: testProvider._id.toString()
    };

    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // If not found, append to the end of the file
        if (!envContent.endsWith("\n")) {
          envContent += "\n";
        }
        envContent += `${key}=${value}\n`;
      }
    }

    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("Updated .env file with Mock Provider credentials & IDs.");
  } catch (envErr) {
    console.warn("Could not update .env file automatically:", envErr.message);
  }

  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
