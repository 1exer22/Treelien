/*
  # Fonctions utilitaires pour LinkHub

  1. Fonctions
    - `increment_click_count()` - Incrémente le compteur de clics d'un lien
    - `get_user_analytics()` - Récupère les analytics d'un utilisateur
    - `check_premium_limits()` - Vérifie les limites du plan gratuit

  2. Triggers
    - Trigger pour incrémenter automatiquement le compteur de clics
*/

-- Fonction pour incrémenter le compteur de clics
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1 
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour incrémenter automatiquement le compteur lors d'un nouveau clic
DROP TRIGGER IF EXISTS trigger_increment_click_count ON clicks;
CREATE TRIGGER trigger_increment_click_count
  AFTER INSERT ON clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_click_count();

-- Fonction pour obtenir les analytics d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid uuid, days_back integer DEFAULT 7)
RETURNS TABLE (
  link_id uuid,
  link_title text,
  link_url text,
  total_clicks bigint,
  recent_clicks bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as link_id,
    l.title as link_title,
    l.url as link_url,
    l.click_count::bigint as total_clicks,
    COALESCE(recent.click_count, 0)::bigint as recent_clicks
  FROM links l
  LEFT JOIN (
    SELECT 
      c.link_id,
      COUNT(*) as click_count
    FROM clicks c
    WHERE c.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY c.link_id
  ) recent ON l.id = recent.link_id
  WHERE l.user_id = user_uuid
  ORDER BY l.position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les limites du plan gratuit
CREATE OR REPLACE FUNCTION check_premium_limits(user_uuid uuid)
RETURNS TABLE (
  is_premium boolean,
  current_links_count bigint,
  max_links_allowed integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.is_premium,
    COALESCE(link_count.count, 0)::bigint as current_links_count,
    CASE 
      WHEN up.is_premium THEN 999999 
      ELSE 3 
    END as max_links_allowed
  FROM users_profiles up
  LEFT JOIN (
    SELECT user_id, COUNT(*) as count
    FROM links
    WHERE user_id = user_uuid
    GROUP BY user_id
  ) link_count ON up.id = link_count.user_id
  WHERE up.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;