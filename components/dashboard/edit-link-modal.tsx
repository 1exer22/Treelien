'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSupabase } from '@/components/providers';
import { toast } from 'sonner';
import { Link, Instagram, Twitter, Youtube, Github, Globe, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  is_active: boolean;
  click_count: number;
}

interface EditLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkUpdated: () => void;
  link: LinkItem | null;
}

const iconOptions = [
  { value: 'link', label: 'Lien générique', icon: Link },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'globe', label: 'Site web', icon: Globe },
  { value: 'mail', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Téléphone', icon: Phone },
  { value: 'map', label: 'Localisation', icon: MapPin },
];

export function EditLinkModal({ open, onOpenChange, onLinkUpdated, link }: EditLinkModalProps) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'link',
    isActive: true
  });

  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        url: link.url,
        icon: link.icon || 'link',
        isActive: link.is_active
      });
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!link) return;

    setLoading(true);

    try {
      // Vérifier l'URL
      let url = formData.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const { error } = await supabase
        .from('links')
        .update({
          title: formData.title,
          url: url,
          icon: formData.icon,
          is_active: formData.isActive
        })
        .eq('id', link.id);

      if (error) {
        console.error('Error updating link:', error);
        toast.error('Erreur lors de la modification du lien');
      } else {
        toast.success('Lien modifié avec succès !');
        onOpenChange(false);
        onLinkUpdated();
      }
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Erreur lors de la modification du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!link) return;

    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', link.id);

      if (error) {
        console.error('Error deleting link:', error);
        toast.error('Erreur lors de la suppression du lien');
      } else {
        toast.success('Lien supprimé avec succès !');
        onOpenChange(false);
        onLinkUpdated();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Erreur lors de la suppression du lien');
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedIcon = iconOptions.find(option => option.value === formData.icon);

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le lien</DialogTitle>
          <DialogDescription>
            Modifiez les informations de votre lien. {link.click_count} clics enregistrés.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du lien</Label>
            <Input
              id="title"
              placeholder="Mon site web"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icône</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {selectedIcon && <selectedIcon.icon className="h-4 w-4" />}
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
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="active">Lien actif</Label>
          </div>

          <DialogFooter className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le lien</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.
                    Toutes les statistiques de clics seront également perdues.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Suppression...' : 'Supprimer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}