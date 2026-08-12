/** Contrato único del contacto de plataforma B5 (ADR 0046). */
export const LOGIC2B_WHATSAPP_PHONE = '+34 626 432 316';
export const LOGIC2B_WHATSAPP_URL = 'https://wa.me/34626432316';
export const LOGIC2B_CONTACT_SCROLL_PX = 280;

export const LOGIC2B_CONTACT_LOCALES = ['es', 'ca', 'en', 'fr', 'de', 'nl'] as const;
export const LOGIC2B_CONTACT_CONTEXTS = ['commercial', 'docs', 'tenant', 'dashboard'] as const;

export type Logic2BContactLocale = (typeof LOGIC2B_CONTACT_LOCALES)[number];
export type Logic2BContactContext = (typeof LOGIC2B_CONTACT_CONTEXTS)[number];

type ContactCopy = {
  label: string;
  ariaLabel: string;
  message: string;
};

const copy = {
  es: {
    commercial: {
      label: 'Contacta',
      ariaLabel: 'Contacta con Logic2B por WhatsApp',
      message: 'Hola, quiero información sobre Logic2B Campings.',
    },
    docs: {
      label: 'Ayuda',
      ariaLabel: 'Pide ayuda a Logic2B por WhatsApp',
      message: 'Hola, necesito ayuda con la documentación de Logic2B Campings.',
    },
    tenant: {
      label: 'Logic2B · Contacta',
      ariaLabel: 'Contacta con Logic2B por WhatsApp',
      message:
        'Hola, he visto una web de demostración creada con Logic2B Campings y quiero información.',
    },
    dashboard: {
      label: 'Ayuda Logic2B',
      ariaLabel: 'Pide ayuda sobre el gestor a Logic2B por WhatsApp',
      message: 'Hola, necesito ayuda con el gestor de Logic2B Campings.',
    },
  },
  ca: {
    commercial: {
      label: 'Contacta',
      ariaLabel: 'Contacta amb Logic2B per WhatsApp',
      message: 'Hola, vull informació sobre Logic2B Campings.',
    },
    docs: {
      label: 'Ajuda',
      ariaLabel: 'Demana ajuda a Logic2B per WhatsApp',
      message: 'Hola, necessito ajuda amb la documentació de Logic2B Campings.',
    },
    tenant: {
      label: 'Logic2B · Contacta',
      ariaLabel: 'Contacta amb Logic2B per WhatsApp',
      message: 'Hola, he vist un web de demostració creat amb Logic2B Campings i vull informació.',
    },
    dashboard: {
      label: 'Ajuda Logic2B',
      ariaLabel: 'Demana ajuda sobre el gestor a Logic2B per WhatsApp',
      message: 'Hola, necessito ajuda amb el gestor de Logic2B Campings.',
    },
  },
  en: {
    commercial: {
      label: 'Contact',
      ariaLabel: 'Contact Logic2B on WhatsApp',
      message: 'Hello, I would like information about Logic2B Campings.',
    },
    docs: {
      label: 'Help',
      ariaLabel: 'Ask Logic2B for help on WhatsApp',
      message: 'Hello, I need help with the Logic2B Campings documentation.',
    },
    tenant: {
      label: 'Logic2B · Contact',
      ariaLabel: 'Contact Logic2B on WhatsApp',
      message:
        'Hello, I have seen a demo website created with Logic2B Campings and would like information.',
    },
    dashboard: {
      label: 'Logic2B help',
      ariaLabel: 'Ask Logic2B for help with the manager on WhatsApp',
      message: 'Hello, I need help with the Logic2B Campings manager.',
    },
  },
  fr: {
    commercial: {
      label: 'Contact',
      ariaLabel: 'Contacter Logic2B sur WhatsApp',
      message: 'Bonjour, je souhaite des informations sur Logic2B Campings.',
    },
    docs: {
      label: 'Aide',
      ariaLabel: 'Demander de l’aide à Logic2B sur WhatsApp',
      message: 'Bonjour, j’ai besoin d’aide avec la documentation de Logic2B Campings.',
    },
    tenant: {
      label: 'Logic2B · Contact',
      ariaLabel: 'Contacter Logic2B sur WhatsApp',
      message:
        'Bonjour, j’ai vu un site de démonstration créé avec Logic2B Campings et je souhaite des informations.',
    },
    dashboard: {
      label: 'Aide Logic2B',
      ariaLabel: 'Demander de l’aide à Logic2B pour le gestionnaire sur WhatsApp',
      message: 'Bonjour, j’ai besoin d’aide avec le gestionnaire Logic2B Campings.',
    },
  },
  de: {
    commercial: {
      label: 'Kontakt',
      ariaLabel: 'Logic2B über WhatsApp kontaktieren',
      message: 'Hallo, ich möchte Informationen über Logic2B Campings.',
    },
    docs: {
      label: 'Hilfe',
      ariaLabel: 'Logic2B über WhatsApp um Hilfe bitten',
      message: 'Hallo, ich benötige Hilfe mit der Dokumentation von Logic2B Campings.',
    },
    tenant: {
      label: 'Logic2B · Kontakt',
      ariaLabel: 'Logic2B über WhatsApp kontaktieren',
      message:
        'Hallo, ich habe eine mit Logic2B Campings erstellte Demo-Website gesehen und möchte Informationen.',
    },
    dashboard: {
      label: 'Logic2B Hilfe',
      ariaLabel: 'Logic2B über WhatsApp um Hilfe zum Manager bitten',
      message: 'Hallo, ich benötige Hilfe mit dem Manager von Logic2B Campings.',
    },
  },
  nl: {
    commercial: {
      label: 'Contact',
      ariaLabel: 'Neem via WhatsApp contact op met Logic2B',
      message: 'Hallo, ik wil graag informatie over Logic2B Campings.',
    },
    docs: {
      label: 'Hulp',
      ariaLabel: 'Vraag Logic2B om hulp via WhatsApp',
      message: 'Hallo, ik heb hulp nodig bij de documentatie van Logic2B Campings.',
    },
    tenant: {
      label: 'Logic2B · Contact',
      ariaLabel: 'Neem via WhatsApp contact op met Logic2B',
      message:
        'Hallo, ik heb een demonstratiewebsite gezien die met Logic2B Campings is gemaakt en wil graag informatie.',
    },
    dashboard: {
      label: 'Logic2B hulp',
      ariaLabel: 'Vraag Logic2B via WhatsApp om hulp met de beheeromgeving',
      message: 'Hallo, ik heb hulp nodig bij de beheeromgeving van Logic2B Campings.',
    },
  },
} satisfies Record<Logic2BContactLocale, Record<Logic2BContactContext, ContactCopy>>;

function localeOrFallback(locale: string): Logic2BContactLocale {
  const normalized = locale.toLowerCase().split('-')[0];
  return LOGIC2B_CONTACT_LOCALES.includes(normalized as Logic2BContactLocale)
    ? (normalized as Logic2BContactLocale)
    : 'es';
}

export type Logic2BContact = ContactCopy & {
  phone: typeof LOGIC2B_WHATSAPP_PHONE;
  href: string;
};

export function logic2bContactEnabled(config: { logic2bContact?: boolean }): boolean {
  return config.logic2bContact !== false;
}

export function logic2bContact(locale: string, context: Logic2BContactContext): Logic2BContact {
  const selected = copy[localeOrFallback(locale)][context];
  const url = new URL(LOGIC2B_WHATSAPP_URL);
  url.searchParams.set('text', selected.message);
  return { ...selected, phone: LOGIC2B_WHATSAPP_PHONE, href: url.href };
}
