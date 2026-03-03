import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

const BASIC_AMOUNT = 50;
const PREMIUM_AMOUNT = 100;

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { userId } = await verifyToken(auth.slice(7));
    let template = "basic";
    try {
      const body = await request.json();
      if (body?.template === "premium") template = "premium";
    } catch {}

    const amount = template === "premium" ? PREMIUM_AMOUNT : BASIC_AMOUNT;
    const amountInPaise = amount * 100;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment temporarily unavailable" }, { status: 500 });
    }

    const db = await connectDB();
    const portfolio = await db.collection("portfolios").findOne({
      userId: new ObjectId(userId),
    });
    if (!portfolio) {
      return NextResponse.json({ error: "Complete your details first" }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const receiptId = `port_${String(userId).slice(-12)}_${Date.now().toString().slice(-8)}`.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
    });

    await db.collection("portfolios").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          template,
          orderId: order.id,
          amount,
          updatedAt: new Date(),
        },
      }
    );

    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!publicKey) {
      return NextResponse.json({ error: "Payment temporarily unavailable" }, { status: 500 });
    }
    return NextResponse.json({ orderId: order.id, amount, keyId: publicKey });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
