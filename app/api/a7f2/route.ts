import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createHash } from "crypto";
import {
  OTP_COOLDOWN_MS,
  OTP_DAILY_LIMIT_PER_PHONE,
  OTP_DAILY_LIMIT_PER_IP,
  OTP_VALIDITY_MS,
  isValidIndianMobile,
} from "@/lib/otp-config";

const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

function retryAfter(ms: number): Record<string, string> {
  return { "Retry-After": String(Math.ceil(ms / 1000)) };
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (!isValidIndianMobile(cleanPhone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const db = await connectDB();

    try {
      await db.collection("otp_rate_limits").createIndex(
        { sentAt: 1 },
        { expireAfterSeconds: 86400 * 2 }
      );
    } catch {}

    const now = Date.now();
    const cooldownCutoff = new Date(now - OTP_COOLDOWN_MS);
    const dailyCutoff = new Date(now - 24 * 60 * 60 * 1000);

    const recentByPhone = await db.collection("otp_rate_limits").findOne(
      { phone: cleanPhone, sentAt: { $gte: cooldownCutoff } },
      { sort: { sentAt: -1 } }
    );
    if (recentByPhone) {
      const waitMs = recentByPhone.sentAt.getTime() + OTP_COOLDOWN_MS - now;
      return NextResponse.json(
        { error: `Please wait ${Math.ceil(waitMs / 60000)} minutes before requesting another OTP.` },
        { status: 429, headers: retryAfter(waitMs) }
      );
    }

    const dailyByPhone = await db.collection("otp_rate_limits").countDocuments({
      phone: cleanPhone,
      sentAt: { $gte: dailyCutoff },
    });
    if (dailyByPhone >= OTP_DAILY_LIMIT_PER_PHONE) {
      return NextResponse.json(
        { error: "Daily OTP limit reached for this number. Try again tomorrow." },
        { status: 429 }
      );
    }

    const recentByIP = await db.collection("otp_rate_limits").findOne(
      { ip: clientIP, sentAt: { $gte: cooldownCutoff } },
      { sort: { sentAt: -1 } }
    );
    if (recentByIP) {
      const waitMs = recentByIP.sentAt.getTime() + OTP_COOLDOWN_MS - now;
      return NextResponse.json(
        { error: `Too many requests. Try again in ${Math.ceil(waitMs / 60000)} minutes.` },
        { status: 429, headers: retryAfter(waitMs) }
      );
    }

    const dailyByIP = await db.collection("otp_rate_limits").countDocuments({
      ip: clientIP,
      sentAt: { $gte: dailyCutoff },
    });
    if (dailyByIP >= OTP_DAILY_LIMIT_PER_IP) {
      return NextResponse.json(
        { error: "Too many OTP requests from your network. Try again tomorrow." },
        { status: 429 }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(now + OTP_VALIDITY_MS);

    await db.collection("otps").deleteMany({ phone: cleanPhone });
    await db.collection("otps").insertOne({
      phone: cleanPhone,
      otpHash: hashOTP(otp),
      expiresAt,
      createdAt: new Date(),
    });

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (!fast2smsKey) {
      return NextResponse.json({ error: "OTP service unavailable" }, { status: 503 });
    }

    const body = {
      route: "q",
      message: `Your OTP: ${otp}`,
      numbers: cleanPhone,
      flash: "0",
    };
    const res = await fetch(FAST2SMS_URL, {
      method: "POST",
      headers: {
        authorization: fast2smsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data.return === false && data.message)) {
      await db.collection("otps").deleteMany({ phone: cleanPhone });
      console.error("Fast2SMS failed");
      return NextResponse.json({ error: "Please try again later." }, { status: 500 });
    }

    await db.collection("otp_rate_limits").insertOne({
      phone: cleanPhone,
      ip: clientIP,
      sentAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
