import Link from "next/link";
import { signIn } from "@/lib/auth/actions";

const errors: Record<string, string> = {
  "missing-fields": "Заполни почту и пароль.",
  "invalid-credentials": "Неверная почта или пароль.",
  "confirmation-failed": "Не удалось подтвердить почту. Запроси новое письмо.",
  "session-expired": "Сессия восстановления истекла. Запроси новое письмо.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">U</span>
          <span className="brand-name">uni<span>sound</span></span>
        </Link>

        <div className="eyebrow muted">С РАДОСТЬЮ СНОВА ВСТРЕТИТЬСЯ</div>
        <h1>С возвращением</h1>
        <p className="auth-description">Войди в свой аккаунт и продолжай слушать любимую музыку.</p>

        {params.error && (
          <div className="form-message error" role="alert">
            {errors[params.error] ?? "Не удалось выполнить вход. Попробуй ещё раз."}
          </div>
        )}
        {params.message === "password-updated" && (
          <div className="form-message success">Пароль обновлён. Теперь можно войти.</div>
        )}

        <form action={signIn} className="auth-form">
          <label htmlFor="email">Электронная почта</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          <label htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Твой пароль" required />
          <div className="form-options">
            <span />
            <Link href="/forgot-password">Забыли пароль?</Link>
          </div>
          <button className="primary-button" type="submit">Войти в Uni Sound</button>
        </form>

        <p className="auth-switch">Впервые здесь? <Link href="/register">Создать аккаунт</Link></p>
        <Link className="back-link" href="/">← Вернуться на главную</Link>
      </section>
    </main>
  );
}
