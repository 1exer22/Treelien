/*
  # Création de la table clicks pour les analytics

  1. Nouvelles Tables
    - `clicks`
      - `id` (uuid, clé primaire)
      - `link_id` (uuid, référence links)
      - `user_agent` (text, informations du navigateur)
      - `referer` (text, page de provenance)
      - `ip_address` (text, adresse IP anonymisée)
      - `country` (text, pays détecté)
      - `created_at` (timestamp, date du clic)

  2. Sécurité
    - Activer RLS sur `clicks`
    - Politique pour que les utilisateurs puissent lire les analytics de leurs liens
    - Politique pour permettre l'insertion anonyme des clics
*/

CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  user_agent text,
  referer text,
  ip_address text,
  country text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent lire les analytics de leurs liens
CREATE POLICY "Users can read own link analytics"
  ON clicks
  FOR SELECT
  TO authenticated
  USING (
    link_id IN (
      SELECT id FROM links WHERE user_id = auth.uid()
    )
  );

-- Politique pour permettre l'insertion anonyme des clics (pour le tracking)
CREATE POLICY "Anyone can insert clicks"
  ON clicks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Politique pour permettre l'insertion des clics par les utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert clicks"
  ON clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Index pour optimiser les requêtes analytics
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_link_date ON clicks(link_id, created_at);