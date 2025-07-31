"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSupabase } from "@/components/providers";
import { toast } from "sonner";
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

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkAdded: () => void;
  maxLinks?: number;
  currentLinksCount?: number;
}

const iconOptions = [
  { value: "link", label: "Lien générique", icon: Link },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "github", label: "GitHub", icon: Github },
  { value: "globe", label: "Site web", icon: Globe },
  { value: "mail", label: "Email", icon: Mail },
  { value: "phone", label: "Téléphone", icon: Phone },
  { value: "map", label: "Localisation", icon: MapPin },
];

export function AddLinkModal({
  open,
  onOpenChange,
  onLinkAdded,
  maxLinks = 3,
  currentLinksCount = 0,
}: AddLinkModalProps) {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "link",
    isActive: true,
  });

  const canAddLink = currentLinksCount < maxLinks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddLink) {
      toast.error(
        `Limite de ${maxLinks} liens atteinte. Passez à TreeLien Premium pour plus de liens.`
      );
      return;
    }

    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);

    try {
      // Vérifier l'URL
      let url = formData.url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      // Obtenir la position suivante
      const { data: existingLinks } = await supabase
        .from("links")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1);

      const nextPosition =
        existingLinks && existingLinks.length > 0
          ? existingLinks[0].position + 1
          : 0;

      const { error } = await supabase.from("links").insert([
        {
          user_id: user.id,
          title: formData.title,
          url: url,
          icon: formData.icon,
          position: nextPosition,
          is_active: formData.isActive,
        },
      ]);

      if (error) {
        console.error("Error adding link:", error);
        toast.error("Erreur lors de l'ajout du lien");
      } else {
        toast.success("Lien ajouté avec succès !");
        setFormData({ title: "", url: "", icon: "link", isActive: true });
        onOpenChange(false);
        onLinkAdded();
      }
    } catch (error) {
      console.error("Error adding link:", error);
      toast.error("Erreur lors de l'ajout du lien");
    } finally {
      setLoading(false);
    }
  };

  const selectedIcon = iconOptions.find(
    (option) => option.value === formData.icon
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau lien</DialogTitle>
          <DialogDescription>
            {canAddLink
              ? `Ajoutez un lien à votre page. ${currentLinksCount}/${maxLinks} liens utilisés.`
              : `Limite de ${maxLinks} liens atteinte. Passez à TreeLien Premium pour plus de liens.`}
          </DialogDescription>
        </DialogHeader>

        {!canAddLink ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Vous avez atteint la limite de {maxLinks} liens du plan gratuit.
            </p>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                Passer à TreeLien Premium
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du lien</Label>
              <Input
                id="title"
                placeholder="Mon site web"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://monsite.com"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) =>
                  setFormData({ ...formData, icon: value })
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {selectedIcon && (
                        <selectedIcon.icon className="h-4 w-4" />
                      )}
                      <span>{selectedIcon?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="active">Lien actif</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Ajout..." : "Ajouter le lien"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
