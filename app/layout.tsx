import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TreeLien - Créez votre arbre de liens parfait",
  description:
    "Créez une page link-in-bio magnifique qui connecte votre audience à tout votre contenu. Simple, puissant, et entièrement personnalisable.",
  icons: {
    icon: "/images/treelien-logo.png",
    shortcut: "/images/treelien-logo.png",
    apple: "/images/treelien-logo.png",
  },
  keywords: [
    "link in bio",
    "treelien",
    "arbre de liens",
    "réseaux sociaux",
    "profil",
    "liens",
    "créateurs",
    "influenceurs",
  ],
  authors: [{ name: "TreeLien" }],
  creator: "TreeLien",
  publisher: "TreeLien",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://treelien.com",
    siteName: "TreeLien",
    title: "TreeLien - Créez votre arbre de liens parfait",
    description:
      "Créez une page link-in-bio magnifique qui connecte votre audience à tout votre contenu. Simple, puissant, et entièrement personnalisable.",
    images: [
      {
        url: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "TreeLien - Arbre de Liens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@TreeLien",
    title: "TreeLien - Créez votre arbre de liens parfait",
    description:
      "Créez une page link-in-bio magnifique qui connecte votre audience à tout votre contenu.",
    images: [
      "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop",
    ],
  },
  verification: {
    google: "your-google-verification-code",
    // Ajoutez d'autres codes de vérification si nécessaire
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
