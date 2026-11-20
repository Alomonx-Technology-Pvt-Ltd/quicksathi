// Shared guard for destructive dev scripts. Call BEFORE connecting to the database.
//   - never runs when NODE_ENV=production
//   - only runs against databases whose name is on the allowlist
// Extend the allowlist for a throwaway database with SEED_DB_ALLOWLIST=name1,name2.
const DEFAULT_ALLOWED = ["quicksathi_dev", "quicksathi_test", "quicksathi_local", "qs_test"];

export function assertSafeToSeed(scriptName) {
  const fail = (why) => {
    console.error(`❌ ${scriptName} refused to run: ${why}`);
    process.exit(1);
  };

  if (process.env.NODE_ENV === "production") fail("NODE_ENV=production.");

  const uri = process.env.MONGODB_URI;
  if (!uri) fail("MONGODB_URI is not set.");

  let dbName = "";
  try {
    dbName = decodeURIComponent(new URL(uri).pathname.replace(/^\//, ""));
  } catch {
    fail("MONGODB_URI could not be parsed.");
  }

  const allowed = [...DEFAULT_ALLOWED, ...(process.env.SEED_DB_ALLOWLIST || "").split(",").map((s) => s.trim()).filter(Boolean)];
  if (!allowed.includes(dbName)) {
    fail(`database "${dbName || "(default)"}" is not on the dev allowlist (${allowed.join(", ")}). Point MONGODB_URI at a dev database.`);
  }
}
