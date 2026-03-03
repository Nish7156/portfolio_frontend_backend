import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { validateAdminKey } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-admin-key") || request.nextUrl.searchParams.get("key");
  if (!validateAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();
    const userId = request.nextUrl.searchParams.get("userId");
    const match: Record<string, unknown> = {};
    if (userId) match.userId = userId;

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(request.nextUrl.searchParams.get("limit") || "15", 10)));

    const events = await db
      .collection("analytics_events")
      .find(match)
      .sort({ createdAt: -1 })
      .limit(5000)
      .toArray();

    const bySession = new Map<
      string,
      {
        sessionId: string;
        userId?: string;
        phone?: string;
        name?: string;
        events: { page: string; action: string; step?: string; timeSpentMs?: number; createdAt: string }[];
        totalTimeMs: number;
        lastStep?: string;
        completed: boolean;
      }
    >();

    for (const e of events) {
      const sid = e.sessionId || "unknown";
      if (!bySession.has(sid)) {
        bySession.set(sid, {
          sessionId: sid,
          userId: e.userId,
          events: [],
          totalTimeMs: 0,
          completed: false,
        });
      }
      const s = bySession.get(sid)!;
      s.events.unshift({
        page: e.page,
        action: e.action,
        step: e.step,
        timeSpentMs: e.timeSpentMs,
        createdAt: e.createdAt?.toISOString?.() || String(e.createdAt),
      });
      if (e.timeSpentMs) s.totalTimeMs += e.timeSpentMs;
      if (e.action === "page_leave" && e.step != null && s.lastStep == null) s.lastStep = `${e.page}#${e.step}`;
      if (e.page === "/success") s.completed = true;
    }

    const userIds = [...new Set(events.map((e) => e.userId).filter(Boolean))] as string[];
    let userMap: Record<string, { phone?: string; name?: string }> = {};
    if (userIds.length > 0) {
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .toArray();
      userMap = Object.fromEntries(users.map((u) => [String(u._id), { phone: u.phone, name: u.name }]));

      const portfolios = await db
        .collection("portfolios")
        .find({ userId: { $in: userIds.map((id) => new ObjectId(id)) } })
        .project({ userId: 1, name: 1 })
        .toArray();
      for (const p of portfolios) {
        const uid = String(p.userId);
        if (userMap[uid]) userMap[uid].name = p.name;
      }
    }

    const allSessions = Array.from(bySession.values()).map((s) => ({
      ...s,
      phone: s.userId ? userMap[s.userId]?.phone : undefined,
      name: s.userId ? userMap[s.userId]?.name : undefined,
    }));

    const total = allSessions.length;
    const skip = (page - 1) * limit;
    const sessions = allSessions.slice(skip, skip + limit);

    return NextResponse.json({
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
