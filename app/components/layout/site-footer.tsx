'use client';

import Image from 'next/image';
import Link from 'next/link';
import {Icicles} from '@components/seasonal-decorations';
import {FeedbackLink} from '@components/feedback';

type NavigationLink = {
  text: string;
  url: string;
};

type NavigationGroup = {
  title: string;
  links: NavigationLink[];
};

type SiteFooterProperties = {
  logoUrl?: string;
  tagline?: string;
  address?: {
    street?: string;
    city?: string;
  };
  email?: string;
  navigationGroups?: NavigationGroup[];
  copyrightText?: string;
};

const defaultNavigationGroups: NavigationGroup[] = [
  {
    title: 'Site',
    links: [
      {url: '/kalender', text: 'Kalender'},
      {url: '/nieuws', text: 'Nieuws'},
      {url: '/over-ons', text: 'Over ons'},
      {url: '/contact', text: 'Contact'},
    ],
  },
  {
    title: 'School',
    links: [
      {url: 'https://talentenhuis.be', text: 'Het Talentenhuis'},
      {url: 'https://facebook.com/talentenhuis', text: 'Facebook'},
      {url: 'https://instagram.com/talentenhuis', text: 'Instagram'},
    ],
  },
];

const legalLinks = [
  {url: '/privacybeleid', text: 'Privacybeleid'},
  {url: '/cookiebeleid', text: 'Cookiebeleid'},
  {url: '/algemene-voorwaarden', text: 'Algemene voorwaarden'},
];

const linkClass = 'text-gray-700 hover:text-primary-text focus:text-primary-text focus:outline-none focus-visible:underline transition-colors';

export function SiteFooter({
  logoUrl = '/Logo.png',
  tagline = 'De ouderraad van Het Talentenhuis',
  address = {street: 'Zonhoevestraat 32', city: '3740 Bilzen-Hoeselt'},
  email = 'voorzitterouderraad@talentenhuis.be',
  navigationGroups,
  copyrightText = 'Talentenraad Het Talentenhuis. Alle rechten voorbehouden.',
}: Readonly<SiteFooterProperties>) {
  const groups = navigationGroups ?? defaultNavigationGroups;

  return (
    <footer role='contentinfo' className='bg-white border-t-(length:--contour-width) border-ink'>
      {/* Seasonal icicles decoration */}
      <Icicles />
      <div className='max-w-[1240px] mx-auto px-5 pt-12 pb-8 flex flex-col gap-8'>
        <div className='flex flex-wrap justify-between items-start gap-8'>
          <div className='flex-[1_1_260px] flex flex-col gap-2.5'>
            <Link href='/' className='self-start'>
              <Image
                src={logoUrl}
                alt='Talentenraad, naar de startpagina'
                width={150}
                height={100}
                className='h-13 w-auto'
              />
            </Link>
            <p className='text-[15px] leading-relaxed text-gray-600'>
              <span className='whitespace-pre-line'>{tagline}</span>
              {address && (address.street ?? address.city) && (
                <>
                  <br />
                  {[address.street, address.city].filter(Boolean).join(', ')}
                </>
              )}
            </p>
            {email && (
              <a href={`mailto:${email}`} className='self-start text-[15px] text-primary-text underline-offset-4 hover:underline'>
                {email}
              </a>
            )}
          </div>

          <div className='flex flex-wrap gap-12'>
            {groups.map((group, index) => (
              <nav key={group.title} aria-labelledby={`footer-nav-${index}`}>
                <h2 id={`footer-nav-${index}`} className='sr-only'>{group.title}</h2>
                <ul className='flex flex-col gap-2.5'>
                  {group.links.map(link => (
                    <li key={link.url}>
                      <Link
                        href={link.url}
                        className={linkClass}
                        {...(link.url.startsWith('http') ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                      >
                        {link.text}
                        {link.url.startsWith('http') && <span className='sr-only'> (opent in nieuw venster)</span>}
                      </Link>
                    </li>
                  ))}
                  {index === groups.length - 1 && (
                    <li><FeedbackLink /></li>
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap justify-between gap-3 pt-5 border-t border-gray-200 text-sm text-gray-600'>
          <p>© {new Date().getFullYear()} {copyrightText}</p>
          <ul className='flex flex-wrap gap-4'>
            {legalLinks.map(link => (
              <li key={link.url}>
                <Link href={link.url} className='text-gray-600 underline-offset-4 hover:text-primary-text hover:underline'>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
