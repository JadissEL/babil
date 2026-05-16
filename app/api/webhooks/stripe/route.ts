import { headers } from 'next/headers';
import Stripe from 'stripe';
import { notifyExpertConsultantBookingPaid } from '@/lib/consultant-notify';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return new Response('Webhook not configured', { status: 503 });
  }

  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) break;

      const booking = await prisma.consultantBooking.findUnique({
        where: { id: bookingId },
        include: { expert: true, slot: true },
      });
      if (!booking || booking.status === 'PAID') break;

      const pi =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent && typeof session.payment_intent === 'object'
            ? session.payment_intent.id
            : null;

      await prisma.consultantBooking.update({
        where: { id: bookingId },
        data: { status: 'PAID', stripePaymentId: pi },
      });

      await notifyExpertConsultantBookingPaid({
        expertEmail: booking.expert.notifyEmail,
        expertName: booking.expert.displayName,
        customerEmail: booking.customerEmail,
        durationMinutes: booking.durationMinutes,
        startUtc: booking.slot.startUtc,
        amountEuros: (booking.amountCents / 100).toFixed(2),
      });
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.consultantBooking.deleteMany({
          where: { id: bookingId, status: 'PENDING_PAYMENT' },
        });
      }
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
