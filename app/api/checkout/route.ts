import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: "Paiement indisponible." }, { status: 500 });
  }
  const stripe = new Stripe(key);
  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: 1900,
            product_data: {
              name: "Fantômes — audit complet",
              description: "Liste classée par montant annuel et lettres de résiliation.",
            },
          },
        },
      ],
      success_url: `${origin}/api/acces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement-echoue`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Paiement indisponible." }, { status: 500 });
  }
}
