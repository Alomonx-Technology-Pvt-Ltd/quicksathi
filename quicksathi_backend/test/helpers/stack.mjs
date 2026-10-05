// Boots the real server.js against an in-memory MongoDB with a hermetic env.
// The real .env is never read (DOTENV_CONFIG_PATH=/dev/null), so tests can't touch
// live databases, mail providers, Cloudinary, Groq or Firebase.
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

export const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const JWT_SECRET = "test-only-jwt-secret";
export const RAZORPAY_SECRET = "test-only-razorpay-secret";
export const ADMIN_EMAILS = ["owner@example.test", "owner2@example.test"];

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

export function hermeticEnv(extra = {}) {
  return {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    DOTENV_CONFIG_PATH: "/dev/null",
    NODE_ENV: "test",
    JWT_SECRET,
    JWT_EXPIRES_IN: "1h",
    ADMIN_EMAILS: ADMIN_EMAILS.join(","),
    ADMIN_PASSWORD: "test-only-admin-password",
    RAZORPAY_KEY_ID: "rzp_test_dummy",
    RAZORPAY_KEY_SECRET: RAZORPAY_SECRET,
    CLIENT_URL: "http://localhost:5173",
    ...extra,
  };
}

let seq = 0;
export const uid = (prefix = "x") => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;
export const daysFromNow = (n) => new Date(Date.now() + n * 864e5);

export async function startStack({ env: extraEnv = {} } = {}) {
  const mongo = await MongoMemoryServer.create();
  const uri = `${mongo.getUri()}qs_test`;
  const port = await freePort();
  const conn = await mongoose.createConnection(uri).asPromise();
  const db = conn.db;
  let child = null;
  let logs = "";

  const boot = async () => {
    logs = "";
    child = spawn(process.execPath, ["server.js"], {
      cwd: BACKEND_DIR,
      env: hermeticEnv({ PORT: String(port), MONGODB_URI: uri, ...extraEnv }),
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (d) => (logs += d));
    child.stderr.on("data", (d) => (logs += d));
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/api/health`);
        if (r.status < 500) {
          // Mongoose builds indexes in the background after boot; wait for the ones tests rely on.
          for (let i = 0; i < 50; i++) {
            const names = new Set((await db.collection("bookings").indexes().catch(() => [])).map((x) => x.name));
            const userNames = new Set((await db.collection("users").indexes().catch(() => [])).map((x) => x.name));
            if (names.has("razorpayPaymentId_1") && names.has("razorpayOrderId_1") && userNames.has("phone_unique")) break;
            await new Promise((r2) => setTimeout(r2, 100));
          }
          return;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 150));
    }
    throw new Error(`server did not start:\n${logs}`);
  };

  const shutdown = async () => {
    if (!child) return;
    const exited = new Promise((r) => child.once("exit", r));
    child.kill("SIGTERM");
    await Promise.race([exited, new Promise((r) => setTimeout(r, 3000))]);
    child = null;
  };

  await boot();

  const api = async (method, urlPath, { body, token, headers = {}, raw } = {}) => {
    const res = await fetch(`http://127.0.0.1:${port}/api${urlPath}`, {
      method,
      headers: {
        ...(body !== undefined || raw !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: res.status, body: json, text, headers: res.headers };
  };

  const tokenFor = (userId) => jwt.sign({ id: String(userId) }, JWT_SECRET, { expiresIn: "1h" });

  const createUser = async ({ role = "user", email, phone, name = "Test User" } = {}) => {
    const doc = {
      name,
      email: (email || `${uid("u")}@example.test`).toLowerCase(),
      ...(phone ? { phone } : {}),
      role,
      isActive: true,
      authProvider: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { insertedId } = await db.collection("users").insertOne(doc);
    return { ...doc, _id: insertedId, token: tokenFor(insertedId) };
  };

  const createCategory = async () => {
    const name = uid("Cat ");
    const { insertedId } = await db.collection("categories").insertOne({ name, slug: name.toLowerCase().replace(/\W+/g, "-"), active: true });
    return { _id: insertedId, name };
  };

  const createService = async ({ price = 1000, approvalStatus = "approved", available = true } = {}) => {
    const cat = await createCategory();
    const slug = uid("svc-");
    const doc = {
      slug, name: `Service ${slug}`, category: cat._id, categoryName: cat.name,
      startingPrice: price, packages: [{ title: "Standard", price, features: [] }],
      available, approvalStatus, cities: [], createdAt: new Date(), updatedAt: new Date(),
    };
    const { insertedId } = await db.collection("services").insertOne(doc);
    return { ...doc, _id: insertedId };
  };

  const createProvider = async ({ approvalStatus = "approved", userRole = "provider", isActive = true } = {}) => {
    const user = await createUser({ role: userRole });
    const doc = {
      user: user._id, businessName: uid("Biz "), categoryName: "AC", phone: "+919811111111",
      email: user.email, approvalStatus, isActive, rating: 0, totalBookings: 0,
      documents: { idProof: `https://res.cloudinary.com/demo/${uid("id")}.jpg`, selfiePhoto: `https://res.cloudinary.com/demo/${uid("selfie")}.jpg`, businessRegistration: "", other: [] },
      createdAt: new Date(), updatedAt: new Date(),
    };
    const { insertedId } = await db.collection("providers").insertOne(doc);
    return { provider: { ...doc, _id: insertedId }, user };
  };

  const createBooking = async ({ user, service, provider, status = "pending", paymentStatus = "pending", paymentMethod = "cod", amount = 1000, extra = {} }) => {
    const doc = {
      bookingId: uid("QS-T"), user: user._id, service: service._id, provider: provider?._id,
      serviceName: service.name, scheduledDate: daysFromNow(3), amount, originalAmount: amount,
      paymentMethod, paymentStatus, status, createdAt: new Date(), updatedAt: new Date(), ...extra,
    };
    const { insertedId } = await db.collection("bookings").insertOne(doc);
    return { ...doc, _id: insertedId };
  };

  const createCoupon = async (fields) => {
    const doc = { title: "Test coupon", discountType: "fixed", discountValue: 100, minOrderAmount: 0, isActive: true, usedBy: [], usedCount: 0, validFrom: daysFromNow(-1), validUntil: daysFromNow(30), usageLimit: null, ...fields };
    doc.code = doc.code.toUpperCase();
    const { insertedId } = await db.collection("coupons").insertOne(doc);
    return { ...doc, _id: insertedId };
  };

  const razorpaySignature = (orderId, paymentId) =>
    crypto.createHmac("sha256", RAZORPAY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

  const runScript = (relPath, extraEnv = {}, timeoutMs = 30_000, args = []) =>
    new Promise((resolve) => {
      let out = "";
      const p = spawn(process.execPath, [relPath, ...args], { cwd: BACKEND_DIR, env: hermeticEnv({ MONGODB_URI: uri, ...extraEnv }) });
      p.stdout.on("data", (d) => (out += d));
      p.stderr.on("data", (d) => (out += d));
      const t = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
      p.on("exit", (code) => { clearTimeout(t); resolve({ code, out }); });
    });

  return {
    api, db, uri, port, tokenFor, createUser, createCategory, createService, createProvider,
    createBooking, createCoupon, razorpaySignature, runScript,
    logs: () => logs,
    restart: async () => { await shutdown(); await boot(); },
    stop: async () => { await shutdown(); await conn.close(); await mongo.stop(); },
  };
}
