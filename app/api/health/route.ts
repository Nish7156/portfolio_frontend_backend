import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

/** Diagnostic endpoint to find root cause of API failures. GET /api/health */
export async function GET() {
  const checks: Record<string, string> = {};
  try {
    checks.MONGODB_URI = process.env.MONGODB_URI ? "set" : "missing";
    checks.FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY ? "set" : "missing";
    checks.JWT_SECRET = process.env.JWT_SECRET ? "set" : "missing";

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        ok: false,
        checks,
        error: "MONGODB_URI is not set in production environment variables",
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    await client.db("portfolio_generator").command({ ping: 1 });
    client.close();
    checks.mongodb = "connected";
    return NextResponse.json({ ok: true, checks });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    checks.mongodb = "failed";
    return NextResponse.json({
      ok: false,
      checks,
      error: msg,
    });
  }
}
