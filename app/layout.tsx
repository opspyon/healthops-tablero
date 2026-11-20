import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tablero HealthOps · Clivi",
  description: "Seguimiento de tickets de HubSpot, solicitudes de Google Chat y escalaciones de HealthOps.",
};

export const viewport: Viewport = {
  themeColor: "#00547C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${publicSans.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
