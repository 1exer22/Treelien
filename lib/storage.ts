import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageService {
  private static readonly AVATAR_BUCKET = 'avatars';
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  static validateFile(file: File): string | null {
    // Vérifier le type de fichier
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.';
    }

    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      return 'Fichier trop volumineux. Maximum 2MB autorisé.';
    }

    return null;
  }

  static async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    // Valider le fichier
    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    try {
      // Supprimer l'ancien avatar s'il existe
      await this.deleteOldAvatars(userId);

      // Uploader le nouveau fichier
      const { data, error } = await supabase.storage
        .from(this.AVATAR_BUCKET)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error('Erreur lors de l\'upload du fichier');
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(this.AVATAR_BUCKET)
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Erreur lors de l\'upload');
    }
  }

  static async deleteOldAvatars(userId: string): Promise<void> {
    try {
      // Lister tous les fichiers de l'utilisateur
      const { data: files, error: listError } = await supabase.storage
        .from(this.AVATAR_BUCKET)
        .list(userId);

      if (listError || !files || files.length === 0) {
        return; // Pas d'anciens fichiers ou erreur non critique
      }

      // Supprimer tous les anciens avatars
      const filesToDelete = files.map(file => `${userId}/${file.name}`);
      
      const { error: deleteError } = await supabase.storage
        .from(this.AVATAR_BUCKET)
        .remove(filesToDelete);

      if (deleteError) {
        console.warn('Warning: Could not delete old avatars:', deleteError);
        // Ne pas faire échouer l'upload pour cette erreur
      }
    } catch (error) {
      console.warn('Warning: Error cleaning old avatars:', error);
      // Ne pas faire échouer l'upload pour cette erreur
    }
  }

  static getAvatarUrl(path: string | null): string | null {
    if (!path) return null;
    
    const { data: { publicUrl } } = supabase.storage
      .from(this.AVATAR_BUCKET)
      .getPublicUrl(path);
    
    return publicUrl;
  }

  static async deleteAvatar(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.AVATAR_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error('Erreur lors de la suppression de l\'avatar');
    }
  }
}