"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";
import { defaultThemes, getThemeClasses, type CustomTheme } from "@/lib/themes";
import { SEOService, generateMetaTags } from "@/lib/seo";
import {
  Link,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Globe,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserProfile = Database["public"]["Tables"]["users_profiles"]["Row"];
type LinkItem = Database["public"]["Tables"]["links"]["Row"];

interface PublicPageProps {
  params: {
    username: string;
  };
}

const iconMap = {
  link: Link,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  map: MapPin,
};

const fontClasses = {
  inter: "font-sans",
  poppins: "font-sans",
  roboto: "font-sans",
  playfair: "font-serif",
  montserrat: "font-sans",
  opensans: "font-sans",
};

export default function PublicPage({ params }: PublicPageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState<any>(null);

  useEffect(() => {
    loadProfileAndLinks();
  }, [params.username]);

  const loadProfileAndLinks = async () => {
    try {
      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from("users_profiles")
        .select("*")
        .eq("username", params.username)
        .single();

      if (profileError || !profileData) {
        notFound();
        return;
      }

      setProfile(profileData);

      // Charger les liens actifs
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("is_active", true)
        .order("position", { ascending: true });

      if (!linksError && linksData) {
        setLinks(linksData);
      }

      // Générer les données SEO
      const baseUrl = window.location.origin;
      const seo = SEOService.generateProfileSEO(
        profileData,
        linksData || [],
        baseUrl
      );
      setSeoData(seo);
    } catch (error) {
      console.error("Error loading profile:", error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (linkId: string, url: string) => {
    // Enregistrer le clic
    try {
      await supabase.from("clicks").insert([
        {
          link_id: linkId,
          user_agent: navigator.userAgent,
          referer: document.referrer,
          ip_address: null, // Sera géré côté serveur si nécessaire
          country: null, // Sera géré côté serveur si nécessaire
        },
      ]);
    } catch (error) {
      console.error("Error tracking click:", error);
    }

    // Ouvrir le lien
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  // Construire le thème personnalisé
  const baseTheme = defaultThemes[profile.theme] || defaultThemes.minimal;
  const customTheme: CustomTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...(profile.custom_colors || {}),
    },
    font: profile.custom_font || baseTheme.font,
    backgroundType:
      (profile.custom_background as "image" | "gradient" | "solid") ||
      baseTheme.backgroundType,
    buttonStyle:
      (profile.button_style as "rounded" | "square" | "pill") ||
      baseTheme.buttonStyle,
  };

  const themeClasses = getThemeClasses(customTheme);
  const fontClass =
    fontClasses[customTheme.font as keyof typeof fontClasses] || "font-sans";

  // Générer les meta tags pour le SEO
  const metaTags = seoData ? SEOService.generateSocialMetaTags(seoData) : null;

  const containerStyle = {
    background:
      customTheme.backgroundType === "gradient"
        ? `linear-gradient(135deg, ${customTheme.colors.background} 0%, ${customTheme.colors.surface} 100%)`
        : customTheme.colors.background,
    color: customTheme.colors.text,
  };

  return (
    <>
      {/* SEO Meta Tags */}
      {metaTags && (
        <Head>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          <meta name="keywords" content={seoData.keywords.join(", ")} />
          <meta name="author" content={seoData.author} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={seoData.url} />

          {/* Open Graph */}
          <meta property="og:title" content={metaTags.openGraph.title} />
          <meta
            property="og:description"
            content={metaTags.openGraph.description}
          />
          <meta property="og:url" content={metaTags.openGraph.url} />
          <meta property="og:type" content={metaTags.openGraph.type} />
          <meta property="og:image" content={metaTags.openGraph.image} />
          <meta property="og:site_name" content={metaTags.openGraph.siteName} />
          <meta property="og:locale" content={metaTags.openGraph.locale} />

          {/* Twitter */}
          <meta name="twitter:card" content={metaTags.twitter.card} />
          <meta name="twitter:title" content={metaTags.twitter.title} />
          <meta
            name="twitter:description"
            content={metaTags.twitter.description}
          />
          <meta name="twitter:image" content={metaTags.twitter.image} />
          <meta name="twitter:site" content={metaTags.twitter.site} />
          {metaTags.twitter.creator && (
            <meta name="twitter:creator" content={metaTags.twitter.creator} />
          )}

          {/* JSON-LD */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(metaTags.jsonLd),
            }}
          />
        </Head>
      )}

      <div
        className={`min-h-screen py-8 px-4 ${fontClass}`}
        style={containerStyle}
      >
        <div className="max-w-md mx-auto">
          {/* Header avec profil */}
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white/20">
              <AvatarImage
                src={profile.avatar_url || ""}
                alt={profile.full_name || ""}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {profile.full_name?.charAt(0) ||
                  profile.username?.charAt(0) ||
                  "U"}
              </AvatarFallback>
            </Avatar>

            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: customTheme.colors.text }}
            >
              {profile.full_name || `@${profile.username}`}
            </h1>

            {profile.bio && (
              <p
                className="max-w-sm mx-auto leading-relaxed"
                style={{ color: customTheme.colors.textSecondary }}
              >
                {profile.bio}
              </p>
            )}
          </div>

          {/* Liste des liens */}
          <div className="space-y-4">
            {links.map((link) => {
              const IconComponent =
                iconMap[link.icon as keyof typeof iconMap] || Link;

              return (
                <Button
                  key={link.id}
                  variant="ghost"
                  className={`w-full h-auto p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    customTheme.buttonStyle === "rounded"
                      ? "rounded-lg"
                      : customTheme.buttonStyle === "square"
                      ? "rounded-none"
                      : "rounded-full"
                  }`}
                  style={{
                    backgroundColor: customTheme.colors.surface,
                    borderColor: customTheme.colors.border,
                    color: customTheme.colors.text,
                  }}
                  onClick={() => handleLinkClick(link.id, link.url)}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: customTheme.colors.primary }}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">{link.title}</h3>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p
              className="text-sm mb-4"
              style={{ color: customTheme.colors.textSecondary }}
            >
              Créé avec TreeLien
            </p>
            <Button
              variant="outline"
              size="sm"
              className={`backdrop-blur-sm ${
                customTheme.buttonStyle === "rounded"
                  ? "rounded-lg"
                  : customTheme.buttonStyle === "square"
                  ? "rounded-none"
                  : "rounded-full"
              }`}
              style={{
                backgroundColor: `${customTheme.colors.accent}20`,
                borderColor: customTheme.colors.accent,
                color: customTheme.colors.accent,
              }}
              onClick={() => window.open("/", "_blank")}
            >
              Créer ma page
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
