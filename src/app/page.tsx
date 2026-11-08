import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import Link from "next/link";
import {
  AudioLines,
  Compass,
  Disc3,
  Headphones,
  Heart,
  Library,
  ListMusic,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Главная", icon: Compass, active: true },
  { label: "Поиск", icon: Search, active: false },
  { label: "Моя медиатека", icon: Library, active: false },
];

const collections = [
  {
    title: "Новые релизы",
    description: "Свежая музыка от артистов",
    icon: Disc3,
  },
  {
    title: "Моя музыка",
    description: "Избранное и плейлисты",
    icon: Heart,
  },
  {
    title: "Подборки",
    description: "Музыка под настроение",
    icon: ListMusic,
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name, role").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Uni Sound — главная">
          <span className="brand-mark">U</span>
          <span className="brand-name">uni<span>sound</span></span>
        </Link>

        <div className="sidebar-label">МЕНЮ</div>
        <nav className="navigation" aria-label="Основная навигация">
          {navigation.map(({ label, icon: Icon, active }) => (
            <a
              className={active ? "nav-link active" : "nav-link"}
              href="#"
              key={label}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="sidebar-label">ТВОЯ МУЗЫКА</div>
        <a className="nav-link" href="#">
          <Heart size={19} strokeWidth={1.8} />
          <span>Избранное</span>
        </a>
        <a className="nav-link" href="#">
          <ListMusic size={19} strokeWidth={1.8} />
          <span>Плейлисты</span>
        </a>

        <div className="sidebar-bottom">
          <div className="premium-card">
            <Sparkles size={18} />
            <strong>Uni Sound Premium</strong>
            <p>Твоя музыка без ограничений</p>
            <button type="button" disabled>Скоро</button>
          </div>
          <div className="sidebar-caption">Часть экосистемы Unicon Music</div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Музыкальная платформа <span>/</span> Главная</div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Поиск">
              <Search size={18} />
            </button>
            {user ? (
              <>
                {profile?.role === "admin" && <Link className="login-button" href="/admin">Админ-панель</Link>}
                <form action={signOut}>
                  <button className="login-button" type="submit">{profile?.display_name || "Выйти"}</button>
                </form>
              </>
            ) : (
              <>
                <Link className="icon-button" href="/register" aria-label="Создать аккаунт"><Sparkles size={17} /></Link>
                <Link className="login-button" href="/login">Войти</Link>
              </>
            )}
          </div>
        </header>

        <div className="content">
          <section className="hero">
            <div className="hero-glow" />
            <div className="hero-copy">
              <div className="eyebrow"><AudioLines size={15} /> ЗВУК ТВОЕГО МИРА</div>
              <h1>Музыка, которая<br /><span>чувствует тебя.</span></h1>
              <p>
                Открывай новые релизы, находи любимых артистов
                и собирай собственную музыкальную вселенную.
              </p>
              <div className="hero-note">
                <Headphones size={16} />
                <span>Uni Sound · проект Unicon Music</span>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <div className="art-disc"><span>U</span></div>
              <div className="art-equalizer"><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">ТВОЁ ПРОСТРАНСТВО</div>
                <h2>Начни с музыки</h2>
              </div>
              <span className="section-index">01 / DISCOVER</span>
            </div>
            <div className="collection-grid">
              {collections.map(({ title, description, icon: Icon }, index) => (
                <article className="collection-card" key={title}>
                  <div className="collection-icon"><Icon size={21} /></div>
                  <div className="collection-number">0{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="catalog-empty">
            <div className="empty-icon"><Disc3 size={25} /></div>
            <div>
              <div className="eyebrow muted">МУЗЫКАЛЬНЫЙ КАТАЛОГ</div>
              <h2>Здесь скоро зазвучит музыка</h2>
              <p>
                Каталог подключим к Supabase. После настройки базы
                администратор сможет добавлять релизы и треки.
              </p>
            </div>
            <div className="catalog-status"><span /> База данных подключается</div>
          </section>

          <footer className="footer">
            <span>© {new Date().getFullYear()} Uni Sound</span>
            <span><ShieldCheck size={14} /> Создано в экосистеме Unicon Music</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
