import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const NOM = "fantomes_acces";

function signer(valeur: string, cle: string) {
  return createHmac("sha256", cle).update(valeur).digest("hex");
}

function cookieValide(cookie: string | undefined, cle: string) {
  if (!cookie) return false;
  const [valeur, sig] = cookie.split(".");
  if (valeur !== "paye" || !sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(signer(valeur, cle));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const url = new URL(req.url);
  if (!key) {
    return NextResponse.json({ paye: false }, { status: 500 });
  }

  const sessionId = url.searchParams.get("session_id");

  // Sans session_id : on indique si le visiteur a déjà payé.
  if (!sessionId) {
    const cookie = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith(NOM + "="))
      ?.slice(NOM.length + 1);
    return NextResponse.json(
      { paye: cookieValide(cookie, key) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Avec session_id : on vérifie le paiement auprès de Stripe.
  const echec = NextResponse.redirect(new URL("/paiement-echoue", url.origin));
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return echec;

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return echec;

    const ok = NextResponse.redirect(new URL("/audit", url.origin));
    ok.cookies.set(NOM, `paye.${signer("paye", key)}`, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return ok;
  } catch {
    return echec;
  }
}
