import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function resolveLoginToEmail(identifier: string): Promise<string> {
  const value = identifier.trim();
  if (EMAIL_REGEX.test(value)) return value;
  if (!USERNAME_REGEX.test(value)) {
    throw new Error("Enter a valid email or username (3–20 letters, numbers, or underscores).");
  }
  const { data, error } = await supabase.rpc("get_email_for_username", { p_username: value });
  if (error) throw error;
  if (!data) throw new Error("No account found for that username.");
  return data as string;
}

export async function signInWithEmailOrUsername(identifier: string, password: string) {
  const email = await resolveLoginToEmail(identifier);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailOrUsername(email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string,
) {
  const cleanUsername = username?.trim();
  if (cleanUsername && !USERNAME_REGEX.test(cleanUsername)) {
    throw new Error("Username must be 3–20 letters, numbers, or underscores.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin + "/sign-in",
      data: cleanUsername
        ? { display_name: cleanUsername, name: cleanUsername, username: cleanUsername }
        : undefined,
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
