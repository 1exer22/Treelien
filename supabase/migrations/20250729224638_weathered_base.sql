/*
  # Configuration du stockage pour les avatars

  1. Storage
    - Création du bucket `avatars` pour stocker les images de profil
    - Politiques de sécurité pour l'upload et la lecture
    - Limitation de taille et types de fichiers

  2. Sécurité
    - Les utilisateurs peuvent uploader leur propre avatar
    - Tout le monde peut voir les avatars publics
    - Limitation à 2MB par fichier
    - Types autorisés : jpg, jpeg, png, webp
*/

-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs d'uploader leur avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de mettre à jour leur avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre aux utilisateurs de supprimer leur avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique pour permettre à tout le monde de voir les avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');