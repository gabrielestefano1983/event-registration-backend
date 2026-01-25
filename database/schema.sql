-- Schema attuale del database (allineato con Supabase)

create table public.registrations (
  id bigserial not null,
  nome text not null,
  email text not null,
  telefono text not null,
  tipo_partecipante text not null,
  importo_pagato numeric(10, 2) null default 0.00,
  pagato boolean null default false,
  paypal_order_id text null,
  numero_ordine_gruppo bigint null,
  qr_token text not null,
  checked_in boolean null default false,
  checked_in_at timestamp with time zone null,
  email_inviata boolean null default false,
  note text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint registrations_pkey primary key (id),
  constraint registrations_qr_token_key unique (qr_token),
  constraint registrations_tipo_partecipante_check check (
    (
      tipo_partecipante = any (
        array['adulto'::text, 'ragazzo'::text, 'minore'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_registrations_qr_token on public.registrations using btree (qr_token) TABLESPACE pg_default;

create index IF not exists idx_registrations_email on public.registrations using btree (email) TABLESPACE pg_default;

create index IF not exists idx_registrations_paypal_order on public.registrations using btree (paypal_order_id) TABLESPACE pg_default;

create trigger update_registrations_updated_at BEFORE
update on registrations for EACH row
execute FUNCTION update_updated_at_column ();
