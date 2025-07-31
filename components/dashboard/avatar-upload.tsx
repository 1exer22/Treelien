'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { useSupabase } from '@/components/providers';
import { toast } from 'sonner';
import { StorageService } from '@/lib/storage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onAvatarUpdated?: (newUrl: string | null) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16', 
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5', 
  xl: 'h-6 w-6'
};

export function AvatarUpload({ 
  currentAvatarUrl, 
  userName, 
  size = 'lg',
  onAvatarUpdated,
  className = ''
}: AvatarUploadProps) {
  const { supabase, user } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const validationError = StorageService.validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Uploader le fichier
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setUploading(true);

    try {
      const { url } = await StorageService.uploadAvatar(user.id, file);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('users_profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Erreur lors de la mise à jour du profil');
        return;
      }

      toast.success('Avatar mis à jour avec succès !');
      setPreviewUrl(null);
      onAvatarUpdated?.(url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!user || !currentAvatarUrl) return;

    setDeleting(true);

    try {
      // Extraire le path depuis l'URL
      const url = new URL(currentAvatarUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const path = `${user.id}/${fileName}`;

      // Supprimer de Supabase Storage
      await StorageService.deleteAvatar(path);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('users_profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Erreur lors de la mise à jour du profil');
        return;
      }

      toast.success('Avatar supprimé avec succès !');
      onAvatarUpdated?.(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression de l\'avatar');
    } finally {
      setDeleting(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const initials = userName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} ring-4 ring-white shadow-lg`}>
          <AvatarImage src={displayUrl || ''} alt={userName || 'Avatar'} />
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Overlay avec boutons */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={triggerFileSelect}
              disabled={uploading || deleting}
            >
              {uploading ? (
                <Loader2 className={`${iconSizes[size]} animate-spin`} />
              ) : (
                <Camera className={iconSizes[size]} />
              )}
            </Button>

            {currentAvatarUrl && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-white hover:bg-red-500/20"
                    disabled={uploading || deleting}
                  >
                    {deleting ? (
                      <Loader2 className={`${iconSizes[size]} animate-spin`} />
                    ) : (
                      <Trash2 className={iconSizes[size]} />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer l'avatar</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer votre avatar ? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Suppression...' : 'Supprimer'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bouton d'upload alternatif pour mobile */}
      {size === 'xl' && (
        <div className="mt-4 flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileSelect}
            disabled={uploading || deleting}
            className="flex items-center space-x-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploading ? 'Upload...' : 'Changer l\'avatar'}</span>
          </Button>

          {currentAvatarUrl && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading || deleting}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{deleting ? 'Suppression...' : 'Supprimer'}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'avatar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer votre avatar ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
}