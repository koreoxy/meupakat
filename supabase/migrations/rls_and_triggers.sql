-- supabase/migrations/rls_and_triggers.sql
-- File ini berisi Row Level Security (RLS) dan Trigger untuk sinkronisasi Auth

-- ─── 1. Row Level Security (RLS) ─────────────────────────────────────────────

-- Enable RLS di semua tabel
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Users: User hanya bisa melihat dan mengupdate datanya sendiri
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Kebijakan untuk Streaks:
CREATE POLICY "Users can view own streaks" 
ON streaks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" 
ON streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- Kebijakan untuk Daily Progress:
CREATE POLICY "Users can view own daily progress" 
ON daily_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress" 
ON daily_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress" 
ON daily_progress FOR UPDATE 
USING (auth.uid() = user_id);

-- ─── 2. Auth Trigger (OAuth Sync) ────────────────────────────────────────────

-- Fungsi ini dipanggil secara otomatis oleh Supabase setiap kali ada user baru
-- yang mendaftar via Supabase Auth (misal: login Google pertama kali).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert ke tabel users (level default: beginner)
  INSERT INTO public.users (id, full_name, email, current_level, current_xp, daily_target_minutes)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'beginner',
    0,
    10
  );

  -- Insert ke tabel streaks
  INSERT INTO public.streaks (user_id, current_streak, longest_streak)
  VALUES (new.id, 0, 0);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
