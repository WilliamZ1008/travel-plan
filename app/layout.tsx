import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const description =
    "把心动的地方，变成两个人都期待的行程。支持行程、地图、预算与清单协作。";

  return {
    metadataBase: new URL(origin),
    title: "漫行 MANXING｜双人旅行计划",
    description,
    applicationName: "漫行 MANXING",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "漫行",
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      title: "漫行 MANXING｜去北京，逛古都。",
      description,
      type: "website",
      url: origin,
      images: [
        {
          url: `${origin}/og.png`,
          width: 1731,
          height: 909,
          alt: "漫行 MANXING 北京周末旅行路线",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "漫行 MANXING｜去北京，逛古都。",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
