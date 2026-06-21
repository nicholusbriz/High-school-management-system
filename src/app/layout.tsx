import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elite High School - Management System",
  description: "Elite High School, Kampala Uganda - Excellence in Education",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
