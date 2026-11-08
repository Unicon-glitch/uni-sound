import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ purpose?: string }>;
}) {
  const params = await searchParams;
  const recovery = params.purpose === "recovery";

  return (
    <main className="auth-page">
      <section className="auth-card confirmation-card">
        <div className="confirmation-icon">✉</div>
        <div className="eyebrow muted">UNI SOUND · ПОЧТА</div>
        <h1>{recovery ? "Проверь почту" : "Остался один шаг"}</h1>
        <p className="auth-description">
          {recovery
            ? "Если аккаунт с таким адресом существует, мы отправили ссылку для восстановления пароля."
            : "Мы отправили письмо со ссылкой для подтверждения адреса. Перейди по ней, чтобы активировать аккаунт."}
        </p>
        <Link className="primary-button button-link" href="/login">Перейти ко входу</Link>
      </section>
    </main>
  );
}
