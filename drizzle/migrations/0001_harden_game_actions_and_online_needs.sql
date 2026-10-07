ALTER TABLE public.game_profiles ADD COLUMN IF NOT EXISTS need_clock_seconds integer NOT NULL DEFAULT 0;
GRANT SELECT (user_id, display_name, location, cash, hunger, energy, hygiene, bladder, fun, social, mood, career_level, career_xp, business_type, business_stock, business_balance, last_business_tick, last_work_at, rent_due_at, last_active_at, last_updated_at, need_clock_seconds, created_at, bio, background, trait) ON public.game_profiles TO authenticated;
REVOKE UPDATE ON public.game_profiles FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.perform_game_action(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.send_game_message(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_city_directory() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.initialize_game_profile() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.perform_game_action(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_game_message(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_city_directory() TO authenticated;
CREATE OR REPLACE FUNCTION public.get_city_directory()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE WHEN auth.uid() IS NULL THEN '[]'::jsonb ELSE COALESCE(jsonb_agg(jsonb_build_object(
    'display_name', display_name,
    'location', location,
    'mood', mood,
    'career_level', career_level,
    'business_type', business_type,
    'last_active_at', last_active_at
  ) ORDER BY last_active_at DESC), '[]'::jsonb) END
  FROM (
    SELECT display_name, location, mood, career_level, business_type, last_active_at
    FROM public.game_profiles
    WHERE last_active_at > now() - interval '2 minutes'
    ORDER BY last_active_at DESC
    LIMIT 40
  ) AS active_players;
$$;

CREATE OR REPLACE FUNCTION public.perform_game_action(p_action text, p_target text DEFAULT NULL, p_transport text DEFAULT 'walk')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  player public.game_profiles%ROWTYPE;
  player_id uuid := auth.uid();
  elapsed_seconds integer;
  accrued_need_seconds integer;
  need_decay integer;
  business_units integer;
  fare integer;
  wage integer;
  mood_text text;
BEGIN
  IF player_id IS NULL THEN RAISE EXCEPTION 'Sign in before entering the city.'; END IF;
  SELECT * INTO player FROM public.game_profiles WHERE user_id = player_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Create your character before taking an action.'; END IF;

  elapsed_seconds := GREATEST(0, floor(extract(epoch FROM now() - player.last_updated_at))::integer);
  accrued_need_seconds := player.need_clock_seconds + elapsed_seconds;
  need_decay := floor(accrued_need_seconds / 300.0)::integer;
  player.need_clock_seconds := accrued_need_seconds % 300;
  player.hunger := GREATEST(0, player.hunger - need_decay);
  player.energy := GREATEST(0, player.energy - need_decay);
  player.hygiene := GREATEST(0, player.hygiene - need_decay);
  player.bladder := GREATEST(0, player.bladder - need_decay);
  player.fun := GREATEST(0, player.fun - need_decay);
  player.social := GREATEST(0, player.social - need_decay);

  IF player.business_type IS NOT NULL THEN
    business_units := LEAST(player.business_stock, 240, floor(GREATEST(0, extract(epoch FROM now() - player.last_business_tick)) / 45)::integer);
    IF business_units > 0 THEN
      player.business_stock := player.business_stock - business_units;
      player.business_balance := player.business_balance + business_units * 600;
      player.last_business_tick := player.last_business_tick + business_units * interval '45 seconds';
    END IF;
  END IF;

  IF p_action = 'heartbeat' THEN
    NULL;
  ELSIF p_action = 'eat' THEN
    IF player.location NOT IN ('relief_market', 'owerri_mall') THEN RAISE EXCEPTION 'Visit Relief Market or Owerri Mall for a meal.'; END IF;
    IF player.cash < 600 THEN RAISE EXCEPTION 'You need ₦600 for a plate of food.'; END IF;
    player.cash := player.cash - 600;
    player.hunger := LEAST(100, player.hunger + 42);
  ELSIF p_action = 'sleep' THEN
    IF player.location <> 'railway_estate' THEN RAISE EXCEPTION 'Head home to rest.'; END IF;
    player.energy := LEAST(100, player.energy + 66);
    player.hunger := GREATEST(0, player.hunger - 5);
  ELSIF p_action = 'shower' THEN
    IF player.location <> 'railway_estate' THEN RAISE EXCEPTION 'Head home to take a shower.'; END IF;
    player.hygiene := LEAST(100, player.hygiene + 75);
  ELSIF p_action = 'bathroom' THEN
    IF player.location NOT IN ('railway_estate', 'owerri_mall') THEN RAISE EXCEPTION 'Use a restroom at home or Owerri Mall.'; END IF;
    player.bladder := 100;
  ELSIF p_action = 'socialize' THEN
    IF player.location NOT IN ('heroes_square', 'relief_market', 'owerri_mall', 'imsu') THEN RAISE EXCEPTION 'Find people at the square, market, mall or IMSU.'; END IF;
    player.social := LEAST(100, player.social + 32);
    player.mood := 'In good company';
  ELSIF p_action = 'have_fun' THEN
    IF player.location NOT IN ('dan_anyiam_stadium', 'mbari_cultural_centre', 'heroes_square') THEN RAISE EXCEPTION 'Head to a cultural spot or the stadium for fun.'; END IF;
    IF player.cash < 300 THEN RAISE EXCEPTION 'You need ₦300 for an outing.'; END IF;
    player.cash := player.cash - 300;
    player.fun := LEAST(100, player.fun + 42);
    player.mood := 'Enjoying Owerri';
  ELSIF p_action = 'work' THEN
    wage := CASE p_target
      WHEN 'trader' THEN 14000 + (player.career_level - 1) * 2000
      WHEN 'delivery_rider' THEN 12000 + (player.career_level - 1) * 1800
      WHEN 'teacher' THEN 18000 + (player.career_level - 1) * 2200
      WHEN 'designer' THEN 16000 + (player.career_level - 1) * 2000
      ELSE 0 END;
    IF wage = 0 THEN RAISE EXCEPTION 'Choose an available shift.'; END IF;
    IF (p_target = 'trader' AND player.location <> 'relief_market') OR
       (p_target = 'delivery_rider' AND player.location <> 'transport_park') OR
       (p_target = 'teacher' AND player.location <> 'imsu') OR
       (p_target = 'designer' AND player.location <> 'owerri_mall') THEN
      RAISE EXCEPTION 'Travel to your workplace to start this shift.';
    END IF;
    IF player.energy < 12 THEN RAISE EXCEPTION 'You need more energy before starting a shift.'; END IF;
    IF now() - player.last_work_at < interval '45 seconds' THEN RAISE EXCEPTION 'Catch your breath before your next shift.'; END IF;
    player.cash := player.cash + wage;
    player.energy := GREATEST(0, player.energy - 18);
    player.hunger := GREATEST(0, player.hunger - 8);
    player.career_xp := player.career_xp + 100;
    player.career_level := LEAST(5, 1 + floor((player.career_xp + 100)::numeric / 500)::integer);
    player.last_work_at := now();
    player.mood := 'Proud of your progress';
  ELSIF p_action = 'travel' THEN
    IF p_target NOT IN ('railway_estate', 'relief_market', 'transport_park', 'imsu', 'owerri_mall', 'heroes_square', 'mbari_cultural_centre', 'dan_anyiam_stadium') THEN RAISE EXCEPTION 'Choose a place in Owerri.'; END IF;
    IF p_target = player.location THEN RAISE EXCEPTION 'You are already here.'; END IF;
    fare := CASE p_transport WHEN 'walk' THEN 0 WHEN 'bus' THEN 350 WHEN 'keke' THEN 700 WHEN 'okada' THEN 900 WHEN 'taxi' THEN 1800 ELSE -1 END;
    IF fare < 0 THEN RAISE EXCEPTION 'Choose a local transport option.'; END IF;
    IF player.cash < fare THEN RAISE EXCEPTION 'You do not have enough for that fare.'; END IF;
    player.cash := player.cash - fare;
    player.location := p_target;
    player.energy := GREATEST(0, player.energy - CASE p_transport WHEN 'walk' THEN 3 ELSE 1 END);
  ELSIF p_action = 'buy_kiosk' THEN
    IF player.location <> 'relief_market' THEN RAISE EXCEPTION 'Kiosks are available at Relief Market.'; END IF;
    IF player.business_type IS NOT NULL THEN RAISE EXCEPTION 'You already own a provision kiosk.'; END IF;
    IF player.cash < 25000 THEN RAISE EXCEPTION 'You need ₦25,000 to set up your kiosk.'; END IF;
    player.cash := player.cash - 25000;
    player.business_type := 'provision_kiosk';
    player.business_stock := 15;
    player.last_business_tick := now();
    player.mood := 'My own business';
  ELSIF p_action = 'restock' THEN
    IF player.business_type IS NULL THEN RAISE EXCEPTION 'Start your kiosk before ordering stock.'; END IF;
    IF player.cash < 4500 THEN RAISE EXCEPTION 'Restocking costs ₦4,500.'; END IF;
    player.cash := player.cash - 4500;
    player.business_stock := player.business_stock + 10;
  ELSIF p_action = 'collect_profit' THEN
    IF player.business_type IS NULL THEN RAISE EXCEPTION 'You do not own a business yet.'; END IF;
    IF player.business_balance < 600 THEN RAISE EXCEPTION 'Your next sale is still on the way.'; END IF;
    player.cash := player.cash + player.business_balance;
    player.business_balance := 0;
    player.mood := 'Business is moving';
  ELSIF p_action = 'pay_rent' THEN
    IF now() < player.rent_due_at THEN RAISE EXCEPTION 'Your weekly rent is not due yet.'; END IF;
    IF player.cash < 8500 THEN RAISE EXCEPTION 'Your rent is ₦8,500. Earn a little more first.'; END IF;
    player.cash := player.cash - 8500;
    player.rent_due_at := player.rent_due_at + interval '7 days';
    player.mood := 'Rent paid, home safe';
  ELSE
    RAISE EXCEPTION 'That is not an available city action.';
  END IF;

  player.last_active_at := now();
  player.last_updated_at := now();
  IF player.hunger < 15 OR player.energy < 12 THEN mood_text := 'Needs a little care';
  ELSIF player.social < 20 THEN mood_text := 'Missing good company';
  ELSIF player.fun < 20 THEN mood_text := 'Ready for an outing';
  ELSE mood_text := player.mood; END IF;
  player.mood := mood_text;

  UPDATE public.game_profiles SET
    location = player.location, cash = player.cash, hunger = player.hunger,
    energy = player.energy, hygiene = player.hygiene, bladder = player.bladder,
    fun = player.fun, social = player.social, mood = player.mood,
    career_level = player.career_level, career_xp = player.career_xp,
    business_type = player.business_type, business_stock = player.business_stock,
    business_balance = player.business_balance, last_business_tick = player.last_business_tick,
    last_work_at = player.last_work_at, rent_due_at = player.rent_due_at,
    last_active_at = player.last_active_at, last_updated_at = player.last_updated_at,
    need_clock_seconds = player.need_clock_seconds
  WHERE user_id = player_id RETURNING * INTO player;

  RETURN to_jsonb(player);
END;
$$;