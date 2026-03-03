import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { saveResumeToFile } from "@/lib/resume-storage";

async function getUserId(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const { userId } = await verifyToken(auth.slice(7));
    return userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = await connectDB();
    const portfolio = await db.collection("portfolios").findOne({
      userId: new ObjectId(userId),
    });
    if (!portfolio) {
      return NextResponse.json({ portfolio: null });
    }
    const { resumeBase64, ...rest } = portfolio;
    return NextResponse.json({ portfolio: { ...rest, hasResume: !!resumeBase64 } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, email, collegeName, resumeBase64, resumeFileName, additionalDetails } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!resumeBase64 || !resumeFileName) {
      return NextResponse.json({ error: "Resume (PDF) is required" }, { status: 400 });
    }
    if (!resumeFileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
    }

    const rawBase64 =
      String(resumeBase64).includes(",") ? String(resumeBase64).split(",")[1] : String(resumeBase64);

    const maxBase64Bytes = Math.floor(2 * 1024 * 1024 * (4 / 3));
    if (rawBase64.length > maxBase64Bytes) {
      return NextResponse.json({ error: "Resume too large. Max 2MB." }, { status: 400 });
    }

    const db = await connectDB();
    const now = new Date();
    const doc = {
      userId: new ObjectId(userId),
      name: String(name).trim(),
      email: email ? String(email).trim() : null,
      collegeName: collegeName ? String(collegeName).trim() : null,
      resumeBase64: rawBase64,
      resumeFileName,
      additionalDetails: additionalDetails ? String(additionalDetails).trim() : null,
      template: "basic",
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const existing = await db.collection("portfolios").findOne({
      userId: new ObjectId(userId),
    });

    let portfolioId: string;
    if (existing) {
      portfolioId = String(existing._id);
      await db.collection("portfolios").updateOne(
        { userId: new ObjectId(userId) },
        {
          $set: {
            name: doc.name,
            email: doc.email,
            collegeName: doc.collegeName,
            resumeBase64: rawBase64,
            resumeFileName: doc.resumeFileName,
            additionalDetails: doc.additionalDetails ?? existing.additionalDetails,
            updatedAt: now,
          },
        }
      );
    } else {
      const result = await db.collection("portfolios").insertOne(doc);
      portfolioId = String(result.insertedId);
    }
    saveResumeToFile(portfolioId, rawBase64).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
