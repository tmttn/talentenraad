'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {Menu, X} from 'lucide-react';
import {ChristmasLights} from '@components/seasonal-decorations';

type NavigationLink = {
  text: string;
  url: string;
};

type SiteHeaderProperties = {
  logoUrl?: string;
  logoAlt?: string;
  navigationLinks?: NavigationLink[];
  /** The link with this url is shown as a contour button instead of a plain link. */
  ctaUrl?: string;
};

const defaultLinks: NavigationLink[] = [
  {url: '/', text: 'Home'},
  {url: '/kalender', text: 'Kalender'},
  {url: '/nieuws', text: 'Nieuws'},
  {url: '/over-ons', text: 'Over Ons'},
  {url: '/contact', text: 'Contact'},
];

export function SiteHeader({
  logoUrl = '/Logo.png',
  logoAlt = 'Talentenraad Logo',
  navigationLinks,
  ctaUrl = '/contact',
}: Readonly<SiteHeaderProperties>) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSkipLinkVisible, setIsSkipLinkVisible] = useState(false);
  const hadRecentTabPress = useRef(false);
  const links = navigationLinks ?? defaultLinks;

  // Track Tab keypresses to distinguish intentional focus from programmatic focus
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        hadRecentTabPress.current = true;
        // Reset after a short delay
        setTimeout(() => {
          hadRecentTabPress.current = false;
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Skip to main content link - only visible when focused via Tab keypress */}
      <a
        href='#main-content'
        className={`skip-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary ${isSkipLinkVisible ? 'skip-link-visible' : ''}`}
        onFocus={() => {
          // Only show if focus came from a Tab keypress
          if (hadRecentTabPress.current) {
            setIsSkipLinkVisible(true);
          }
        }}
        onBlur={() => {
          setIsSkipLinkVisible(false);
        }}
      >
        Ga naar hoofdinhoud
      </a>
      <header role='banner' className='bg-white shadow-subtle sticky top-0 z-50'>
        <div className='max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-4'>
            <Image
              src={logoUrl}
              alt={logoAlt}
              width={120}
              height={80}
              className='h-14 w-auto'
              priority
            />
          </Link>
          <nav role='navigation' aria-label='Hoofdnavigatie' className='hidden md:flex items-center gap-1'>
            {links.map(item => (
              <Link
                key={item.url}
                href={item.url}
                className={item.url === ctaUrl
                  ? 'ml-1.5 px-4 py-2.5 font-bold text-white bg-primary hover:bg-primary-hover contour-sm rounded-xl shadow-hard-xs transition-colors'
                  : `px-3 py-2.5 transition-colors hover:text-primary-text focus:text-primary-text focus:outline-none focus:underline underline-offset-4 ${
                    pathname === item.url
                      ? 'font-bold text-primary-text'
                      : 'font-semibold text-gray-900'
                  }`}
                aria-current={pathname === item.url ? 'page' : undefined}
              >
                {item.text}
              </Link>
            ))}
          </nav>
          <div className='flex items-center gap-2 md:hidden'>
            <button
              type='button'
              className='p-2 text-gray-600 hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded-button transition-colors'
              aria-label={isMenuOpen ? 'Menu sluiten' : 'Menu openen'}
              aria-expanded={isMenuOpen}
              aria-controls='mobile-menu'
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              {isMenuOpen
                ? <X className='w-6 h-6 transition-transform duration-fast' />
                : <Menu className='w-6 h-6 transition-transform duration-fast' />}
            </button>
          </div>
        </div>

        {/* Mobile menu with animation */}
        <nav
          id='mobile-menu'
          aria-label='Mobiele navigatie'
          className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-slow ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className='px-6 py-4 space-y-1'>
            {links.map((item, index) => (
              <Link
                key={item.url}
                href={item.url}
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className={`block py-3 px-4 rounded-button font-medium transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-focus focus:ring-inset ${
                  pathname === item.url
                    ? 'bg-primary/10 text-primary-text'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: isMenuOpen ? 1 : 0,
                }}
                aria-current={pathname === item.url ? 'page' : undefined}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </nav>
        {/* Seasonal Christmas lights decoration */}
        <ChristmasLights />
      </header>
    </>
  );
}
