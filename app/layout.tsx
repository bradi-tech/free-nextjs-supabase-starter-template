import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TanstackQueryProvider } from "@/providers/query-client";

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js Starter Boilerplate - Modern Web Development",
  description: "A production-ready Next.js starter template featuring TypeScript, Tailwind CSS, authentication, and more. Build scalable web applications faster.",
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Web Development", "Starter Template"],
  authors: [{ name: "bradi.tech" }],
  creator: "bradi.tech",
  publisher: "bradi.tech",
  openGraph: {
    title: "Next.js Starter Boilerplate - Modern Web Development",
    description: "A production-ready Next.js 15 starter template featuring TypeScript, Tailwind CSS, authentication, and more. Build scalable web applications faster.",
    url: defaultUrl,
    siteName: "Next.js Starter Boilerplate",
    images: [
      {
        url: `${defaultUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Next.js Starter Boilerplate",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js Starter Boilerplate - Modern Web Development",
    description: "A production-ready Next.js 15 starter template featuring TypeScript, Tailwind CSS, authentication, and more.",
    images: [`${defaultUrl}/opengraph-image.png`],
    creator: "@bradi_tech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body suppressHydrationWarning={true} className="bg-background text-foreground">
        <TanstackQueryProvider>
          <main className="min-h-screen ">
            {children}
          </main>
          <Toaster closeButton expand richColors position="bottom-center" />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
