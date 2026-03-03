import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { validateAdminKey } from "@/lib/admin-auth";

function escapeCsv(str: string): string {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-admin-key") || request.nextUrl.searchParams.get("key");
  if (!validateAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await connectDB();
    const events = await db
      .collection("analytics_events")
      .find()
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray();

    const userIds = [...new Set(events.map((e) => e.userId).filter(Boolean))] as string[];
    let userMap: Record<string, { phone?: string }> = {};
    if (userIds.length > 0) {
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .toArray();
      userMap = Object.fromEntries(users.map((u) => [String(u._id), { phone: u.phone }]));
    }

    const header = "Session ID,User ID,Phone,Page,Action,Step,Time Spent (ms),Created At";
    const rows = events.map((e) => {
      const phone = e.userId ? userMap[e.userId]?.phone || "" : "";
      return [
        escapeCsv(e.sessionId || ""),
        escapeCsv(e.userId || ""),
        escapeCsv(phone),
        escapeCsv(e.page || ""),
        escapeCsv(e.action || ""),
        escapeCsv(e.step || ""),
        e.timeSpentMs ?? "",
        escapeCsv(e.createdAt?.toISOString?.() || ""),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="portfolio-analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
