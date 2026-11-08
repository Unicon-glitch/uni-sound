import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">U</span>
          <span className="brand-name">uni<span>sound</span></span>
        </Link>
        <div className="eyebrow muted">ВОССТАНОВЛЕНИЕ ДОСТУПА</div>
        <h1>Забыли пароль?</h1>
        <p className="auth-description">Укажи почту аккаунта. Мы отправим ссылку для создания нового пароля.</p>
        {params.error && <div className="form-message error">Укажи адрес электронной почты.</div>}
        <form action={requestPasswordReset} className="auth-form">
          <label htmlFor="email">Электронная почта</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          <button className="primary-button" type="submit">Отправить ссылку</button>
        </form>
        <p className="auth-switch"><Link href="/login">← Вернуться ко входу</Link></p>
      </section>
    </main>
  );
}
