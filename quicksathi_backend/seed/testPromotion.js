import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Category from "../models/Category.js";

const run = async () => {
  await connectDB();

  // Find a client/user to test with
  const testEmail = "nityanand666.nk@gmail.com";
  let user = await User.findOne({ email: testEmail });
  
  if (!user) {
    console.log(`Test user ${testEmail} not found, creating one...`);
    user = new User({
      name: "Ankush Anand",
      email: testEmail,
      phone: "+919876543210",
      role: "user"
    });
    await user.save();
  }

  console.log(`Initial state: User = ${user.name}, Role = ${user.role}`);
  
  // Clean up any existing provider profile for this user first so we test creation
  await Provider.deleteOne({ user: user._id });
  console.log("Cleaned up existing provider profile if any.");

  // Simulate PATCH /users/:id/role to "provider"
  console.log("Promoting user to provider...");
  user.role = "provider";
  await user.save();

  // Profile creation/approval logic (matches the route logic)
  let providerProfile = await Provider.findOne({ user: user._id });
  if (!providerProfile) {
    const defaultCat = await Category.findOne({});
    providerProfile = new Provider({
      user: user._id,
      businessName: `${user.name} Services`,
      businessType: "Individual / Freelancer",
      description: "Professional services provided on QuickSathi.",
      category: defaultCat ? defaultCat._id : undefined,
      categoryName: defaultCat ? defaultCat.name : "Uncategorized",
      servicesOffered: [],
      experience: "1 Year",
      location: {
        address: "",
        city: "Patna",
        state: "Bihar",
        pincode: ""
      },
      phone: user.phone || "",
      email: user.email,
      approvalStatus: "approved",
      approvedAt: new Date()
    });
    await providerProfile.save();
    console.log("Provider profile created successfully.");
  }

  // Verification checks
  const updatedUser = await User.findById(user._id);
  const updatedProfile = await Provider.findOne({ user: user._id });

  console.log("\n--- Verification Results ---");
  console.log(`User role in DB: ${updatedUser.role} (Expected: provider)`);
  console.log(`Provider profile exists: ${!!updatedProfile} (Expected: true)`);
  if (updatedProfile) {
    console.log(`Business Name: ${updatedProfile.businessName}`);
    console.log(`Category: ${updatedProfile.categoryName}`);
    console.log(`Approval Status: ${updatedProfile.approvalStatus} (Expected: approved)`);
  }

  if (updatedUser.role === "provider" && updatedProfile && updatedProfile.approvalStatus === "approved") {
    console.log("\n✅ SUCCESS: Promotion test passed!");
  } else {
    console.error("\n❌ FAILURE: Promotion test failed.");
  }

  process.exit(0);
};

run().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
