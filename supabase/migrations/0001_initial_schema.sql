-- Uni Sound: initial database schema
-- Apply in Supabase SQL Editor or with Supabase CLI.
-- Security model: public catalog reads only published content;
-- users can manage only their own profile, favorites and playlists.

create extension if not exists pgcrypto;

create type public.account_role as enum ('user', 'admin');
create type public.release_status as enum ('draft', 'pending', 'published', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  avatar_url text,
  role public.account_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  image_path text,
  created_at timestamptz not null default now()
);

create table public.releases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete restrict,
  title text not null,
  slug text not null unique,
  cover_path text,
  release_date date,
  status public.release_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete restrict,
  title text not null,
  track_number integer not null default 1 check (track_number > 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  audio_path text,
  is_explicit boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playlist_tracks (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, track_id)
);

create index releases_status_date_idx on public.releases(status, release_date desc);
create index tracks_release_number_idx on public.tracks(release_id, track_number);
create index playlist_tracks_order_idx on public.playlist_tracks(playlist_id, position);
create index playlists_user_idx on public.playlists(user_id, updated_at desc);

-- Create a regular profile on signup. Promote the verified owner account
-- to admin manually after its first signup (instructions at the end).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', ''),
    'user'::public.account_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SECURITY DEFINER avoids recursive RLS checks when policies need to test roles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'::public.account_role
  );
$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Users may edit their display name/avatar, but never their email or role.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  if not public.is_admin() then
    new.email := old.email;
    new.role := old.role;
  end if;
  return new;
end;
$;

create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger releases_updated_at
  before update on public.releases
  for each row execute procedure public.set_updated_at();

create trigger playlists_updated_at
  before update on public.playlists
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.releases enable row level security;
alter table public.tracks enable row level security;
alter table public.favorites enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;

create policy "Profiles: read own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Profiles: update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));

create policy "Artists: public read"
  on public.artists for select
  to anon, authenticated
  using (true);

create policy "Artists: admin manage"
  on public.artists for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Releases: public read published"
  on public.releases for select
  to anon, authenticated
  using (status = 'published' or exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  ));

create policy "Releases: admin manage"
  on public.releases for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Tracks: public read published releases"
  on public.tracks for select
  to anon, authenticated
  using (exists (
    select 1 from public.releases r
    where r.id = release_id and r.status = 'published'
  ) or exists (
    select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'
  ));

create policy "Tracks: admin manage"
  on public.tracks for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Favorites: owner access"
  on public.favorites for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Playlists: read public or own"
  on public.playlists for select
  to anon, authenticated
  using (is_public or user_id = (select auth.uid()));

create policy "Playlists: owner manage"
  on public.playlists for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Playlist tracks: read visible playlists"
  on public.playlist_tracks for select
  to anon, authenticated
  using (exists (
    select 1 from public.playlists p
    where p.id = playlist_id and (p.is_public or p.user_id = (select auth.uid()))
  ));

create policy "Playlist tracks: owner manage"
  on public.playlist_tracks for all
  to authenticated
  using (exists (
    select 1 from public.playlists p
    where p.id = playlist_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.playlists p
    where p.id = playlist_id and p.user_id = (select auth.uid())
  ));

grant usage on schema public to anon, authenticated;
grant select on public.artists, public.releases, public.tracks to anon, authenticated;
grant insert, update, delete on public.artists, public.releases, public.tracks to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.playlists to authenticated;
grant select, insert, delete on public.playlist_tracks to authenticated;


-- After signing up with unicon.music@mail.ru and confirming the email,
-- run this once in the Supabase SQL Editor to grant the owner admin access:
-- update public.profiles
-- set role = 'admin'
-- where lower(email) = 'unicon.music@mail.ru';
