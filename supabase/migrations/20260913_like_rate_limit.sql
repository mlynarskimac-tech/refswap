-- Rate-limit lajków: max 30/h na użytkownika, egzekwowane serwerowo
create or replace function public.enforce_like_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
  max_per_hour constant integer := 30;
begin
  select count(*) into recent_count
  from public.likes
  where from_user = new.from_user
    and created_at > now() - interval '1 hour';

  if recent_count >= max_per_hour then
    raise exception 'LIKE_RATE_LIMIT'
      using hint = 'Too many likes in a short time. Try again later.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_like_rate_limit_trigger on public.likes;

create trigger enforce_like_rate_limit_trigger
  before insert on public.likes
  for each row
  execute function public.enforce_like_rate_limit();