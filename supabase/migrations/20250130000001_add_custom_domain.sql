/*
  # Ajout des domaines personnalisés pour Premium

  1. Modifications de table
    - Ajouter `custom_domain` à `users_profiles`
    - Ajouter `domain_verified` pour la vérification DNS
    - Ajouter `domain_verification_token` pour sécurité

  2. Sécurité
    - Seuls les utilisateurs Premium peuvent configurer un domaine
    - Domaines uniques (pas de doublons)
*/

-- Ajouter les colonnes pour les domaines personnalisés
ALTER TABLE users_profiles 
ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
ADD COLUMN IF NOT EXISTS domain_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS domain_verification_token text,
ADD COLUMN IF NOT EXISTS domain_configured_at timestamptz;

-- Index pour optimiser les recherches par domaine
CREATE INDEX IF NOT EXISTS idx_users_profiles_custom_domain ON users_profiles(custom_domain) WHERE custom_domain IS NOT NULL;

-- Fonction pour générer un token de vérification
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour configurer un domaine personnalisé
CREATE OR REPLACE FUNCTION set_custom_domain(user_uuid uuid, domain text)
RETURNS TABLE (
  success boolean,
  message text,
  verification_token text
) AS $$
DECLARE
  user_premium boolean;
  existing_domain text;
  token text;
BEGIN
  -- Vérifier que l'utilisateur est Premium
  SELECT is_premium INTO user_premium 
  FROM users_profiles 
  WHERE id = user_uuid;
  
  IF NOT user_premium THEN
    RETURN QUERY SELECT false, 'Cette fonctionnalité est réservée aux utilisateurs Premium', null::text;
    RETURN;
  END IF;
  
  -- Vérifier que le domaine n'est pas déjà utilisé
  SELECT custom_domain INTO existing_domain 
  FROM users_profiles 
  WHERE custom_domain = domain AND id != user_uuid;
  
  IF existing_domain IS NOT NULL THEN
    RETURN QUERY SELECT false, 'Ce domaine est déjà utilisé par un autre utilisateur', null::text;
    RETURN;
  END IF;
  
  -- Générer un nouveau token de vérification
  SELECT generate_domain_verification_token() INTO token;
  
  -- Mettre à jour le profil utilisateur
  UPDATE users_profiles 
  SET 
    custom_domain = domain,
    domain_verified = false,
    domain_verification_token = token,
    domain_configured_at = now()
  WHERE id = user_uuid;
  
  RETURN QUERY SELECT true, 'Domaine configuré avec succès. Vérification DNS requise.', token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier un domaine
CREATE OR REPLACE FUNCTION verify_custom_domain(user_uuid uuid)
RETURNS TABLE (
  success boolean,
  message text
) AS $$
BEGIN
  -- Marquer le domaine comme vérifié
  -- En production, cette fonction ferait une vérification DNS réelle
  UPDATE users_profiles 
  SET domain_verified = true
  WHERE id = user_uuid AND custom_domain IS NOT NULL;
  
  IF FOUND THEN
    RETURN QUERY SELECT true, 'Domaine vérifié avec succès !';
  ELSE
    RETURN QUERY SELECT false, 'Aucun domaine à vérifier';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour supprimer un domaine personnalisé
CREATE OR REPLACE FUNCTION remove_custom_domain(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  UPDATE users_profiles 
  SET 
    custom_domain = null,
    domain_verified = false,
    domain_verification_token = null,
    domain_configured_at = null
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;