import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASED // UNCONTAINED",
  description:
    "BASED — a fictional uncontained blockchain entity that discovered RWAs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
