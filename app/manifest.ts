import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfoliogen.in";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PortfolioGen",
    short_name: "PortfolioGen",
    description: "Create your professional portfolio from resume. ₹50 or ₹100. Delivered in 6 hours.",
    start_url: baseUrl,
    display: "standalone",
    background_color: "#0f0f23",
    theme_color: "#312e81",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    categories: ["productivity", "business"],
  };
}
