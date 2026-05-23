import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { getPublicSiteOrigin } from '@/lib/site-public-url';
import { getStripe } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

type Body = {
  expertSlug: string;
  slotId: string;
  durationMinutes: 30 | 60;
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const slug = typeof body.expertSlug === 'string' ? body.expertSlug.trim().toLowerCase() : '';
  const slotId = typeof body.slotId === 'string' ? body.slotId.trim() : '';
  const durationMinutes = body.durationMinutes;

  if (!slug || !slotId || (durationMinutes !== 30 && durationMinutes !== 60)) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: 'Paiement indisponible : STRIPE_SECRET_KEY non configurée sur le serveur.' },
      { status: 503 },
    );
  }

  const origin = getPublicSiteOrigin();
  if (!origin) {
    return Response.json(
      { error: 'URL publique manquante (NEXT_PUBLIC_APP_URL ou VERCEL_URL).' },
      { status: 503 },
    );
  }

  const expert = await prisma.consultantExpert.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      displayName: true,
      price30MinCents: true,
      price60MinCents: true,
    },
  });

  if (!expert) {
    return Response.json({ error: 'Expert introuvable' }, { status: 404 });
  }

  const amountCents = durationMinutes === 30 ? expert.price30MinCents : expert.price60MinCents;

  const user = await currentUser();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress?.trim() ||
    user?.emailAddresses?.[0]?.emailAddress?.trim() ||
    null;

  const slot = await prisma.consultantSlot.findFirst({
    where: {
      id: slotId,
      expertId: expert.id,
      startUtc: { gt: new Date() },
      booking: { is: null },
    },
  });

  if (!slot) {
    return Response.json({ error: 'Créneau indisponible' }, { status: 409 });
  }

  const slotMs = slot.endUtc.getTime() - slot.startUtc.getTime();
  const needMs = durationMinutes * 60_000;
  if (slotMs + 1 < needMs) {
    return Response.json({ error: 'Durée incompatible avec ce créneau' }, { status: 400 });
  }

  let bookingId: string;
  try {
    const booking = await prisma.consultantBooking.create({
      data: {
        expertId: expert.id,
        slotId: slot.id,
        clerkUserId: userId,
        customerEmail,
        durationMinutes,
        amountCents,
        currency: 'eur',
        status: 'PENDING_PAYMENT',
      },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch {
    return Response.json({ error: 'Créneau déjà réservé' }, { status: 409 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: customerEmail ?? undefined,
      success_url: `${origin}/services/consultants/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/consultants/${slug}?cancelled=1`,
      metadata: {
        bookingId,
        expertId: expert.id,
        clerkUserId: userId,
      },
      payment_intent_data: {
        metadata: { bookingId },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: {
              name: `VisaFlow — séance ${durationMinutes} min avec ${expert.displayName}`,
              description: `Consultation mobilité · créneau sécurisé après paiement`,
            },
          },
        },
      ],
    });

    await prisma.consultantBooking.update({
      where: { id: bookingId },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      await prisma.consultantBooking.delete({ where: { id: bookingId } });
      return Response.json({ error: 'Stripe n’a pas renvoyé d’URL de paiement' }, { status: 502 });
    }

    return Response.json({ url: session.url });
  } catch (e) {
    await prisma.consultantBooking.delete({ where: { id: bookingId } }).catch(() => {});
    console.error(e);
    return Response.json({ error: 'Échec création session Stripe' }, { status: 502 });
  }
}
