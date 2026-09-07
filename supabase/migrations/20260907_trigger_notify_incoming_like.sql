-- Trigger wysyłający powiadomienie email o nowym incoming like.
-- Funkcja czyta project_url + service_role_key z Vault i woła Edge Function
-- notify-incoming-like przez pg_net (asynchronicznie — INSERT do likes nie
-- czeka na HTTP, więc lajkowanie nie zawiśnie, gdy mail się nie wyśle).
-- Wymaga: rozszerzenia pg_net oraz sekretów project_url / service_role_key w Vault.
create or replace function public.notify_incoming_like()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $function$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key
    from vault.decrypted_secrets where name = 'service_role_key';

  perform net.http_post(
    url     := v_url || '/functions/v1/notify-incoming-like',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$function$;

drop trigger if exists on_like_created_notify on public.likes;
create trigger on_like_created_notify
  after insert on public.likes
  for each row execute function notify_incoming_like();
