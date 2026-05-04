import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dismart CMS",
  description: "Branch-first product and promotion management for Dismart.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
