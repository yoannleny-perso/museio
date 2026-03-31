create table if not exists public.finance_tax_profiles (
  creator_user_id uuid primary key,
  country_code text not null default 'AU' check (country_code = 'AU'),
  currency_code text not null default 'AUD' check (char_length(currency_code) = 3),
  gst_registered boolean not null default false,
  gst_number text,
  gst_rate_basis_points integer not null default 1000 check (gst_rate_basis_points >= 0 and gst_rate_basis_points <= 10000),
  reporting_method text not null default 'cash' check (reporting_method in ('cash', 'accrual')),
  reserve_rate_basis_points integer not null default 0 check (reserve_rate_basis_points >= 0 and reserve_rate_basis_points <= 10000),
  ato_ready_checklist jsonb not null default jsonb_build_object(
    'businessProfile', false,
    'gstRegistration', false,
    'banking', false,
    'recordKeeping', false
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.finance_tax_profiles enable row level security;

drop trigger if exists touch_finance_tax_profiles_updated_at on public.finance_tax_profiles;
create trigger touch_finance_tax_profiles_updated_at
before update on public.finance_tax_profiles
for each row
execute function public.touch_updated_at();

drop policy if exists "finance_tax_profiles_creator_owner_all" on public.finance_tax_profiles;
create policy "finance_tax_profiles_creator_owner_all"
on public.finance_tax_profiles
for all
using (auth.uid() = creator_user_id)
with check (auth.uid() = creator_user_id);
