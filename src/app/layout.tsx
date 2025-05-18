import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { getSession } from "~/auth";
import { Footer } from "~/components/atom/Footer";
import { Header } from "~/components/atom/Header";
import { Landing } from "~/components/atom/Landing";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_FRAME_NAME || "Flashcastr",
  description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || "Broadcast your Space Invader flashes.",
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
          {session ? (
            <>
              <Header />
              {children}
              <Footer />
            </>
          ) : (
            <Landing />
          )}
          <Toaster
            toastOptions={{
              style: {
                background: "#111827", // Dark gray, similar to bg-gray-900
                color: "#FFFFFF", // White text
                borderRadius: "0px",
                border: "1px solid #8A63D2", // Purple border
                fontFamily: "'Space Invaders', sans-serif", // Invader font
                padding: "8px",
                letterSpacing: "2px", // Added letter spacing
              },
              success: {
                iconTheme: {
                  primary: "#8A63D2", // Purple for success icon
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#8A63D2", // Purple for error icon (can adjust if a red is preferred for error)
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
