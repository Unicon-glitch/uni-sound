"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getPassword(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function getOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const email = getText(formData, "email").toLowerCase();
  const password = getPassword(formData, "password");
  const displayName = getText(formData, "displayName");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/register?error=invalid-email");
  }

  if (password.length < 10) {
    redirect("/register?error=weak-password");
  }

  if (displayName.length < 2 || displayName.length > 40) {
    redirect("/register?error=invalid-name");
  }

  let signupError:
    | { code: string; status: number | null; message: string }
    | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${getOrigin()}/auth/callback?next=/`,
      },
    });

    if (error) {
      signupError = {
        code: "code" in error && typeof error.code === "string" ? error.code : "unknown",
        status: typeof error.status === "number" ? error.status : null,
        message: error.message,
      };
    }
  } catch (error) {
    signupError = {
      code: "server-configuration-error",
      status: null,
      message: error instanceof Error ? error.message : "Unknown server error",
    };
  }

  if (signupError) {
    console.error("[Uni Sound] Supabase sign-up failed:", signupError);

    const knownErrors: Record<string, string> = {
      user_already_exists: "email-exists",
      email_exists: "email-exists",
      email_address_invalid: "invalid-email",
      weak_password: "weak-password",
      signup_disabled: "signup-disabled",
      email_provider_disabled: "email-disabled",
      over_email_send_rate_limit: "email-rate-limit",
      over_request_rate_limit: "rate-limit",
    };

    const errorType = knownErrors[signupError.code] ?? "signup-failed";
    const detail = encodeURIComponent(
      `${signupError.code} | HTTP ${signupError.status ?? "—"} | ${signupError.message}`.slice(0, 240),
    );

    redirect(`/register?error=${errorType}&detail=${detail}`);
  }

  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const email = getText(formData, "email").toLowerCase();
  const password = getText(formData, "password");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = getText(formData, "email").toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=missing-email");
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getOrigin()}/auth/callback?next=/auth/reset-password`,
  });

  // Do not reveal whether an account with this email exists.
  redirect("/check-email?purpose=recovery");
}

export async function updatePassword(formData: FormData) {
  const password = getText(formData, "password");
  const confirmation = getPassword(formData, "confirmation");

  if (password.length < 10 || password !== confirmation) {
    redirect("/auth/reset-password?error=invalid-password");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session-expired");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/auth/reset-password?error=update-failed");
  }

  redirect("/login?message=password-updated");
}
