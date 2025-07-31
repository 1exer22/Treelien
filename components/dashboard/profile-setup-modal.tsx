"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabase } from "@/components/providers";
import { toast } from "sonner";
import { User, Palette } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
  profile: any;
}

const themes = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Design épuré et moderne",
  },
  {
    value: "colorful",
    label: "Coloré",
    description: "Dégradés vibrants et joyeux",
  },
  { value: "elegant", label: "Élégant", description: "Sombre et sophistiqué" },
  { value: "dark", label: "Dark", description: "Mode sombre intense" },
];

export function ProfileSetupModal({
  open,
  onOpenChange,
  onProfileUpdated,
  profile,
}: ProfileSetupModalProps) {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
    theme: "minimal",
    avatarUrl: null as string | null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        fullName: profile.full_name || "",
        bio: profile.bio || "",
        theme: profile.theme || "minimal",
        avatarUrl: profile.avatar_url || null,
      });
    }
  }, [profile]);

  const checkUsernameAvailable = async (username: string) => {
    if (!username || username === profile?.username) return true;

    const { data, error } = await supabase
      .from("users_profiles")
      .select("username")
      .eq("username", username)
      .neq("id", user?.id);

    return !error && (!data || data.length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    // Validation du nom d'utilisateur
    if (formData.username) {
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(formData.username)) {
        toast.error(
          "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
        );
        return;
      }

      if (formData.username.length < 3) {
        toast.error("Le nom d'utilisateur doit contenir au moins 3 caractères");
        return;
      }

      const isAvailable = await checkUsernameAvailable(formData.username);
      if (!isAvailable) {
        toast.error("Ce nom d'utilisateur est déjà pris");
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("users_profiles")
        .update({
          username: formData.username || null,
          full_name: formData.fullName,
          bio: formData.bio || null,
          theme: formData.theme,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Erreur lors de la mise à jour du profil");
      } else {
        toast.success("Profil mis à jour avec succès !");
        onOpenChange(false);
        onProfileUpdated();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdated = (newUrl: string | null) => {
    setFormData({ ...formData, avatarUrl: newUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Configuration du profil</span>
          </DialogTitle>
          <DialogDescription>
            Personnalisez votre page LinkHub publique
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 space-y-6 px-1">
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatarUrl={formData.avatarUrl}
                userName={formData.fullName}
                size="xl"
                onAvatarUpdated={handleAvatarUpdated}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                placeholder="Jean Dupont"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  linkhub.com/
                </span>
                <Input
                  id="username"
                  placeholder="monnom"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase(),
                    })
                  }
                  className="rounded-l-none"
                />
              </div>
              <p className="text-sm text-gray-500">
                Laissez vide pour utiliser un lien temporaire
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                placeholder="Parlez-nous de vous..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                maxLength={160}
              />
              <p className="text-sm text-gray-500">
                {formData.bio.length}/160 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Thème de la page</Label>
              <Select
                value={formData.theme}
                onValueChange={(value) =>
                  setFormData({ ...formData, theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>
                        {themes.find((t) => t.value === formData.theme)?.label}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div>
                        <div className="font-medium">{theme.label}</div>
                        <div className="text-sm text-gray-500">
                          {theme.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.fullName}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
