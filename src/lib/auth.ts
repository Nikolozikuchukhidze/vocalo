import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + "/sign-in",
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const result = await lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin,
  });
  if (result.error) throw result.error;
  return result;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
