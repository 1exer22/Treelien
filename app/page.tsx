"use client";

import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Globe,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { STRIPE_PRODUCTS } from "@/src/stripe-config";
import { useSupabase } from "@/components/providers";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";

export default function Home() {
  const premiumProduct = STRIPE_PRODUCTS[0];
  const { user } = useSupabase();
  const { startCheckout, loading } = useStripeCheckout();

  return (
    <>
      <Head>
        <title>TreeLien - Créez votre arbre de liens parfait</title>
        <meta
          name="description"
          content="Créez une page link-in-bio magnifique qui connecte votre audience à tout votre contenu. Simple, puissant, et entièrement personnalisable."
        />
        <meta
          name="keywords"
          content="link in bio, treelien, arbre de liens, réseaux sociaux, profil, liens, créateurs, influenceurs, instagram, youtube, twitter"
        />
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_SITE_URL || "https://treelien.com"}
        />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "TreeLien",
              description:
                "Créez votre arbre de liens parfait qui connecte votre audience à tout votre contenu.",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://treelien.com",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                description: "Plan gratuit avec 5 liens",
              },
              author: {
                "@type": "Organization",
                name: "TreeLien",
              },
            }),
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img
                src="/images/treelien-logo.png"
                alt="TreeLien"
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TreeLien
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Commencer gratuit
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            🚀 Nouveau : Analytics avancés disponibles
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Votre arbre de liens
            <br />
            personnalisé
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Créez une page link-in-bio magnifique qui connecte votre audience à
            tout votre contenu. Simple, puissant, et entièrement
            personnalisable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                Créer ma page gratuitement
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => {
                const premiumSection =
                  document.getElementById("premium-featured");
                if (premiumSection) {
                  premiumSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Voir un exemple
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Des outils puissants pour créer, personnaliser et analyser votre
              présence en ligne
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Palette className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Templates magnifiques</CardTitle>
                <CardDescription>
                  4 templates professionnels entièrement personnalisables avec
                  couleurs et polices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Analytics détaillés</CardTitle>
                <CardDescription>
                  Suivez les clics, analysez votre audience et optimisez vos
                  performances
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Mobile-first</CardTitle>
                <CardDescription>
                  Design optimisé mobile avec des animations fluides et temps de
                  chargement rapides
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <LinkIcon className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Liens illimités</CardTitle>
                <CardDescription>
                  Ajoutez autant de liens que vous voulez avec drag & drop pour
                  les réorganiser
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Ultra rapide</CardTitle>
                <CardDescription>
                  Pages qui se chargent instantanément grâce à la technologie
                  Next.js
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>Setup en 2 minutes</CardTitle>
                <CardDescription>
                  Créez votre page en quelques clics et partagez immédiatement
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Featured Premium Pages */}
        <section
          id="premium-featured"
          className="bg-gradient-to-r from-blue-50 to-purple-50 py-20"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                🌟 Pages Premium en vedette
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Découvrez les magnifiques pages créées par nos utilisateurs
                Premium. Rejoignez-les et obtenez votre place ici !
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Example Premium Page 1 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-32 relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      PREMIUM
                    </span>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto -mt-12 mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">M</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Marie Designer</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Designer créative | Projets UI/UX
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      🎨 Portfolio
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      📚 Cours Figma
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      ☕ Buy me a coffee
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Premium Page 2 */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-500 to-teal-500 h-32 relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      PREMIUM
                    </span>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full mx-auto -mt-12 mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">T</span>
                  </div>
                  <h3 className="font-bold text-xl mb-2">Thomas Dev</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Développeur Full-Stack | Mentor
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      💻 GitHub
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      📺 YouTube
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      🎓 Formations
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg overflow-hidden flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="font-bold text-xl mb-4">Votre page ici ?</h3>
                  <p className="text-sm mb-6 opacity-90">
                    Passez Premium et obtenez votre place dans cette section !
                  </p>
                  {user ? (
                    <Button
                      className="bg-white text-orange-600 hover:bg-gray-100 font-bold"
                      onClick={startCheckout}
                      disabled={loading}
                    >
                      {loading ? "Chargement..." : "Devenir Premium"}
                    </Button>
                  ) : (
                    <Link href="/auth?return_to=/pricing">
                      <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold">
                        Devenir Premium
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 text-sm">
                ✨ Les pages Premium bénéficient d'une promotion exclusive sur
                TreeLien
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tarifs transparents
            </h2>
            <p className="text-gray-600 text-lg">
              Commencez gratuitement, évoluez quand vous voulez
            </p>
            <div className="mt-6">
              <Link href="/pricing">
                <Button variant="outline" size="lg">
                  Voir tous les détails
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Gratuit</CardTitle>
                <div className="text-4xl font-bold">0€</div>
                <CardDescription>Parfait pour commencer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>3 liens maximum</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>4 templates de base</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Analytics 7 jours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Page publique</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white px-3 py-1 text-sm">
                Populaire
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {premiumProduct.name}
                </CardTitle>
                <div className="text-4xl font-bold">
                  {premiumProduct.price}€
                  <span className="text-lg text-gray-600">/mois</span>
                </div>
                <CardDescription>{premiumProduct.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {premiumProduct.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/pricing">Passer à {premiumProduct.name}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">TreeLien</span>
              </div>
              <div className="text-gray-600">
                © 2024 TreeLien. Tous droits réservés.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
