import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  if (realIP) return realIP;
  return "unknown";
}

const VALID_PAGES = ["/", "/register", "/portfolio/create", "/portfolio/pay", "/success", "/profile"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, page, action, step, timeSpentMs } = body;

    if (!sessionId || !page || !action || !VALID_PAGES.includes(page)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let userId: string | null = null;
    const auth = request.headers.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      try {
        const payload = await verifyToken(auth.slice(7));
        userId = payload.userId;
      } catch {}
    }

    const db = await connectDB();
    try {
      await db.collection("analytics_events").createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 2592000 }
      );
    } catch {}
    await db.collection("analytics_events").insertOne({
      sessionId: String(sessionId).slice(0, 64),
      userId: userId || null,
      page,
      action: String(action).slice(0, 32),
      step: step != null ? String(step) : null,
      timeSpentMs: typeof timeSpentMs === "number" ? timeSpentMs : null,
      ip: getClientIP(request),
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
