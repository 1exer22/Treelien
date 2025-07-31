/*
  # Création de la table links

  1. Nouvelles Tables
    - `links`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence users_profiles)
      - `title` (text, titre du lien)
      - `url` (text, URL de destination)
      - `icon` (text, nom de l'icône optionnelle)
      - `position` (integer, ordre d'affichage)
      - `is_active` (boolean, lien actif/inactif)
      - `click_count` (integer, nombre de clics)
      - `created_at` (timestamp, date de création)

  2. Sécurité
    - Activer RLS sur `links`
    - Politique pour que les utilisateurs puissent gérer leurs propres liens
    - Politique pour que tout le monde puisse lire les liens actifs des profils publics
*/

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  icon text,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent lire leurs propres liens
CREATE POLICY "Users can read own links"
  ON links
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour que les utilisateurs puissent insérer leurs propres liens
CREATE POLICY "Users can insert own links"
  ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politique pour que les utilisateurs puissent modifier leurs propres liens
CREATE POLICY "Users can update own links"
  ON links
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour que les utilisateurs puissent supprimer leurs propres liens
CREATE POLICY "Users can delete own links"
  ON links
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour que tout le monde puisse lire les liens actifs des profils publics
CREATE POLICY "Anyone can read active public links"
  ON links
  FOR SELECT
  TO anon
  USING (
    is_active = true 
    AND user_id IN (
      SELECT id FROM users_profiles WHERE username IS NOT NULL
    )
  );

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(user_id, position);
CREATE INDEX IF NOT EXISTS idx_links_active ON links(user_id, is_active);