import Link from "next/link";
import { updatePassword } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session-expired");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">U</span>
          <span className="brand-name">uni<span>sound</span></span>
        </Link>
        <div className="eyebrow muted">НОВЫЙ ПАРОЛЬ</div>
        <h1>Обновить пароль</h1>
        <p className="auth-description">Придумай новый надёжный пароль для своего аккаунта.</p>
        {params.error && <div className="form-message error">Пароли не совпадают или не удалось обновить пароль.</div>}
        <form action={updatePassword} className="auth-form">
          <label htmlFor="password">Новый пароль</label>
          <input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required />
          <label htmlFor="confirmation">Повтори пароль</label>
          <input id="confirmation" name="confirmation" type="password" minLength={10} autoComplete="new-password" required />
          <button className="primary-button" type="submit">Сохранить пароль</button>
        </form>
      </section>
    </main>
  );
}
