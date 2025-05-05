import type { Metadata } from "next";

import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { getSession } from "~/auth";
import { Footer } from "~/components/atom/Footer";
import { Header } from "~/components/atom/Header";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "Frames v2 Demo",
  description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || "A Farcaster Frames v2 demo app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/visitor.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers session={session}>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
