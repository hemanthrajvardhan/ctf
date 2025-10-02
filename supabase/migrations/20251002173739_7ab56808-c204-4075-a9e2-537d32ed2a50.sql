-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for challenge categories
CREATE TYPE public.challenge_category AS ENUM ('cryptography', 'cyber_security', 'programming', 'quiz', 'forensics', 'web', 'reverse_engineering', 'misc');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  story TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL DEFAULT 100,
  flag_hash TEXT NOT NULL,
  visible_from TIMESTAMP WITH TIME ZONE,
  visible_to TIMESTAMP WITH TIME ZONE,
  category challenge_category NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solves table
CREATE TABLE public.solves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  solved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_awarded INTEGER NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  submission_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

-- Create rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  challenge_ids UUID[] DEFAULT '{}'::UUID[]
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Anyone can view roles"
ON public.user_roles FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Challenges policies
CREATE POLICY "Users can view visible challenges"
ON public.challenges FOR SELECT
USING (
  (visible_from IS NULL OR visible_from <= NOW()) AND
  (visible_to IS NULL OR visible_to >= NOW())
);

CREATE POLICY "Admins can view all challenges"
ON public.challenges FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update challenges"
ON public.challenges FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete challenges"
ON public.challenges FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Solves policies
CREATE POLICY "Users can view all solves"
ON public.solves FOR SELECT
USING (true);

CREATE POLICY "Users can create their own solves"
ON public.solves FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
ON public.submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
ON public.submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own submissions"
ON public.submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Rounds policies
CREATE POLICY "Users can view all rounds"
ON public.rounds FOR SELECT
USING (true);

CREATE POLICY "Admins can manage rounds"
ON public.rounds FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );
  
  -- Add default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_challenges_category ON public.challenges(category);
CREATE INDEX idx_challenges_visible ON public.challenges(visible_from, visible_to);
CREATE INDEX idx_solves_user ON public.solves(user_id);
CREATE INDEX idx_solves_challenge ON public.solves(challenge_id);
CREATE INDEX idx_submissions_user ON public.submissions(user_id);
CREATE INDEX idx_submissions_challenge ON public.submissions(challenge_id);