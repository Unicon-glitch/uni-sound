import Link from "next/link";
import { signUp } from "@/lib/auth/actions";

const errors: Record<string, string> = {
  "invalid-email": "Проверь адрес электронной почты.",
  "weak-password": "Пароль должен содержать не менее 10 символов.",
  "invalid-name": "Имя должно содержать от 2 до 40 символов.",
  "signup-failed": "Не удалось создать аккаунт. Возможно, адрес уже зарегистрирован.",
};

export default async function RegisterPage({
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

        <div className="eyebrow muted">ТВОЯ МУЗЫКА НАЧИНАЕТСЯ ЗДЕСЬ</div>
        <h1>Создать аккаунт</h1>
        <p className="auth-description">Присоединяйся к музыкальному пространству Unicon Music.</p>

        {params.error && (
          <div className="form-message error" role="alert">
            {errors[params.error] ?? "Проверь данные и попробуй ещё раз."}
          </div>
        )}

        <form action={signUp} className="auth-form">
          <label htmlFor="displayName">Как тебя называть?</label>
          <input id="displayName" name="displayName" type="text" minLength={2} maxLength={40} autoComplete="nickname" placeholder="Твоё имя" required />
          <label htmlFor="email">Электронная почта</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
          <label htmlFor="password">Пароль</label>
          <input id="password" name="password" type="password" minLength={10} autoComplete="new-password" placeholder="Минимум 10 символов" required />
          <p className="field-hint">После регистрации мы отправим письмо для подтверждения адреса.</p>
          <button className="primary-button" type="submit">Зарегистрироваться</button>
        </form>

        <p className="auth-switch">Уже есть аккаунт? <Link href="/login">Войти</Link></p>
        <Link className="back-link" href="/">← Вернуться на главную</Link>
      </section>
    </main>
  );
}
