-- Read-only facade over LiteLLM's Prisma schema (`public`), Issue #48.
--
-- LiteLLM owns `public.*`; the portal must never touch those tables directly and
-- the `portal` database role gets no rights there. Everything the portal reads
-- about spend goes through these views, which are owned by `postgres` and run
-- with the owner's rights (PostgreSQL views are `security_invoker = false` by
-- default). A later swap of the data source (own table, FDW, another DB) is then
-- a change behind the repository module, not a change to the portal's SQL.
--
-- Apply (idempotent, from the repository root; the redirect keeps the file
-- readable for the postgres user, whose shell cannot enter `$HOME`):
--
--   sudo -u postgres psql -v ON_ERROR_STOP=1 -d litellm < app/db/litellm-views.sql
--
-- Re-run this file after a LiteLLM upgrade when the Prisma schema changed.
-- It is intentionally *not* a Drizzle migration: Drizzle owns `portal` only.

begin;

create schema if not exists litellm;
alter schema litellm owner to postgres;
revoke all on schema litellm from public;
grant usage on schema litellm to portal;

-- One row per proxy request (LiteLLM_SpendLogs). `user_id` is the portal's
-- `sam` (the gateway user is provisioned with `user_id = sam`), `api_key` is the
-- hashed key id (the same value as LiteLLM_VerificationToken.token).
create or replace view litellm.v_request_log as
select
  s.request_id,
  s."user" as user_id,
  s.api_key,
  s.model,
  s.model_group,
  s.custom_llm_provider,
  s.call_type,
  s.status,
  s.prompt_tokens,
  s.completion_tokens,
  s.total_tokens,
  s.spend,
  s.cache_hit,
  s."startTime" as start_time,
  s."endTime" as end_time,
  s.created_at
from public."LiteLLM_SpendLogs" s;

comment on view litellm.v_request_log is
  'LiteLLM_SpendLogs, read-only. start_time/end_time are UTC wall-clock timestamps.';

-- Daily aggregates per user/key/model (LiteLLM_DailyUserSpend). `spend_date` is
-- the day as reported by LiteLLM (text, YYYY-MM-DD).
create or replace view litellm.v_user_spend as
select
  d.user_id,
  d.date as spend_date,
  d.api_key,
  d.model,
  d.model_group,
  d.custom_llm_provider,
  d.prompt_tokens,
  d.completion_tokens,
  d.spend,
  d.api_requests,
  d.successful_requests,
  d.failed_requests,
  d.created_at,
  d.updated_at
from public."LiteLLM_DailyUserSpend" d;

comment on view litellm.v_user_spend is
  'LiteLLM_DailyUserSpend, read-only. Daily tokens/spend per user, key and model.';

-- Gateway users: the monthly allowance lives here (`max_budget`/`budget_duration`).
create or replace view litellm.v_user as
select
  u.user_id,
  u.user_alias,
  u.user_email,
  u.max_budget,
  u.spend,
  u.budget_duration,
  u.budget_reset_at,
  u.created_at,
  u.updated_at
from public."LiteLLM_UserTable" u;

comment on view litellm.v_user is
  'LiteLLM_UserTable, read-only. Budget and lifetime spend per gateway user.';

-- Virtual keys as LiteLLM stores them: only the hash (`token`), never a secret.
create or replace view litellm.v_key as
select
  k.token,
  k.user_id,
  k.key_alias,
  k.key_name,
  k.spend,
  k.max_budget,
  k.budget_duration,
  k.expires,
  k.blocked,
  k.last_active,
  k.created_at,
  k.updated_at
from public."LiteLLM_VerificationToken" k;

comment on view litellm.v_key is
  'LiteLLM_VerificationToken, read-only. The key secret exists only as its hash.';

grant select on litellm.v_request_log, litellm.v_user_spend, litellm.v_user, litellm.v_key
  to portal;

commit;
