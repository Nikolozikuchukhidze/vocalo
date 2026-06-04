-- Add username column with regex validation and unique constraint
ALTER TABLE public.profiles
  ADD COLUMN username text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$');

CREATE UNIQUE INDEX profiles_username_lower_idx ON public.profiles (lower(username));

-- Update new-user handler to capture username from sign-up metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NULLIF(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$;

-- Allow anyone (including pre-auth) to resolve username -> email for sign-in
CREATE OR REPLACE FUNCTION public.get_email_for_username(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_email_for_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_for_username(text) TO anon, authenticated;