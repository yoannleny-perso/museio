create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.portfolio_settings (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  handle text,
  artist_name text not null default '',
  portrait_storage_path text,
  short_bio text not null default '',
  full_bio text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  theme_id text not null default 'muse-light' check (
    theme_id in (
      'muse-light',
      'midnight-stage',
      'editorial-mono',
      'electric-club',
      'sunset-luxe'
    )
  ),
  section_order jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  book_me_content jsonb not null default '{"heading":"Book Me","description":"A premium booking flow will connect here next.","primaryLabel":"Start Booking Request","secondaryLabel":"Booking coming soon"}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint portfolio_settings_handle_format check (
    handle is null
    or handle = ''
    or (
      handle = lower(handle)
      and handle ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
  )
);

create unique index if not exists portfolio_settings_owner_unique_idx
  on public.portfolio_settings (owner_user_id);

create unique index if not exists portfolio_settings_handle_unique_idx
  on public.portfolio_settings (handle)
  where handle is not null and handle <> '';

create index if not exists portfolio_settings_visibility_idx
  on public.portfolio_settings (visibility);

create table if not exists public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_photos_portfolio_sort_idx
  on public.portfolio_photos (portfolio_id, sort_order, created_at);

create table if not exists public.portfolio_videos (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  embed_url text not null,
  thumbnail_url text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_videos_portfolio_sort_idx
  on public.portfolio_videos (portfolio_id, sort_order, created_at);

create table if not exists public.portfolio_music_releases (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subtitle text,
  cover_storage_path text,
  links jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_music_releases_portfolio_sort_idx
  on public.portfolio_music_releases (portfolio_id, sort_order, created_at);

create table if not exists public.portfolio_events (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  event_date timestamptz not null,
  location text not null,
  ticket_url text,
  image_storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_events_portfolio_sort_idx
  on public.portfolio_events (portfolio_id, sort_order, created_at);

create table if not exists public.portfolio_featured_cards (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  cta_label text not null,
  cta_url text not null,
  image_storage_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists portfolio_featured_cards_portfolio_sort_idx
  on public.portfolio_featured_cards (portfolio_id, sort_order, created_at);

drop trigger if exists touch_portfolio_settings_updated_at on public.portfolio_settings;
create trigger touch_portfolio_settings_updated_at
before update on public.portfolio_settings
for each row execute function public.touch_updated_at();

drop trigger if exists touch_portfolio_photos_updated_at on public.portfolio_photos;
create trigger touch_portfolio_photos_updated_at
before update on public.portfolio_photos
for each row execute function public.touch_updated_at();

drop trigger if exists touch_portfolio_videos_updated_at on public.portfolio_videos;
create trigger touch_portfolio_videos_updated_at
before update on public.portfolio_videos
for each row execute function public.touch_updated_at();

drop trigger if exists touch_portfolio_music_releases_updated_at on public.portfolio_music_releases;
create trigger touch_portfolio_music_releases_updated_at
before update on public.portfolio_music_releases
for each row execute function public.touch_updated_at();

drop trigger if exists touch_portfolio_events_updated_at on public.portfolio_events;
create trigger touch_portfolio_events_updated_at
before update on public.portfolio_events
for each row execute function public.touch_updated_at();

drop trigger if exists touch_portfolio_featured_cards_updated_at on public.portfolio_featured_cards;
create trigger touch_portfolio_featured_cards_updated_at
before update on public.portfolio_featured_cards
for each row execute function public.touch_updated_at();

alter table public.portfolio_settings enable row level security;
alter table public.portfolio_photos enable row level security;
alter table public.portfolio_videos enable row level security;
alter table public.portfolio_music_releases enable row level security;
alter table public.portfolio_events enable row level security;
alter table public.portfolio_featured_cards enable row level security;

create policy "portfolio_settings_owner_all"
on public.portfolio_settings
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_settings_public_read"
on public.portfolio_settings
for select
to anon, authenticated
using (
  visibility = 'public'
  and handle is not null
  and handle <> ''
);

create policy "portfolio_photos_owner_all"
on public.portfolio_photos
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_photos_public_read"
on public.portfolio_photos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.portfolio_settings ps
    where ps.id = portfolio_photos.portfolio_id
      and ps.visibility = 'public'
      and ps.handle is not null
      and ps.handle <> ''
  )
);

create policy "portfolio_videos_owner_all"
on public.portfolio_videos
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_videos_public_read"
on public.portfolio_videos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.portfolio_settings ps
    where ps.id = portfolio_videos.portfolio_id
      and ps.visibility = 'public'
      and ps.handle is not null
      and ps.handle <> ''
  )
);

create policy "portfolio_music_releases_owner_all"
on public.portfolio_music_releases
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_music_releases_public_read"
on public.portfolio_music_releases
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.portfolio_settings ps
    where ps.id = portfolio_music_releases.portfolio_id
      and ps.visibility = 'public'
      and ps.handle is not null
      and ps.handle <> ''
  )
);

create policy "portfolio_events_owner_all"
on public.portfolio_events
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_events_public_read"
on public.portfolio_events
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.portfolio_settings ps
    where ps.id = portfolio_events.portfolio_id
      and ps.visibility = 'public'
      and ps.handle is not null
      and ps.handle <> ''
  )
);

create policy "portfolio_featured_cards_owner_all"
on public.portfolio_featured_cards
for all
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "portfolio_featured_cards_public_read"
on public.portfolio_featured_cards
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.portfolio_settings ps
    where ps.id = portfolio_featured_cards.portfolio_id
      and ps.visibility = 'public'
      and ps.handle is not null
      and ps.handle <> ''
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "portfolio_media_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "portfolio_media_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "portfolio_media_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "portfolio_media_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
