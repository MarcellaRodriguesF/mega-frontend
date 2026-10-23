import type { Metadata } from "next";
import Script from "next/script";
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
  title: {
    default: "MEGA | Plataforma de Gestão",
    template: "%s | MEGA",
  },
  description: "Plataforma de operação e gestão MEGA.",
  icons: {
    icon: {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {children}
        <Script id="mega-theme-init" strategy="beforeInteractive">
          {`try {
            const savedTheme = localStorage.getItem("mega-theme");
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.dataset.theme = savedTheme === "dark" || (savedTheme !== "light" && systemPrefersDark) ? "dark" : "light";
          } catch {
            document.documentElement.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          }`}
        </Script>
      </body>
    </html>
  );
}
