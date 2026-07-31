import type { ReactNode } from "react";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased bg-mesh">
        <Providers>
          <SmoothScroll />
          <ScrollProgress />
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
