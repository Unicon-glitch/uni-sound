import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uni Sound — музыка без границ",
  description: "Музыкальная платформа Unicon Music.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
