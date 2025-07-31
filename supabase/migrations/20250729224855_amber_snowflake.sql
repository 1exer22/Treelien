/*
  # Mise à jour pour les thèmes personnalisés

  1. Modifications
    - Ajout de nouveaux thèmes dans la table users_profiles
    - Extension du champ custom_colors pour plus de flexibilité
    - Ajout de champs pour la personnalisation avancée

  2. Nouveaux champs
    - `custom_font` (text, police personnalisée)
    - `custom_background` (text, arrière-plan personnalisé)
    - `button_style` (text, style des boutons)
*/

-- Ajouter de nouveaux champs pour la personnalisation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'custom_font'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN custom_font text DEFAULT 'inter';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'custom_background'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN custom_background text DEFAULT 'gradient';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users_profiles' AND column_name = 'button_style'
  ) THEN
    ALTER TABLE users_profiles ADD COLUMN button_style text DEFAULT 'rounded';
  END IF;
END $$;