import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createToken } from "@/lib/auth";
import {
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_VERIFY_LOCKOUT_MS,
  isValidIndianMobile,
} from "@/lib/otp-config";

function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  if (realIP) return realIP;
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10 || !isValidIndianMobile(cleanPhone)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const clientIP = getClientIP(request);

    const db = await connectDB();
    try {
      await db.collection("verify_attempts").createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 86400 }
      );
    } catch {}

    const isDev = process.env.NODE_ENV === "development";
    if (!isDev) {
      const cutoff = new Date(Date.now() - OTP_VERIFY_LOCKOUT_MS);
      const recentFails = await db
        .collection("verify_attempts")
        .countDocuments({
          $or: [{ phone: cleanPhone }, { ip: clientIP }],
          success: false,
          createdAt: { $gte: cutoff },
        });
      if (recentFails >= OTP_MAX_VERIFY_ATTEMPTS) {
        const waitMin = Math.ceil(OTP_VERIFY_LOCKOUT_MS / 60000);
        return NextResponse.json(
          { error: `Too many attempts. Wait ${waitMin} minutes.` },
          { status: 429, headers: { "Retry-After": String(Math.ceil(OTP_VERIFY_LOCKOUT_MS / 1000)) } }
        );
      }
    }
    const otpStr = String(otp).trim();
    const otpHash = isDev && otpStr === "111111" ? hashOTP("111111") : hashOTP(otpStr);
    const record = await db
      .collection("otps")
      .findOne({ phone: cleanPhone, otpHash });

    if (!record) {
      await db.collection("verify_attempts").insertOne({
        phone: cleanPhone,
        ip: clientIP,
        success: false,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
    if (new Date() > record.expiresAt) {
      await db.collection("otps").deleteOne({ _id: record._id });
      await db.collection("verify_attempts").insertOne({
        phone: cleanPhone,
        ip: clientIP,
        success: false,
        createdAt: new Date(),
      });
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    await db.collection("otps").deleteOne({ _id: record._id });
    await db.collection("verify_attempts").insertOne({
      phone: cleanPhone,
      ip: clientIP,
      success: true,
      createdAt: new Date(),
    });

    let user = await db.collection("users").findOne({ phone: cleanPhone });
    if (!user) {
      const { insertedId } = await db.collection("users").insertOne({
        phone: cleanPhone,
        createdAt: new Date(),
      });
      user = { _id: insertedId, phone: cleanPhone, createdAt: new Date() };
    }

    const token = await createToken({
      phone: cleanPhone,
      userId: String(user._id),
    });

    return NextResponse.json({
      success: true,
      token,
      userId: String(user._id),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
