"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, Instagram, Youtube, Globe } from "lucide-react";
import type { CustomTheme } from "@/lib/themes";

interface ThemePreviewProps {
  theme: CustomTheme;
  profile: any;
  sampleLinks: Array<{
    id: string;
    title: string;
    icon: string;
    url: string;
  }>;
}

const iconMap = {
  link: Link,
  instagram: Instagram,
  youtube: Youtube,
  globe: Globe,
};

const fontClasses = {
  inter: "font-sans",
  poppins: "font-sans",
  roboto: "font-sans",
  playfair: "font-serif",
  montserrat: "font-sans",
  opensans: "font-sans",
};

const buttonStyleClasses = {
  rounded: "rounded-lg",
  square: "rounded-none",
  pill: "rounded-full",
};

export function ThemePreview({
  theme,
  profile,
  sampleLinks,
}: ThemePreviewProps) {
  const { colors, font, backgroundType, buttonStyle } = theme;

  const backgroundClass =
    backgroundType === "gradient" ? `bg-gradient-to-br` : "bg-solid";

  const fontClass =
    fontClasses[font as keyof typeof fontClasses] || "font-sans";
  const buttonClass =
    buttonStyleClasses[buttonStyle as keyof typeof buttonStyleClasses];

  const containerStyle = {
    background:
      backgroundType === "gradient"
        ? `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`
        : colors.background,
    color: colors.text,
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
      {/* Header de prévisualisation */}
      <div className="bg-gray-100 px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-600 font-mono">
            linkhub.com/{profile?.username || "preview"}
          </span>
        </div>
      </div>

      {/* Contenu de la prévisualisation */}
      <div className={`p-8 min-h-[400px] ${fontClass}`} style={containerStyle}>
        <div className="max-w-sm mx-auto">
          {/* Profil */}
          <div className="text-center mb-8">
            <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-white/20">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={profile?.full_name || ""}
              />
              <AvatarFallback
                className="text-xl font-bold text-white"
                style={{ backgroundColor: colors.primary }}
              >
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              {profile?.full_name || "Votre nom"}
            </h1>

            <p
              className="text-sm leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              {profile?.bio || "Votre biographie apparaîtra ici..."}
            </p>
          </div>

          {/* Liens d'exemple */}
          <div className="space-y-3">
            {sampleLinks.map((link) => {
              const IconComponent =
                iconMap[link.icon as keyof typeof iconMap] || Link;

              return (
                <Button
                  key={link.id}
                  variant="ghost"
                  className={`w-full h-auto p-4 transition-all duration-200 hover:scale-105 ${buttonClass}`}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
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
          <div className="text-center mt-8">
            <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
              Créé avec TreeLien
            </p>
            <Button
              size="sm"
              className={`${buttonClass} opacity-80`}
              style={{
                backgroundColor: colors.accent,
                color: colors.background,
              }}
            >
              Créer ma page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
