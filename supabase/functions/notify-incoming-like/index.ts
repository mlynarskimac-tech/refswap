import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = "https://refswap.eu";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const like = payload.record;
    if (!like?.to_listing) {
      return new Response("no listing", { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: listing, error: listingErr } = await supabase
      .from("listings")
      .select("user_id, brand, model")
      .eq("id", like.to_listing)
      .single();

    if (listingErr || !listing) {
      return new Response("listing not found", { status: 200 });
    }

    const { data: owner, error: ownerErr } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", listing.user_id)
      .single();

    if (ownerErr || !owner?.email) {
      return new Response("owner not found", { status: 200 });
    }

    const watch = [listing.brand, listing.model].filter(Boolean).join(" ") || "your watch";
    const firstName = owner.name || "there";

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#F6F6F3; padding:32px;">
        <div style="max-width:480px; margin:0 auto; background:#FFFFFF; border-radius:22px; padding:32px; box-shadow:0 2px 16px rgba(0,0,0,0.05);">
          <h1 style="font-family: Georgia, serif; color:#16181B; font-size:22px; margin:0 0 8px;">Someone likes your watch 👀</h1>
          <p style="color:#16181B; font-size:15px; line-height:1.5;">Hi ${firstName},</p>
          <p style="color:#16181B; font-size:15px; line-height:1.5;">Someone's interested in your <strong>${watch}</strong>. Their identity stays hidden until you like them back — head over to see their watch and decide.</p>
          <a href="${APP_URL}/incoming" style="display:inline-block; margin-top:16px; background:#274C6B; color:#FFFFFF; text-decoration:none; padding:12px 28px; border-radius:99px; font-size:15px; font-weight:600;">See who likes it</a>
          <p style="color:#8A8A8A; font-size:12px; margin-top:24px;">RefSwap · P2P watch exchange</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RefSwap <team@refswap.eu>",
        to: owner.email,
        subject: "Someone likes your watch 👀",
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 200 });
  }
});
