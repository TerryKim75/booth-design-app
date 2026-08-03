import type { MetadataRoute } from "next";
import { listPortfolios } from "@/lib/data/portfolio";
import { listBoothDesigns } from "@/lib/data/booth-designs";
import { listRentalItems } from "@/lib/data/rentals";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.a-s-o.co.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/system`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/portfolio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/booth-design`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/rental`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/downloads`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/inquiry`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [portfolios, boothDesigns, rentals] = await Promise.all([
    listPortfolios({ pageSize: 500 }),
    listBoothDesigns({ pageSize: 1000 }),
    listRentalItems({ pageSize: 500 }),
  ]);

  const portfolioRoutes: MetadataRoute.Sitemap = portfolios.items.map((p) => ({
    url: `${siteUrl}/portfolio/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const boothRoutes: MetadataRoute.Sitemap = boothDesigns.items.map((b) => ({
    url: `${siteUrl}/booth-design/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const rentalRoutes: MetadataRoute.Sitemap = rentals.items.map((r) => ({
    url: `${siteUrl}/rental/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...portfolioRoutes, ...boothRoutes, ...rentalRoutes];
}
