import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
});

export const metadata: Metadata = {
  title: "VetMind AI - כרטיסיות לימוד לווטרינריה",
  description: "הפוך את הסיכומים שלך לכרטיסיות חכמות בעזרת בינה מלאכותית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          assistant.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
