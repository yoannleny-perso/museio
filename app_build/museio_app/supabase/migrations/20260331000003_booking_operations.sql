alter table public.booking_requests
  add column if not exists client_id uuid,
  add column if not exists job_draft_id uuid,
  add column if not exists converted_to_job_at timestamptz;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  primary_email text not null,
  primary_email_normalized text not null,
  source_booking_request_id uuid references public.booking_requests(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists clients_creator_email_unique_idx
  on public.clients (creator_user_id, primary_email_normalized);

create index if not exists clients_creator_created_idx
  on public.clients (creator_user_id, created_at desc);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  source_booking_request_id uuid not null unique references public.booking_requests(id) on delete restrict,
  portfolio_id uuid not null references public.portfolio_settings(id) on delete restrict,
  title text not null,
  event_type text not null,
  status text not null default 'draft' check (status in ('draft', 'quote-prep', 'quoted', 'confirmed', 'completed', 'cancelled', 'archived')),
  requester_name_snapshot text not null,
  requester_email_snapshot text not null,
  event_notes text not null default '',
  service_package_notes text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists jobs_creator_status_idx
  on public.jobs (creator_user_id, status, created_at desc);

create index if not exists jobs_client_idx
  on public.jobs (client_id, created_at desc);

create table if not exists public.job_requested_slots (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint job_requested_slots_valid_range check (ends_at > starts_at)
);

create index if not exists job_requested_slots_job_idx
  on public.job_requested_slots (job_id, starts_at);

create table if not exists public.booking_internal_notes (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists booking_internal_notes_request_idx
  on public.booking_internal_notes (booking_request_id, created_at desc);

create table if not exists public.booking_activity_events (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('submitted', 'status-changed', 'internal-note-added', 'client-linked', 'job-draft-created')),
  summary text not null,
  from_status text check (from_status in ('submitted', 'under-review', 'accepted', 'declined', 'archived')),
  to_status text check (to_status in ('submitted', 'under-review', 'accepted', 'declined', 'archived')),
  client_id uuid references public.clients(id) on delete set null,
  job_draft_id uuid references public.jobs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists booking_activity_events_request_idx
  on public.booking_activity_events (booking_request_id, created_at desc);

create table if not exists public.quote_drafts (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null unique references public.jobs(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'ready-for-review', 'sent', 'accepted')),
  currency_code text not null default 'AUD',
  subtotal_minor integer not null default 0 check (subtotal_minor >= 0),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  total_minor integer not null default 0 check (total_minor >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists quote_drafts_creator_idx
  on public.quote_drafts (creator_user_id, created_at desc);

create table if not exists public.quote_line_items (
  id uuid primary key default gen_random_uuid(),
  quote_draft_id uuid not null references public.quote_drafts(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  description text not null default '',
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_amount_minor integer not null default 0 check (unit_amount_minor >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists quote_line_items_quote_idx
  on public.quote_line_items (quote_draft_id, sort_order);

alter table public.booking_requests
  add constraint booking_requests_client_fk
  foreign key (client_id) references public.clients(id) on delete set null;

alter table public.booking_requests
  add constraint booking_requests_job_draft_fk
  foreign key (job_draft_id) references public.jobs(id) on delete set null;

drop trigger if exists touch_clients_updated_at on public.clients;
create trigger touch_clients_updated_at
before update on public.clients
for each row execute function public.touch_updated_at();

drop trigger if exists touch_jobs_updated_at on public.jobs;
create trigger touch_jobs_updated_at
before update on public.jobs
for each row execute function public.touch_updated_at();

drop trigger if exists touch_job_requested_slots_updated_at on public.job_requested_slots;
create trigger touch_job_requested_slots_updated_at
before update on public.job_requested_slots
for each row execute function public.touch_updated_at();

drop trigger if exists touch_quote_drafts_updated_at on public.quote_drafts;
create trigger touch_quote_drafts_updated_at
before update on public.quote_drafts
for each row execute function public.touch_updated_at();

drop trigger if exists touch_quote_line_items_updated_at on public.quote_line_items;
create trigger touch_quote_line_items_updated_at
before update on public.quote_line_items
for each row execute function public.touch_updated_at();

alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.job_requested_slots enable row level security;
alter table public.booking_internal_notes enable row level security;
alter table public.booking_activity_events enable row level security;
alter table public.quote_drafts enable row level security;
alter table public.quote_line_items enable row level security;

drop policy if exists "clients_creator_owner_all" on public.clients;
create policy "clients_creator_owner_all"
on public.clients
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "jobs_creator_owner_all" on public.jobs;
create policy "jobs_creator_owner_all"
on public.jobs
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "job_requested_slots_creator_owner_all" on public.job_requested_slots;
create policy "job_requested_slots_creator_owner_all"
on public.job_requested_slots
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "booking_internal_notes_creator_owner_all" on public.booking_internal_notes;
create policy "booking_internal_notes_creator_owner_all"
on public.booking_internal_notes
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "booking_activity_events_creator_owner_all" on public.booking_activity_events;
create policy "booking_activity_events_creator_owner_all"
on public.booking_activity_events
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "quote_drafts_creator_owner_all" on public.quote_drafts;
create policy "quote_drafts_creator_owner_all"
on public.quote_drafts
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "quote_line_items_creator_owner_all" on public.quote_line_items;
create policy "quote_line_items_creator_owner_all"
on public.quote_line_items
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());
