import { isSchengenMember } from '@/lib/schengen-members';

export type CountryPageJsonLdArgs = {
  origin: string;
  countryId: string;
  name: string;
  region: string;
  title: string;
  description: string;
};

/**
 * WebPage + FAQPage structured data for public country detail routes.
 */
export function buildCountryPageJsonLd(args: CountryPageJsonLdArgs) {
  const path = `/countries/${args.countryId}`;
  const pageUrl = `${args.origin}${path}`;
  const schengen = isSchengenMember(args.name);
  const regionLabel = schengen ? `${args.region}, espace Schengen` : args.region;

  const faqs: { question: string; answer: string }[] = [
    {
      question: `Que couvre la fiche ${args.name} ?`,
      answer: `Vue synthèse sur les visas (tourisme, études, travail, affaires), la friction perçue et des signaux pratiques pour un profil Maroc / VisaFlow, avec le contexte régional (${regionLabel}).`,
    },
    {
      question: 'Les scores et probabilités remplacent-ils une décision officielle ?',
      answer:
        'Non. Il s’agit d’aide à la décision fondée sur des sources publiques et des retours utilisateurs ; seules les autorités compétentes tranchent un dossier.',
    },
    {
      question: 'Comment interpréter la difficulté des rendez-vous consulaires ?',
      answer:
        'Les signaux “audit rendez-vous” agrègent des retours et de l’OSINT : utiles pour anticiper, mais soumis à la saisonnalité et aux politiques locales.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: args.title,
        description: args.description,
        inLanguage: 'fr',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${args.origin}/#website`,
          url: args.origin,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  };
}
