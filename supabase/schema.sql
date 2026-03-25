-- Create tables for Golf Charity Subscription Platform

-- Custom Types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'canceled', 'past_due');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE draw_status AS ENUM ('pending', 'completed');
CREATE TYPE payout_status AS ENUM ('pending', 'verified', 'paid');

-- Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'user'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charities Table
CREATE TABLE public.charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Charity Selections (Pivot Table)
CREATE TABLE public.user_charity (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  charity_id UUID REFERENCES public.charities(id) ON DELETE CASCADE,
  contribution_percentage INT DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, charity_id)
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status DEFAULT 'inactive'::subscription_status,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores Table
CREATE TABLE public.scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 45),
  played_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws Table
CREATE TABLE public.draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date TIMESTAMPTZ NOT NULL,
  result_numbers INT[] CHECK (array_length(result_numbers, 1) = 5),
  status draw_status DEFAULT 'pending'::draw_status,
  total_prize_pool NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Winners Table
CREATE TABLE public.winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  match_count INT NOT NULL CHECK (match_count >= 3 AND match_count <= 5),
  prize_amount NUMERIC(10, 2) NOT NULL,
  proof_url TEXT,
  status payout_status DEFAULT 'pending'::payout_status,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create a public.user when auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to maintain only top 5 latest scores per user
CREATE OR REPLACE FUNCTION public.enforce_score_limit()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_at DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_score_inserted
  AFTER INSERT ON public.scores
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_score_limit();

-- ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_charity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Admins can view all (Needs service_role or admin user check, simplified here)
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Charities RLS
CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT USING (true);
CREATE POLICY "Admins can insert charities" ON public.charities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update charities" ON public.charities FOR UPDATE USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- User Charity RLS
CREATE POLICY "Users can view their own charity picks" ON public.user_charity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own charity picks" ON public.user_charity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own charity picks" ON public.user_charity FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions RLS
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores RLS
CREATE POLICY "Users can view their own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Draws RLS
CREATE POLICY "Anyone can view completed draws" ON public.draws FOR SELECT USING (status = 'completed');
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Winners RLS
CREATE POLICY "Users can view their own wins" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wins to upload proof" ON public.winners FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (status = 'pending');
CREATE POLICY "Admins can manage winners" ON public.winners FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Seed data for charities
INSERT INTO public.charities (name, description, image_url, website_url) VALUES
('Global Golf Foundation', 'Supporting youth golf programs.', 'https://images.unsplash.com/photo-1593111774240-d529f12cb416', 'https://example.com'),
('Green Keepers', 'Environmental conservation for golf courses.', 'https://images.unsplash.com/photo-1587174486073-ae5e1c4e33bf', 'https://example.com'),
('Fairway to Health', 'Funding medical research through golf.', 'https://images.unsplash.com/photo-1535139262971-c51845709a48', 'https://example.com');
