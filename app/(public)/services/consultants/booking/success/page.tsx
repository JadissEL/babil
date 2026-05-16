import Link from 'next/link';
import { getStripe } from '@/lib/stripe-server';

export const dynamic = 'force-dynamic';

export default async function ConsultantBookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripe();

  let status: 'paid' | 'pending' | 'unknown' = 'unknown';
  let amount: string | null = null;

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent'],
      });
      if (session.payment_status === 'paid') {
        status = 'paid';
        const total = session.amount_total;
        if (typeof total === 'number') {
          amount = (total / 100).toFixed(2);
        }
      } else {
        status = 'pending';
      }
    } catch {
      status = 'unknown';
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-16">
      <h1 className="font-serif text-2xl font-black text-[#0D1B3E]">Réservation</h1>
      {status === 'paid' ? (
        <p className="text-sm leading-relaxed text-[#0D1B3E]/80">
          Paiement reçu{amount ? ` (${amount} €)` : ''}. Votre créneau est sécurisé. L’expert a reçu une notification
          par e-mail.
        </p>
      ) : status === 'pending' ? (
        <p className="text-sm leading-relaxed text-[#0D1B3E]/80">
          Session de paiement en cours de traitement. Cette page se mettra à jour après confirmation bancaire ; vous
          pouvez aussi vérifier vos e-mails.
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-[#0D1B3E]/80">
          Impossible de confirmer la session. Si vous avez payé, conservez votre reçu Stripe ; sinon retentez depuis le
          profil consultant.
        </p>
      )}
      <Link
        href="/services/consultants"
        className="inline-block rounded-xl bg-[#0D1B3E] px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
      >
        Retour aux experts
      </Link>
    </div>
  );
}
