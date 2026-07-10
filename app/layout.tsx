import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "고기능 우울증 자가점검";
const description = "겉으로는 괜찮아 보여도 마음속 어려움이 이어지는지 살펴보는 12문항 자가점검입니다.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = new URL("/og.jpg", `${protocol}://${host}`).toString();
  return {
    title, description, icons: { icon: "/favicon.svg" },
    openGraph: { title, description, type: "website", locale: "ko_KR", images: [{ url: image, width: 1536, height: 903, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
