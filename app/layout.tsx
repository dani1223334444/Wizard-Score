import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wizard Score - Card Game App",
  description: "Play and score the Wizard card game digitally - no more paper and pencil!",
  icons: {
    icon: '/wizard-icon.svg',
    shortcut: '/wizard-icon.svg',
  },
  other: {
    'msapplication-TileColor': '#22c55e',
    'theme-color': '#22c55e',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/wizard-icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/wizard-icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
