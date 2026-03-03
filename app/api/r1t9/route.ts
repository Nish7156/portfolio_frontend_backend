import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { validateAdminKey } from "@/lib/admin-auth";
import { readResumeFromFile, saveResumeToFile } from "@/lib/resume-storage";
import { isValidObjectId } from "@/lib/object-id";

export async function GET(request: NextRequest) {
  const key = request.headers.get("x-admin-key") || request.nextUrl.searchParams.get("key");
  const portfolioId = request.nextUrl.searchParams.get("portfolioId");
  if (!validateAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!portfolioId || !isValidObjectId(portfolioId)) {
    return NextResponse.json({ error: "Invalid portfolio" }, { status: 400 });
  }
  try {
    const fileBuf = await readResumeFromFile(portfolioId);
    if (fileBuf && fileBuf.length > 0) {
      const db = await connectDB();
      const doc = await db.collection("portfolios").findOne(
        { _id: new ObjectId(portfolioId) },
        { projection: { resumeFileName: 1 } }
      );
      const name = (doc?.resumeFileName || "resume").replace(/[^a-zA-Z0-9._-]/g, "_") || "resume.pdf";
      return new NextResponse(new Uint8Array(fileBuf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${name}"`,
        },
      });
    }

    const db = await connectDB();
    const doc = await db.collection("portfolios").findOne(
      { _id: new ObjectId(portfolioId) },
      { projection: { resumeBase64: 1, resumeFileName: 1 } }
    );
    if (!doc?.resumeBase64 || !doc?.resumeFileName) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    const rawBase64 =
      String(doc.resumeBase64).includes(",") ? String(doc.resumeBase64).split(",")[1] : String(doc.resumeBase64);
    const buf = Buffer.from(rawBase64, "base64");
    const name = doc.resumeFileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "resume.pdf";
    saveResumeToFile(portfolioId, rawBase64).catch(() => {});
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
