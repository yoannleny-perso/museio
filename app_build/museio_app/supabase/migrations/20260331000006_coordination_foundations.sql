alter table public.clients
  add column if not exists phone text,
  add column if not exists company_name text,
  add column if not exists status text not null default 'active' check (status in ('lead', 'active', 'vip', 'archived')),
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists notes text not null default '',
  add column if not exists last_contacted_at timestamptz;

create table if not exists public.client_timeline_events (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'booking-request-submitted',
      'job-created',
      'invoice-issued',
      'payment-recorded',
      'message-sent',
      'profile-updated'
    )
  ),
  summary text not null,
  linked_entity_type text check (linked_entity_type in ('booking-request', 'job', 'invoice', 'payment', 'thread')),
  linked_entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists client_timeline_events_client_idx
  on public.client_timeline_events (client_id, created_at desc);

create table if not exists public.conversation_threads (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'archived')),
  subject text not null,
  linked_entity_type text check (linked_entity_type in ('booking-request', 'job', 'invoice', 'client')),
  linked_entity_id uuid,
  last_message_preview text,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversation_threads_creator_activity_idx
  on public.conversation_threads (creator_user_id, coalesce(last_message_at, created_at) desc);

create index if not exists conversation_threads_client_idx
  on public.conversation_threads (client_id, created_at desc);

create table if not exists public.conversation_thread_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  participant_type text not null check (participant_type in ('creator', 'client', 'system')),
  user_id uuid references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  email_snapshot text,
  display_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists conversation_thread_participants_thread_idx
  on public.conversation_thread_participants (thread_id, created_at asc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  sender_type text not null check (sender_type in ('creator', 'client', 'system')),
  sender_user_id uuid references auth.users(id) on delete cascade,
  sender_client_id uuid references public.clients(id) on delete cascade,
  body text not null,
  client_visible boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists messages_thread_created_idx
  on public.messages (thread_id, created_at asc);

create table if not exists public.message_read_states (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.conversation_threads(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  participant_type text not null check (participant_type in ('creator', 'client', 'system')),
  participant_user_id uuid references auth.users(id) on delete cascade,
  participant_client_id uuid references public.clients(id) on delete cascade,
  last_read_message_id uuid references public.messages(id) on delete set null,
  last_read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists message_read_states_thread_creator_unique_idx
  on public.message_read_states (thread_id, participant_type, participant_user_id)
  where participant_user_id is not null;

create unique index if not exists message_read_states_thread_client_unique_idx
  on public.message_read_states (thread_id, participant_type, participant_client_id)
  where participant_client_id is not null;

create table if not exists public.external_calendar_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google-calendar', 'calendly', 'manual-import')),
  status text not null default 'connecting' check (status in ('not-connected', 'connecting', 'connected', 'sync-error', 'revoked')),
  account_label text not null,
  external_account_id text,
  scopes jsonb not null default '[]'::jsonb,
  sync_status text not null default 'idle' check (sync_status in ('idle', 'syncing', 'synced', 'error')),
  last_sync_at timestamptz,
  last_sync_error text,
  connected_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists external_calendar_accounts_creator_idx
  on public.external_calendar_accounts (creator_user_id, provider, created_at desc);

alter table public.creator_external_calendar_blocks
  add column if not exists external_account_id uuid references public.external_calendar_accounts(id) on delete set null,
  add column if not exists sync_status text not null default 'synced' check (sync_status in ('idle', 'syncing', 'synced', 'error')),
  add column if not exists source_metadata jsonb not null default '{}'::jsonb,
  add column if not exists imported_at timestamptz not null default timezone('utc', now());

create index if not exists creator_external_calendar_blocks_account_idx
  on public.creator_external_calendar_blocks (external_account_id, starts_at);

drop trigger if exists touch_conversation_threads_updated_at on public.conversation_threads;
create trigger touch_conversation_threads_updated_at
before update on public.conversation_threads
for each row execute function public.touch_updated_at();

drop trigger if exists touch_message_read_states_updated_at on public.message_read_states;
create trigger touch_message_read_states_updated_at
before update on public.message_read_states
for each row execute function public.touch_updated_at();

drop trigger if exists touch_external_calendar_accounts_updated_at on public.external_calendar_accounts;
create trigger touch_external_calendar_accounts_updated_at
before update on public.external_calendar_accounts
for each row execute function public.touch_updated_at();

alter table public.client_timeline_events enable row level security;
alter table public.conversation_threads enable row level security;
alter table public.conversation_thread_participants enable row level security;
alter table public.messages enable row level security;
alter table public.message_read_states enable row level security;
alter table public.external_calendar_accounts enable row level security;

drop policy if exists "client_timeline_events_owner_all" on public.client_timeline_events;
create policy "client_timeline_events_owner_all"
on public.client_timeline_events
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "conversation_threads_owner_all" on public.conversation_threads;
create policy "conversation_threads_owner_all"
on public.conversation_threads
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "conversation_thread_participants_owner_all" on public.conversation_thread_participants;
create policy "conversation_thread_participants_owner_all"
on public.conversation_thread_participants
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "messages_owner_all" on public.messages;
create policy "messages_owner_all"
on public.messages
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "message_read_states_owner_all" on public.message_read_states;
create policy "message_read_states_owner_all"
on public.message_read_states
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "external_calendar_accounts_owner_all" on public.external_calendar_accounts;
create policy "external_calendar_accounts_owner_all"
on public.external_calendar_accounts
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_rel rel
      join pg_class cls on cls.oid = rel.prrelid
      join pg_namespace ns on ns.oid = cls.relnamespace
      join pg_publication pub on pub.oid = rel.prpubid
      where pub.pubname = 'supabase_realtime'
        and ns.nspname = 'public'
        and cls.relname = 'conversation_threads'
    ) then
      execute 'alter publication supabase_realtime add table public.conversation_threads';
    end if;

    if not exists (
      select 1
      from pg_publication_rel rel
      join pg_class cls on cls.oid = rel.prrelid
      join pg_namespace ns on ns.oid = cls.relnamespace
      join pg_publication pub on pub.oid = rel.prpubid
      where pub.pubname = 'supabase_realtime'
        and ns.nspname = 'public'
        and cls.relname = 'messages'
    ) then
      execute 'alter publication supabase_realtime add table public.messages';
    end if;
  end if;
end $$;
