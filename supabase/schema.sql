-- Mental Math Pro - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  age_group TEXT CHECK (age_group IN ('kids', 'junior', 'teen', 'adult', 'expert')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'family')),
  subscription_expires_at TIMESTAMPTZ,
  streak_days INTEGER DEFAULT 0,
  last_played_at DATE,
  total_games INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game history
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT DEFAULT 'arithmetic',
  score INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  wrong_count INTEGER NOT NULL,
  accuracy DECIMAL(5,2),
  time_ms INTEGER NOT NULL,
  problems JSONB, -- Store problem details for review
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily progress tracking
CREATE TABLE public.daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  time_spent_ms INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  categories_practiced TEXT[],
  UNIQUE(user_id, date)
);

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  p.total_games,
  p.total_correct,
  p.streak_days,
  COALESCE(SUM(g.score), 0) as total_score,
  RANK() OVER (ORDER BY COALESCE(SUM(g.score), 0) DESC) as rank
FROM public.profiles p
LEFT JOIN public.games g ON p.id = g.user_id
GROUP BY p.id, p.display_name, p.avatar_url, p.total_games, p.total_correct, p.streak_days;

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games: Users can read/write own
CREATE POLICY "Users can view own games" ON public.games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games" ON public.games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily progress: Users can read/write own
CREATE POLICY "Users can view own progress" ON public.daily_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.daily_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.daily_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements: Users can read own
CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_date DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_played_at, streak_days INTO last_date, current_streak
  FROM public.profiles WHERE id = p_user_id;
  
  IF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE public.profiles 
    SET streak_days = streak_days + 1, last_played_at = CURRENT_DATE
    WHERE id = p_user_id;
  ELSIF last_date != CURRENT_DATE THEN
    UPDATE public.profiles 
    SET streak_days = 1, last_played_at = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment game stats
CREATE OR REPLACE FUNCTION public.increment_game_stats(
  p_user_id UUID,
  p_correct_count INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_games = total_games + 1,
    total_correct = total_correct + p_correct_count
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily Challenge completions
CREATE TABLE public.daily_challenge_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL, -- format: daily-YYYY-MM-DD
  score INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Add XP column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- RLS for daily challenges
ALTER TABLE public.daily_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge completions" ON public.daily_challenge_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge completions" ON public.daily_challenge_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to complete daily challenge
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(
  p_user_id UUID,
  p_challenge_id TEXT,
  p_score INTEGER,
  p_xp INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert completion (will fail if already completed due to UNIQUE constraint)
  INSERT INTO public.daily_challenge_completions (user_id, challenge_id, score, xp_earned)
  VALUES (p_user_id, p_challenge_id, p_score, p_xp);
  
  -- Add XP to profile
  UPDATE public.profiles
  SET xp = xp + p_xp
  WHERE id = p_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE; -- Already completed
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

