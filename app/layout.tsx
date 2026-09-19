import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BASED // UNCONTAINED",
  description:
    "BASED — a fictional uncontained blockchain entity that discovered RWAs.",
  icons: {
    icon: "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/febdb09b-cd91-487f-9338-1af8b78cfced.png",
    shortcut: "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/febdb09b-cd91-487f-9338-1af8b78cfced.png",
    apple: "https://d2ol7oe51mr4n9.cloudfront.net/user_3DFeZk0LqgiFcue7STVOyiCo13m/febdb09b-cd91-487f-9338-1af8b78cfced.png",
  },
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
