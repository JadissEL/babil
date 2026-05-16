type NotifyExpertPaidBookingParams = {
  expertEmail: string;
  expertName: string;
  customerEmail: string | null;
  durationMinutes: number;
  startUtc: Date;
  amountEuros: string;
};

/**
 * Notifie l’expert après paiement confirmé (Stripe webhook).
 * Si `RESEND_API_KEY` est défini, envoi via Resend ; sinon log structuré (dev / ops).
 */
export async function notifyExpertConsultantBookingPaid(
  params: NotifyExpertPaidBookingParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONSULTANT_NOTIFY_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

  const startFr = params.startUtc.toLocaleString('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Casablanca',
  });
  const subject = `VisaFlow — nouvelle réservation payée avec ${params.expertName}`;
  const text = [
    `Bonjour ${params.expertName},`,
    '',
    `Une séance de ${params.durationMinutes} minutes a été réservée et payée.`,
    `Créneau (Casablanca) : ${startFr}`,
    `Montant : ${params.amountEuros} €`,
    params.customerEmail ? `Coordonnées client : ${params.customerEmail}` : 'Email client : non renseigné',
    '',
    'Connectez-vous à votre agenda VisaFlow pour les détails du créneau.',
    '',
    '— VisaFlow (notification automatique)',
  ].join('\n');

  if (!apiKey) {
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'consultant_booking_expert_notify_skipped_resend',
        to: params.expertEmail,
        subject,
        bodyPreview: text.slice(0, 200),
      }),
    );
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.expertEmail],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.error(
      JSON.stringify({
        level: 'error',
        msg: 'consultant_booking_resend_failed',
        status: res.status,
        detail: err.slice(0, 500),
      }),
    );
  }
}
