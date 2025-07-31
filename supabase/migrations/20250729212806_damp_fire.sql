/*
  # Création de la table users_profiles

  1. Nouvelles Tables
    - `users_profiles`
      - `id` (uuid, clé primaire, référence auth.users)
      - `username` (text, unique, nom d'utilisateur public)
      - `full_name` (text, nom complet)
      - `bio` (text, biographie)
      - `avatar_url` (text, URL de l'avatar)
      - `theme` (text, thème choisi par défaut 'minimal')
      - `custom_colors` (jsonb, couleurs personnalisées)
      - `is_premium` (boolean, statut premium par défaut false)
      - `created_at` (timestamp, date de création)

  2. Sécurité
    - Activer RLS sur `users_profiles`
    - Politique pour que les utilisateurs puissent lire leur propre profil
    - Politique pour que les utilisateurs puissent modifier leur propre profil
    - Politique pour que tout le monde puisse lire les profils publics (pour les pages link-in-bio)
*/

CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  bio text,
  avatar_url text,
  theme text DEFAULT 'minimal',
  custom_colors jsonb DEFAULT '{}',
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON users_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON users_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON users_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politique pour que tout le monde puisse lire les profils publics (pour les pages link-in-bio)
CREATE POLICY "Anyone can read public profiles"
  ON users_profiles
  FOR SELECT
  TO anon
  USING (username IS NOT NULL);

-- Index pour optimiser les recherches par username
CREATE INDEX IF NOT EXISTS idx_users_profiles_username ON users_profiles(username);