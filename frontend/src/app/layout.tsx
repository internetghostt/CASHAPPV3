import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cash Clone",
  description: "Minimalist cash app clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var html = document.documentElement;
    // keep class when toggled
  } catch (e) {}
})();
            `,
          }}
        />
      </body>
    </html>
  );
}
