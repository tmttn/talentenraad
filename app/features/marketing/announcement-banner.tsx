'use client';

import {useState} from 'react';
import {
  Info,
  AlertTriangle,
  Star,
  X,
} from 'lucide-react';

type AnnouncementBannerProperties = {
  tekst: string;
  type: 'info' | 'waarschuwing' | 'belangrijk';
  link?: string;
  linkTekst?: string;
};

export function AnnouncementBanner({tekst, type, link, linkTekst}: Readonly<AnnouncementBannerProperties>) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const typeStyles = {
    info: {
      bg: 'bg-info-600',
      icon: <Info className='h-5 w-5' aria-hidden='true' />,
    },
    waarschuwing: {
      bg: 'bg-warning-500',
      icon: <AlertTriangle className='h-5 w-5' aria-hidden='true' />,
    },
    belangrijk: {
      bg: 'bg-primary',
      icon: <Star className='h-5 w-5' aria-hidden='true' />,
    },
  };

  const style = typeStyles[type] ?? typeStyles.info;

  return (
    <div className={`${style.bg} text-white`} role='alert'>
      <div className='max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3 flex-1'>
          <span className='flex-shrink-0' aria-hidden='true'>{style.icon}</span>
          <p className='text-sm font-medium'>
            {tekst}
            {link && linkTekst && (
              <a
                href={link}
                className='ml-2 underline hover:no-underline font-bold'
              >
                {linkTekst} →
              </a>
            )}
          </p>
        </div>
        <button
          type='button'
          onClick={() => {
            setIsVisible(false);
          }}
          className='flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors'
          aria-label='Aankondiging sluiten'
        >
          <X className='h-5 w-5' aria-hidden='true' />
        </button>
      </div>
    </div>
  );
}

export const AnnouncementBannerInfo = {
  name: 'AnnouncementBanner',
  component: AnnouncementBanner,
  inputs: [],
};
