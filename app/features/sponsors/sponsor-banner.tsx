'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type {Pagina} from '@lib/content';

type Sponsor = Pagina<'sponsors'>['sponsors'][number];

type SponsorBannerProperties = {
  sponsors?: Sponsor[];
  hidden?: boolean;
  rotationInterval?: number; // In seconds
  showTierBadge?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  title?: string;
};

// Track sponsor event (impression or click)
async function trackSponsorEvent(
  sponsorId: string,
  sponsorName: string,
  eventType: 'impression' | 'click',
) {
  try {
    await fetch('/api/sponsors/track', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({sponsorId, sponsorName, eventType}),
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('Failed to track sponsor event:', error);
  }
}

const tierOrder = {
  goud: 1,
  zilver: 2,
  brons: 3,
  partner: 4,
};

function SponsorBanner({
  sponsors: sponsorsInput = [],
  hidden = false,
  rotationInterval = 5,
  showTierBadge = true,
  variant = 'default',
  title = 'Met dank aan onze sponsors',
}: Readonly<SponsorBannerProperties>) {
  const sponsors = [...sponsorsInput].sort((a, b) => tierOrder[a.niveau] - tierOrder[b.niveau]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const trackedImpressions = useRef<Set<string>>(new Set());

  // Set up rotation interval
  useEffect(() => {
    if (hidden || sponsors.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(previousIndex => (previousIndex + 1) % sponsors.length);
    }, rotationInterval * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [hidden, sponsors.length, rotationInterval]);

  // Set up Intersection Observer for impression tracking
  useEffect(() => {
    if (hidden || !bannerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        setIsVisible(entry?.isIntersecting ?? false);
      },
      {threshold: 0.5}, // At least 50% visible
    );

    observer.observe(bannerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hidden]);

  // Track impression when visible and sponsor changes
  useEffect(() => {
    if (!isVisible || sponsors.length === 0) {
      return;
    }

    const currentSponsor = sponsors[currentIndex];
    if (!currentSponsor) {
      return;
    }

    // Only track each sponsor impression once per page view
    const impressionKey = `${currentSponsor.naam}-${currentIndex}`;
    if (trackedImpressions.current.has(impressionKey)) {
      return;
    }

    trackedImpressions.current.add(impressionKey);
    void trackSponsorEvent(currentSponsor.naam, currentSponsor.naam, 'impression');
  }, [isVisible, currentIndex, sponsors.length]);

  // Handle sponsor click
  const handleClick = useCallback((sponsor: Sponsor) => {
    void trackSponsorEvent(sponsor.naam, sponsor.naam, 'click');
  }, []);

  if (hidden || sponsors.length === 0) {
    return null;
  }

  const currentSponsor = sponsors[currentIndex];
  if (!currentSponsor) {
    return null;
  }

  const tierColors = {
    goud: 'bg-amber-100 text-amber-800 border-amber-300',
    zilver: 'bg-gray-100 text-gray-700 border-gray-300',
    brons: 'bg-orange-100 text-orange-800 border-orange-300',
    partner: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const tierLabels = {
    goud: 'Goud',
    zilver: 'Zilver',
    brons: 'Brons',
    partner: 'Partner',
  };

  const variants = {
    default: 'py-8 md:py-12',
    compact: 'py-4 md:py-6',
    minimal: 'py-2 md:py-4',
  };

  const SponsorContent = (
    <div className='flex flex-col items-center gap-4'>
      {variant !== 'minimal' && title && (
        <p className='text-sm text-gray-500 uppercase tracking-wider font-medium'>
          {title}
        </p>
      )}

      <div className='flex items-center gap-4'>
        {currentSponsor.logo && (
          <div className='relative h-12 w-32 md:h-16 md:w-40'>
            <Image
              src={currentSponsor.logo.src}
              alt={currentSponsor.naam}
              fill
              className='object-contain'
              sizes='(max-width: 768px) 128px, 160px'
            />
          </div>
        )}

        {showTierBadge && variant !== 'minimal' && (
          <span className={`px-2 py-1 text-xs font-medium rounded border ${tierColors[currentSponsor.niveau]}`}>
            {tierLabels[currentSponsor.niveau]}
          </span>
        )}
      </div>

      {sponsors.length > 1 && variant !== 'minimal' && (
        <div className='flex gap-1.5 mt-2'>
          {sponsors.map((_, index) => (
            <button
              key={sponsors[index]?.naam ?? index}
              type='button'
              onClick={() => {
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-brand-primary-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ga naar sponsor ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={bannerRef}
      className={`bg-gray-50 ${variants[variant]}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {currentSponsor.link
          ? (
            <Link
              href={currentSponsor.link}
              target='_blank'
              rel='noopener noreferrer sponsored'
              onClick={() => {
                handleClick(currentSponsor);
              }}
              className='block hover:opacity-80 transition-opacity'
            >
              {SponsorContent}
            </Link>
          )
          : SponsorContent}
      </div>
    </section>
  );
}

export const SponsorBannerInfo = {
  name: 'SponsorBanner',
  component: SponsorBanner,
  inputs: [
    {
      name: 'hidden',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Verberg de sponsorbanner',
    },
    {
      name: 'rotationInterval',
      type: 'number',
      defaultValue: 5,
      helperText: 'Seconden tussen het wisselen van sponsors',
    },
    {
      name: 'showTierBadge',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Toon het sponsorniveau (Goud, Zilver, etc.)',
    },
    {
      name: 'variant',
      type: 'string',
      enum: ['default', 'compact', 'minimal'],
      defaultValue: 'default',
      helperText: 'default: volledig met beschrijving, compact: kleiner, minimal: alleen logo',
    },
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Met dank aan onze sponsors',
      helperText: 'Titel boven de sponsorbanner',
    },
  ],
};
