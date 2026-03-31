create table if not exists public.creator_availability_rules (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at_minute integer not null check (starts_at_minute between 0 and 1439),
  ends_at_minute integer not null check (ends_at_minute between 1 and 1440),
  timezone text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_availability_rules_valid_range check (ends_at_minute > starts_at_minute)
);

create index if not exists creator_availability_rules_creator_idx
  on public.creator_availability_rules (creator_user_id, weekday, starts_at_minute);

create table if not exists public.creator_unavailability_blocks (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  source text not null check (source in ('manual', 'vacation')),
  title text not null,
  notes text,
  all_day boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_unavailability_blocks_valid_range check (ends_at > starts_at)
);

create index if not exists creator_unavailability_blocks_creator_idx
  on public.creator_unavailability_blocks (creator_user_id, starts_at, ends_at);

create table if not exists public.creator_external_calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google-calendar', 'calendly', 'manual-import')),
  external_calendar_id text,
  external_event_id text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  title text not null,
  all_day boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint creator_external_calendar_blocks_valid_range check (ends_at > starts_at)
);

create index if not exists creator_external_calendar_blocks_creator_idx
  on public.creator_external_calendar_blocks (creator_user_id, starts_at, ends_at);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolio_settings(id) on delete cascade,
  portfolio_handle_snapshot text not null,
  requester_name text not null,
  requester_email text not null,
  event_type text not null,
  event_notes text not null default '',
  service_package_notes text not null default '',
  status text not null default 'submitted' check (status in ('submitted', 'under-review', 'accepted', 'declined', 'archived')),
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists booking_requests_creator_status_idx
  on public.booking_requests (creator_user_id, status, submitted_at desc);

create index if not exists booking_requests_portfolio_idx
  on public.booking_requests (portfolio_id, submitted_at desc);

create table if not exists public.booking_request_slots (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint booking_request_slots_valid_range check (ends_at > starts_at)
);

create index if not exists booking_request_slots_creator_idx
  on public.booking_request_slots (creator_user_id, starts_at, ends_at);

create index if not exists booking_request_slots_request_idx
  on public.booking_request_slots (booking_request_id, starts_at);

drop trigger if exists touch_creator_availability_rules_updated_at on public.creator_availability_rules;
create trigger touch_creator_availability_rules_updated_at
before update on public.creator_availability_rules
for each row execute function public.touch_updated_at();

drop trigger if exists touch_creator_unavailability_blocks_updated_at on public.creator_unavailability_blocks;
create trigger touch_creator_unavailability_blocks_updated_at
before update on public.creator_unavailability_blocks
for each row execute function public.touch_updated_at();

drop trigger if exists touch_creator_external_calendar_blocks_updated_at on public.creator_external_calendar_blocks;
create trigger touch_creator_external_calendar_blocks_updated_at
before update on public.creator_external_calendar_blocks
for each row execute function public.touch_updated_at();

drop trigger if exists touch_booking_requests_updated_at on public.booking_requests;
create trigger touch_booking_requests_updated_at
before update on public.booking_requests
for each row execute function public.touch_updated_at();

drop trigger if exists touch_booking_request_slots_updated_at on public.booking_request_slots;
create trigger touch_booking_request_slots_updated_at
before update on public.booking_request_slots
for each row execute function public.touch_updated_at();

alter table public.creator_availability_rules enable row level security;
alter table public.creator_unavailability_blocks enable row level security;
alter table public.creator_external_calendar_blocks enable row level security;
alter table public.booking_requests enable row level security;
alter table public.booking_request_slots enable row level security;

drop policy if exists "creator_availability_rules_owner_all" on public.creator_availability_rules;
create policy "creator_availability_rules_owner_all"
on public.creator_availability_rules
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "creator_unavailability_blocks_owner_all" on public.creator_unavailability_blocks;
create policy "creator_unavailability_blocks_owner_all"
on public.creator_unavailability_blocks
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "creator_external_calendar_blocks_owner_all" on public.creator_external_calendar_blocks;
create policy "creator_external_calendar_blocks_owner_all"
on public.creator_external_calendar_blocks
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "booking_requests_creator_owner_all" on public.booking_requests;
create policy "booking_requests_creator_owner_all"
on public.booking_requests
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "booking_request_slots_creator_owner_all" on public.booking_request_slots;
create policy "booking_request_slots_creator_owner_all"
on public.booking_request_slots
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());
