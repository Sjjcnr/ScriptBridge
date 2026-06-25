-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('writer', 'client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Writer-specific details
CREATE TABLE public.writer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specializations TEXT[],
  handwriting_sample_urls TEXT[],
  charge_per_page NUMERIC(10,2) DEFAULT 0,
  writing_styles TEXT[],
  languages TEXT[],
  turnaround_time TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT true, -- As per user request, anyone who signs up is verified
  is_available BOOLEAN DEFAULT true,
  contact_email TEXT,
  contact_phone TEXT,
  show_contact_info BOOLEAN DEFAULT false,
  portfolio_description TEXT
);

-- User Roles (for Auth Hook)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('writer', 'client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  writer_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested', 'accepted', 'declined', 'cancelled', 'meetup_scheduled',
    'material_handed_over', 'in_progress', 'completion_notified',
    'return_meetup_scheduled', 'completed'
  )),
  instructions TEXT,
  reference_file_urls TEXT[],
  page_count INTEGER,
  estimated_total NUMERIC(10,2),
  special_instructions TEXT,
  ink_color TEXT,
  handwriting_style TEXT,
  deadline TIMESTAMPTZ,
  collection_location TEXT, -- Free text as per user request
  collection_time TIMESTAMPTZ,
  return_location TEXT, -- Free text
  return_time TIMESTAMPTZ,
  client_handoff_confirmed BOOLEAN DEFAULT false,
  writer_handoff_confirmed BOOLEAN DEFAULT false,
  client_return_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (linked to orders)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  reviewer_id UUID REFERENCES public.profiles(id),
  writer_id UUID REFERENCES public.profiles(id),
  handwriting_quality INTEGER CHECK (handwriting_quality >= 1 AND handwriting_quality <= 5),
  accuracy INTEGER CHECK (accuracy >= 1 AND accuracy <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  material_care INTEGER CHECK (material_care >= 1 AND material_care <= 5),
  overall_rating NUMERIC(3,2),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  writer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, writer_id)
);

-- Essential Indexes
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_orders_client ON public.orders(client_id);
CREATE INDEX idx_orders_writer ON public.orders(writer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_reviews_writer ON public.reviews(writer_id);
CREATE INDEX idx_favorites_client ON public.favorites(client_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- TRIGGERS & FUNCTIONS

-- 1. Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  assigned_role TEXT;
BEGIN
  -- Check if the user is the hardcoded admin
  IF NEW.email = 'mauryauday@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    assigned_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  -- If role is writer, also create a row in writer_profiles
  IF assigned_role = 'writer' THEN
    INSERT INTO public.writer_profiles (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Custom Access Token Hook to inject role into JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF jsonb_typeof(claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}');
  END IF;

  claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon;

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Writer Profiles
ALTER TABLE public.writer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Writer profiles are viewable by all" ON public.writer_profiles FOR SELECT USING (true);
CREATE POLICY "Writers can update own profile" ON public.writer_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own orders" ON public.orders FOR SELECT TO authenticated USING (client_id = auth.uid() OR writer_id = auth.uid());
CREATE POLICY "Clients can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() AND (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'client');
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE TO authenticated USING (client_id = auth.uid() OR writer_id = auth.uid());

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT TO authenticated USING (
  id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

-- Conversation Participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view themselves" ON public.conversation_participants FOR SELECT TO authenticated USING (user_id = auth.uid() OR conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can add participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (true);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING (
  conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can write reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid() AND (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'client');

-- Favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own favorites" ON public.favorites FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Clients can add favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients can remove favorites" ON public.favorites FOR DELETE TO authenticated USING (client_id = auth.uid());
