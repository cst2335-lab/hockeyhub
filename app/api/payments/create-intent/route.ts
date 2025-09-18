// POST { bookingId } -> returns { clientSecret }
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const { bookingId } = await req.json();
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  // 1) Read booking total (in cents) from DB
  const { data: b, error } = await supabaseAdmin
    .from("bookings").select("id,user_id,total").eq("id", bookingId).single();
  if (error || !b?.total) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  // 2) Create Stripe PaymentIntent
  const pi = await stripe.paymentIntents.create({
    amount: b.total, currency: "cad",
    metadata: { booking_id: b.id }
  });

  // 3) Return client secret to client
  return NextResponse.json({ clientSecret: pi.client_secret });
}
