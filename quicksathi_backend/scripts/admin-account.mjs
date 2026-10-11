// Create an admin account, or reset an admin's password. Operator tool: needs database access.
//   node scripts/admin-account.mjs <email> --yes
// The new password is read from ADMIN_NEW_PASSWORD, or typed at a hidden prompt.
//
// Why it exists: admin rights are never derived from an email address (ADR 0004) and there is no
// "forgot password" flow yet, so this is the supported way to (re)gain access to the admin panel.
// Prefer Google sign-in for admins where possible (sign in once on the site, then use grant-admin.mjs).
import "dotenv/config";
import readline from "node:readline";
import mongoose from "mongoose";
import User from "../models/User.js";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email || !email.includes("@") || !process.argv.includes("--yes")) {
  console.error("Usage: node scripts/admin-account.mjs <email> --yes");
  process.exit(1);
}

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(prompt)) process.stdout.write(s); };
    rl.question(prompt, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });
}

function weakness(pw) {
  if (pw.length < 12) return "must be at least 12 characters";
  if ([/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length < 3) return "must mix at least 3 of: lowercase, uppercase, digits, symbols";
  if (/quicksathi|tiptobook|password|admin09/i.test(pw)) return "must not contain the brand name, 'password' or a previously shared value";
  return null;
}

const password = process.env.ADMIN_NEW_PASSWORD || (await askHidden("New admin password: "));
const problem = weakness(password);
if (problem) {
  console.error(`❌ Password ${problem}.`);
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
try {
  const db = mongoose.connection.name;
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name: "TiptoBook Admin", email, role: "admin", authProvider: "local", password });
    await user.save();
    console.log(`✅ AUDIT ${new Date().toISOString()} db=${db} created admin ${email}`);
  } else {
    const before = user.role;
    user.role = "admin";
    user.isActive = true;
    user.authProvider = "local";
    user.password = password;
    await user.save();
    console.log(`✅ AUDIT ${new Date().toISOString()} db=${db} reset password / ensured admin for ${email} (role was ${before})`);
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
