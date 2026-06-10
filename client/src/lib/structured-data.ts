import { SITE_URL, SITE_NAME, ORG } from '@/lib/site';

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: ORG.legalName,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    email: ORG.email,
    telephone: ORG.phone,
    areaServed: 'IN',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.locality,
      addressRegion: ORG.address.region,
      postalCode: ORG.address.postalCode,
      addressCountry: ORG.address.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: ORG.phone,
      email: ORG.email,
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };
}

type ServiceInput = {
  name: string;
  description: string;
  price: number;
  path: string;
};

export function serviceSchema({ name, description, price, path }: ServiceInput): Record<string, unknown> {
  const url = `${SITE_URL}${path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    offers: {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: 'INR',
      url,
      availability: 'https://schema.org/InStock',
    },
  };
}
