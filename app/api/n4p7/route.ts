import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { validateAdminKey, getAdminId } from "@/lib/admin-auth";

async function authGuard(request: NextRequest): Promise<{ key: string } | NextResponse> {
  const key = request.headers.get("x-admin-key") || request.nextUrl.searchParams.get("key");
  if (!validateAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { key: key! };
}

export async function GET(request: NextRequest) {
  const guard = await authGuard(request);
  if (guard instanceof NextResponse) return guard;
  const { key } = guard;
  const actionsOnly = request.nextUrl.searchParams.get("actions") === "1";
  try {
    const db = await connectDB();

    if (actionsOnly) {
      const adminId = getAdminId(key);
      const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1", 10));
      const limit = Math.min(50, Math.max(5, parseInt(request.nextUrl.searchParams.get("limit") || "20", 10)));
      const skip = (page - 1) * limit;
      const [list, total] = await Promise.all([
        db
          .collection("admin_actions")
          .find({ adminId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection("admin_actions").countDocuments({ adminId }),
      ]);
      return NextResponse.json({
        actions: list.map((a) => ({
          action: a.action,
          meta: a.meta,
          createdAt: a.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const [userCount, portfolioCount, paidCount, basicCount, premiumCount, usersPage, portfoliosPage] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("portfolios").countDocuments(),
      db.collection("portfolios").countDocuments({ paymentStatus: "completed" }),
      db.collection("portfolios").countDocuments({ template: "basic", paymentStatus: "completed" }),
      db.collection("portfolios").countDocuments({ template: "premium", paymentStatus: "completed" }),
      parseInt(request.nextUrl.searchParams.get("usersPage") || "1", 10),
      parseInt(request.nextUrl.searchParams.get("portfoliosPage") || "1", 10),
    ]);

    const usersLimit = Math.min(25, Math.max(5, parseInt(request.nextUrl.searchParams.get("usersLimit") || "10", 10)));
    const portfoliosLimit = Math.min(25, Math.max(5, parseInt(request.nextUrl.searchParams.get("portfoliosLimit") || "10", 10)));
    const usersSkip = (Math.max(1, usersPage) - 1) * usersLimit;
    const portfoliosSkip = (Math.max(1, portfoliosPage) - 1) * portfoliosLimit;

    const [recentUsers, recentPortfolios] = await Promise.all([
      db
        .collection("users")
        .find()
        .sort({ createdAt: -1 })
        .skip(usersSkip)
        .limit(usersLimit)
        .toArray(),
      db
        .collection("portfolios")
        .find()
        .sort({ createdAt: -1 })
        .skip(portfoliosSkip)
        .limit(portfoliosLimit)
        .toArray(),
    ]);

    return NextResponse.json({
      userCount,
      portfolioCount,
      paidCount,
      basicCount,
      premiumCount,
      recentUsers: recentUsers.map((u) => ({
        id: u._id,
        phone: u.phone,
        name: u.name,
        createdAt: u.createdAt,
      })),
      usersTotal: userCount,
      usersPage: Math.max(1, usersPage),
      usersLimit,
      usersTotalPages: Math.ceil(userCount / usersLimit),
      recentPortfolios: recentPortfolios.map((p) => ({
        id: p._id,
        userId: p.userId,
        name: p.name,
        email: p.email,
        collegeName: p.collegeName,
        template: p.template,
        paymentStatus: p.paymentStatus,
        amount: p.amount,
        hasResume: !!(p as { resumeBase64?: string }).resumeBase64,
        createdAt: p.createdAt,
      })),
      portfoliosTotal: portfolioCount,
      portfoliosPage: Math.max(1, portfoliosPage),
      portfoliosLimit,
      portfoliosTotalPages: Math.ceil(portfolioCount / portfoliosLimit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

const META_MAX_BYTES = 1024;
const ALLOWED_META_KEYS = new Set(["portfolioId", "sessionId", "name", "fileName"]);

function sanitizeMeta(meta: unknown): Record<string, string> | undefined {
  if (meta == null) return undefined;
  if (typeof meta !== "object" || Array.isArray(meta)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!ALLOWED_META_KEYS.has(k) || typeof v !== "string") continue;
    out[k] = String(v).slice(0, 256);
  }
  const str = JSON.stringify(out);
  if (str.length > META_MAX_BYTES) return undefined;
  return Object.keys(out).length > 0 ? out : undefined;
}

export async function POST(request: NextRequest) {
  const guard = await authGuard(request);
  if (guard instanceof NextResponse) return guard;
  const { key } = guard;
  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "unknown").slice(0, 64);
    const meta = sanitizeMeta(body.meta);
    const db = await connectDB();
    await db.collection("admin_actions").insertOne({
      adminId: getAdminId(key),
      action,
      meta,
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
