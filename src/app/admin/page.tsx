import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, email, role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="brand" href="/">
          <span className="brand-mark">U</span>
          <span className="brand-name">uni<span>sound</span></span>
        </Link>
        <form action={signOut}>
          <button className="quiet-button" type="submit">Выйти</button>
        </form>
      </header>

      <section className="admin-content">
        <div className="eyebrow"><ShieldCheck size={15} /> ЗАЩИЩЁННАЯ ЗОНА</div>
        <h1>Панель администратора</h1>
        <p className="auth-description">Добро пожаловать, {profile.display_name || profile.email}.</p>

        <div className="admin-status">
          <span className="status-dot" />
          Администратор подтверждён сервером
        </div>

        <div className="admin-grid">
          <article className="admin-card">
            <span>01</span>
            <h2>Каталог</h2>
            <p>Управление артистами, релизами и треками появится в следующем модуле.</p>
          </article>
          <article className="admin-card">
            <span>02</span>
            <h2>Пользователи</h2>
            <p>Управление аккаунтами и ролями будет добавлено после аудита прав доступа.</p>
          </article>
          <article className="admin-card">
            <span>03</span>
            <h2>Платформа</h2>
            <p>Настройки сервиса и Premium будут подключены отдельными защищёнными действиями.</p>
          </article>
        </div>
        <Link className="back-link" href="/">← На главную</Link>
      </section>
    </main>
  );
}
