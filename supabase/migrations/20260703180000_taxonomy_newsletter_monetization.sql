-- Taxonomy: remote flag, curated collection tags, experience level
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_level TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON public.jobs(is_remote) WHERE is_remote = true;
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON public.jobs USING GIN(tags);

-- Subscribers: attribution + dedupe (general newsletter list, not just saved searches)
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS source_page TEXT,
  ADD COLUMN IF NOT EXISTS confirmed BOOLEAN NOT NULL DEFAULT true;

-- Dedupe any existing duplicate emails before adding the unique index
DELETE FROM public.subscribers a
  USING public.subscribers b
  WHERE a.email = b.email AND a.created_at > b.created_at;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(lower(email));

-- Listing orders: employer upgrade requests (Featured / Featured+Newsletter). v1 = invoice manually.
CREATE TABLE IF NOT EXISTS public.listing_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('featured', 'featured_newsletter')),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employer_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | invoiced | paid | cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.listing_orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.listing_orders TO authenticated;
GRANT ALL ON public.listing_orders TO service_role;
ALTER TABLE public.listing_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone requests listing upgrade" ON public.listing_orders FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "Admins read orders" ON public.listing_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.listing_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sponsor leads: brands who want the site/newsletter sponsor slot
CREATE TABLE IF NOT EXISTS public.sponsor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  placement TEXT, -- site | newsletter | both
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.sponsor_leads TO anon, authenticated;
GRANT SELECT ON public.sponsor_leads TO authenticated;
GRANT ALL ON public.sponsor_leads TO service_role;
ALTER TABLE public.sponsor_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits sponsor lead" ON public.sponsor_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read sponsor leads" ON public.sponsor_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
