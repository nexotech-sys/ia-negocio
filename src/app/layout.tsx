import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    default: "IA Negocio - Inteligencia Artificial para Emprendedores",
    template: "%s | IA Negocio",
  },
  description:
    "Guías prácticas, herramientas y estrategias de inteligencia artificial para emprendedores y negocios. Aprendé a usar IA para crecer tu empresa.",
  keywords: [
    "inteligencia artificial",
    "IA para negocios",
    "herramientas IA",
    "emprendedores",
    "automatización",
    "ChatGPT",
    "marketing con IA",
    "IA en español",
  ],
  authors: [{ name: "Equipo IA Negocio" }],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "IA Negocio",
    title: "IA Negocio - Inteligencia Artificial para Emprendedores",
    description:
      "Guías prácticas, herramientas y estrategias de inteligencia artificial para emprendedores y negocios.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IA Negocio - Inteligencia Artificial para Emprendedores",
    description:
      "Guías prácticas, herramientas y estrategias de inteligencia artificial para emprendedores y negocios.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense - descomentar cuando esté aprobado */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body className="flex min-h-full flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
