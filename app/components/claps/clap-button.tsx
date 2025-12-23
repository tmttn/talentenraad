'use client';

import {useState, useCallback} from 'react';
import {useClaps} from './use-claps';

type ClapContentType = 'nieuws' | 'activiteit';

type ClapButtonProps = {
  contentType: ClapContentType;
  contentId: string;
  className?: string;
};

export function ClapButton({contentType, contentId, className = ''}: ClapButtonProps) {
  const {totalClaps, userClaps, maxClaps, isLoading, addClap, canClap} = useClaps(contentType, contentId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<Array<{id: number; value: number}>>([]);

  const handleClick = useCallback(() => {
    if (!canClap) {
      return;
    }

    addClap();

    // Trigger button animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 150);

    // Add floating number
    const id = Date.now();
    setFloatingNumbers(prev => [...prev, {id, value: 1}]);

    // Remove floating number after animation
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    }, 600);
  }, [canClap, addClap]);

  // Calculate progress percentage
  const progressPercentage = (userClaps / maxClaps) * 100;

  // Determine button state styles
  const buttonStateStyles = canClap
    ? 'hover:bg-primary/10 active:bg-primary/20'
    : 'cursor-default opacity-75';

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* Clap button with progress ring */}
      <div className='relative'>
        {/* Progress ring */}
        <svg
          className='absolute inset-0 -rotate-90 w-12 h-12'
          viewBox='0 0 48 48'
          aria-hidden='true'
        >
          {/* Background circle */}
          <circle
            cx='24'
            cy='24'
            r='20'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            className='text-gray-200'
          />
          {/* Progress circle */}
          <circle
            cx='24'
            cy='24'
            r='20'
            fill='none'
            stroke='currentColor'
            strokeWidth='3'
            strokeDasharray={`${progressPercentage * 1.256} 125.6`}
            strokeLinecap='round'
            className='text-primary transition-all duration-300'
          />
        </svg>

        {/* Button */}
        <button
          type='button'
          onClick={handleClick}
          disabled={isLoading || !canClap}
          className={`
						relative w-12 h-12 rounded-full bg-white border-2 border-gray-200
						flex items-center justify-center
						transition-all duration-150
						disabled:cursor-not-allowed
						${buttonStateStyles}
						${isAnimating ? 'clap-animate' : ''}
					`}
          aria-label={`${totalClaps} keer geklapt. ${canClap ? 'Klik om te klappen' : 'Maximum bereikt'}`}
        >
          <span className='text-xl' role='img' aria-hidden='true'>
            {isLoading ? '...' : '👏'}
          </span>
        </button>

        {/* Floating numbers */}
        {floatingNumbers.map(({id, value}) => (
          <span
            key={id}
            className='clap-float-number absolute left-1/2 -translate-x-1/2 top-0 text-primary font-bold pointer-events-none'
          >
            +{value}
          </span>
        ))}
      </div>

      {/* Clap count display */}
      <div className='flex flex-col items-start'>
        <span className='text-lg font-semibold text-gray-900'>
          {isLoading ? '-' : totalClaps.toLocaleString('nl-BE')}
        </span>
        <span className='text-xs text-gray-500'>
          keer
        </span>
      </div>
    </div>
  );
}
