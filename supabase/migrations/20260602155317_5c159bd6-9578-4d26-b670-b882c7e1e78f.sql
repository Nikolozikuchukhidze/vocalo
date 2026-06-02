REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;