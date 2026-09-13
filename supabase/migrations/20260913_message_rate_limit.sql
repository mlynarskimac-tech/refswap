-- Rate-limit wiadomości: antyflood, max 10 wiadomości / 30 s na nadawcę
create or replace function public.enforce_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  max_per_window constant integer := 10;
begin
  select count(*) into recent_count
  from public.messages
  where sender_id = new.sender_id
    and created_at > now() - interval '30 seconds';

  if recent_count >= max_per_window then
    raise exception 'MESSAGE_RATE_LIMIT'
      using hint = 'You are sending messages too fast. Slow down a moment.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_message_rate_limit_trigger on public.messages;

create trigger enforce_message_rate_limit_trigger
  before insert on public.messages
  for each row
  execute function public.enforce_message_rate_limit();