"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Save, RotateCcw, Sparkles } from "lucide-react";
import { useSupabase } from "@/components/providers";
import { toast } from "sonner";
import Link from "next/link";
import { useStripeCheckout } from "@/hooks/use-stripe-checkout";
import {
  defaultThemes,
  fontOptions,
  backgroundOptions,
  buttonStyleOptions,
  cardStyleOptions,
  type CustomTheme,
} from "@/lib/themes";
import { ColorPicker } from "./color-picker";
import { ThemePreview } from "./theme-preview";

interface ThemeEditorProps {
  profile: any;
  onThemeUpdated: () => void;
}

export function ThemeEditor({ profile, onThemeUpdated }: ThemeEditorProps) {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const { startCheckout, loading: checkoutLoading } = useStripeCheckout();
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(
    defaultThemes.minimal
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      loadCurrentTheme();
    }
  }, [profile]);

  const loadCurrentTheme = () => {
    const baseTheme = defaultThemes[profile.theme] || defaultThemes.minimal;

    // Fusionner avec les couleurs personnalisées si elles existent
    const customColors = profile.custom_colors || {};
    const customTheme: CustomTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...customColors,
      },
      font: profile.custom_font || baseTheme.font,
      backgroundType: profile.custom_background || baseTheme.backgroundType,
      buttonStyle: profile.button_style || baseTheme.buttonStyle,
    };

    setCurrentTheme(customTheme);
  };

  const handleThemeChange = (themeId: string) => {
    const newTheme = defaultThemes[themeId];
    if (newTheme) {
      setCurrentTheme(newTheme);
      setHasChanges(true);
    }
  };

  const handleColorChange = (
    colorKey: keyof CustomTheme["colors"],
    color: string
  ) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: color,
      },
    }));
    setHasChanges(true);
  };

  const handleStyleChange = (key: keyof CustomTheme, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("users_profiles")
        .update({
          theme: currentTheme.id,
          custom_colors: currentTheme.colors,
          custom_font: currentTheme.font,
          custom_background: currentTheme.backgroundType,
          button_style: currentTheme.buttonStyle,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving theme:", error);
        toast.error("Erreur lors de la sauvegarde du thème");
      } else {
        toast.success("Thème sauvegardé avec succès !");
        setHasChanges(false);
        onThemeUpdated();
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("Erreur lors de la sauvegarde du thème");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadCurrentTheme();
    setHasChanges(false);
    toast.success("Modifications annulées");
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Éditeur de thème</h2>
          {!profile?.is_premium && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-200"
            >
              Fonctionnalité Premium
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {loading ? (
              <>Sauvegarde...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Éditeur */}
        <div className="space-y-6">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets">Thèmes</TabsTrigger>
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thèmes prédéfinis</CardTitle>
                  <CardDescription>
                    Choisissez un thème de base à personnaliser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.values(defaultThemes).map((theme) => (
                      <Button
                        key={theme.id}
                        variant={
                          currentTheme.id === theme.id ? "default" : "outline"
                        }
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => handleThemeChange(theme.id)}
                      >
                        <div className="flex space-x-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {theme.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Palette de couleurs</CardTitle>
                  <CardDescription>
                    Personnalisez les couleurs de votre thème
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Couleur principale</Label>
                      <ColorPicker
                        color={currentTheme.colors.primary}
                        onChange={(color) =>
                          handleColorChange("primary", color)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur secondaire</Label>
                      <ColorPicker
                        color={currentTheme.colors.secondary}
                        onChange={(color) =>
                          handleColorChange("secondary", color)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Couleur d'accent</Label>
                      <ColorPicker
                        color={currentTheme.colors.accent}
                        onChange={(color) => handleColorChange("accent", color)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrière-plan</Label>
                      <ColorPicker
                        color={currentTheme.colors.background}
                        onChange={(color) =>
                          handleColorChange("background", color)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Surface</Label>
                      <ColorPicker
                        color={currentTheme.colors.surface}
                        onChange={(color) =>
                          handleColorChange("surface", color)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texte principal</Label>
                      <ColorPicker
                        color={currentTheme.colors.text}
                        onChange={(color) => handleColorChange("text", color)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Style et typographie</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence générale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Police de caractères</Label>
                    <Select
                      value={currentTheme.font}
                      onValueChange={(value) =>
                        handleStyleChange("font", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.className}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type d'arrière-plan</Label>
                    <Select
                      value={currentTheme.backgroundType}
                      onValueChange={(value) =>
                        handleStyleChange("backgroundType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundOptions.map((bg) => (
                          <SelectItem key={bg.value} value={bg.value}>
                            {bg.label}
                            {bg.value === "image" && (
                              <Badge variant="secondary" className="ml-2">
                                Premium
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style des boutons</Label>
                    <Select
                      value={currentTheme.buttonStyle}
                      onValueChange={(value) =>
                        handleStyleChange("buttonStyle", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {buttonStyleOptions.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Prévisualisation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Aperçu en temps réel</h3>
          </div>

          <ThemePreview
            theme={currentTheme}
            profile={profile}
            sampleLinks={[
              { id: "1", title: "Mon site web", icon: "globe", url: "#" },
              { id: "2", title: "Instagram", icon: "instagram", url: "#" },
              { id: "3", title: "YouTube", icon: "youtube", url: "#" },
            ]}
          />

          {!profile?.is_premium && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-orange-900 mb-1">
                  Fonctionnalité Premium
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Débloquez la personnalisation complète des thèmes
                </p>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={startCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Chargement..." : "Passer à Premium"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
