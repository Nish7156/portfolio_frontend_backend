import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "PortfolioGen - Resume to Portfolio in Minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const logoPath = join(process.cwd(), "public", "logo.png");
  const logoData = await readFile(logoPath, "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: 48,
          }}
        >
          <img src={logoSrc} width={280} height={153} style={{ objectFit: "contain" }} alt="" />
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            Resume to Portfolio in Minutes — ₹50
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Create your professional portfolio. OTP · PDF · Done.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
