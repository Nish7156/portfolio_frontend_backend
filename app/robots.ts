import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://portfoliogen.in";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/portfolio/", "/success"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
