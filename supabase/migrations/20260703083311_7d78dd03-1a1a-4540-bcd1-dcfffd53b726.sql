
-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- employers
CREATE TABLE public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  perks_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.employers TO anon, authenticated;
GRANT ALL ON public.employers TO service_role;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read employers" ON public.employers FOR SELECT USING (true);
CREATE POLICY "Admins manage employers" ON public.employers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  employer TEXT NOT NULL,
  employer_slug TEXT,
  location TEXT,
  state TEXT,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  role_category TEXT,
  job_type TEXT,
  comp_min INT,
  comp_max INT,
  comp_notes TEXT,
  perks TEXT[] DEFAULT '{}',
  description TEXT,
  photo_url TEXT,
  apply_url TEXT,
  source TEXT,
  source_url TEXT,
  cool_score INT DEFAULT 75,
  cool_label TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_featured_weekly BOOLEAN DEFAULT false,
  weekly_rank INT,
  status TEXT NOT NULL DEFAULT 'pending',
  views INT NOT NULL DEFAULT 0,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT ON public.jobs TO anon, authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read live jobs" ON public.jobs FOR SELECT USING (status = 'live');
CREATE POLICY "Admins read all jobs" ON public.jobs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone submits pending jobs" ON public.jobs FOR INSERT
  WITH CHECK (status = 'pending');
CREATE POLICY "Admins update jobs" ON public.jobs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete jobs" ON public.jobs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_state ON public.jobs(state);
CREATE INDEX idx_jobs_role_category ON public.jobs(role_category);
CREATE INDEX idx_jobs_featured_weekly ON public.jobs(is_featured_weekly, weekly_rank);

-- subscribers
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  saved_search JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone subscribes" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- job_views
CREATE TABLE public.job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.job_views TO anon, authenticated;
GRANT SELECT ON public.job_views TO authenticated;
GRANT ALL ON public.job_views TO service_role;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone records view" ON public.job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read views" ON public.job_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-promote first signup to admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();
