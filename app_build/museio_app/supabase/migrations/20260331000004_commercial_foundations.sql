alter table public.quote_drafts
  add column if not exists title text not null default 'Quote',
  add column if not exists message text not null default '',
  add column if not exists public_token_hash text,
  add column if not exists public_token_expires_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists responded_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists declined_at timestamptz;

alter table public.quote_drafts
  drop constraint if exists quote_drafts_status_check;

alter table public.quote_drafts
  add constraint quote_drafts_status_check
  check (status in ('draft', 'ready-to-send', 'sent', 'accepted', 'declined'));

alter table public.quote_line_items
  add column if not exists tax_rate_basis_points integer not null default 0,
  add column if not exists line_subtotal_minor integer not null default 0,
  add column if not exists line_tax_minor integer not null default 0,
  add column if not exists line_total_minor integer not null default 0;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null unique references public.jobs(id) on delete cascade,
  quote_id uuid references public.quote_drafts(id) on delete set null,
  invoice_number text not null,
  title text not null,
  message text not null default '',
  status text not null default 'draft' check (status in ('draft', 'sent', 'viewed', 'deposit-requested', 'deposit-paid', 'balance-due', 'paid', 'declined', 'void')),
  currency_code text not null default 'AUD',
  subtotal_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null default 0,
  amount_paid_minor integer not null default 0,
  amount_due_minor integer not null default 0,
  payment_terms_days integer not null default 7,
  due_date timestamptz,
  issue_at timestamptz,
  sent_at timestamptz,
  collection_mode text not null default 'full-payment' check (collection_mode in ('full-payment', 'deposit-and-balance')),
  deposit_type text check (deposit_type in ('fixed', 'percentage')),
  deposit_value numeric(12,2),
  deposit_amount_minor integer not null default 0,
  balance_amount_minor integer not null default 0,
  public_token_hash text,
  public_token_expires_at timestamptz,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists invoices_invoice_number_unique_idx
  on public.invoices (creator_user_id, invoice_number);

create index if not exists invoices_creator_status_idx
  on public.invoices (creator_user_id, status, created_at desc);

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  description text not null default '',
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_amount_minor integer not null default 0 check (unit_amount_minor >= 0),
  tax_rate_basis_points integer not null default 0 check (tax_rate_basis_points between 0 and 10000),
  line_subtotal_minor integer not null default 0,
  line_tax_minor integer not null default 0,
  line_total_minor integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists invoice_line_items_invoice_idx
  on public.invoice_line_items (invoice_id, sort_order);

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  phase text not null check (phase in ('full', 'deposit', 'balance')),
  amount_minor integer not null default 0,
  currency_code text not null default 'AUD',
  status text not null default 'pending' check (status in ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially-refunded')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_event_id text,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists payment_records_invoice_idx
  on public.payment_records (invoice_id, created_at desc);

create index if not exists payment_records_creator_status_idx
  on public.payment_records (creator_user_id, status, created_at desc);

create table if not exists public.stripe_connected_accounts (
  creator_user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_account_id text,
  status text not null default 'not-connected' check (status in ('not-connected', 'requires-onboarding', 'ready')),
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  dashboard_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  creator_user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null,
  processed_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists touch_invoices_updated_at on public.invoices;
create trigger touch_invoices_updated_at
before update on public.invoices
for each row execute function public.touch_updated_at();

drop trigger if exists touch_invoice_line_items_updated_at on public.invoice_line_items;
create trigger touch_invoice_line_items_updated_at
before update on public.invoice_line_items
for each row execute function public.touch_updated_at();

drop trigger if exists touch_payment_records_updated_at on public.payment_records;
create trigger touch_payment_records_updated_at
before update on public.payment_records
for each row execute function public.touch_updated_at();

drop trigger if exists touch_stripe_connected_accounts_updated_at on public.stripe_connected_accounts;
create trigger touch_stripe_connected_accounts_updated_at
before update on public.stripe_connected_accounts
for each row execute function public.touch_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payment_records enable row level security;
alter table public.stripe_connected_accounts enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists "invoices_creator_owner_all" on public.invoices;
create policy "invoices_creator_owner_all"
on public.invoices
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "invoice_line_items_creator_owner_all" on public.invoice_line_items;
create policy "invoice_line_items_creator_owner_all"
on public.invoice_line_items
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "payment_records_creator_owner_all" on public.payment_records;
create policy "payment_records_creator_owner_all"
on public.payment_records
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "stripe_connected_accounts_creator_owner_all" on public.stripe_connected_accounts;
create policy "stripe_connected_accounts_creator_owner_all"
on public.stripe_connected_accounts
for all
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "stripe_webhook_events_creator_owner_select" on public.stripe_webhook_events;
create policy "stripe_webhook_events_creator_owner_select"
on public.stripe_webhook_events
for select
to authenticated
using (creator_user_id = auth.uid());
