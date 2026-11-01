import Image from 'next/image';
import type {Teamlid} from '@lib/content';

/** Fill, hard-shadow color and initials color per position, in the logo colors. */
const avatarStyles = [
  'bg-category-event-bg text-category-event-text shadow-[4px_4px_0_var(--color-logo-pink)]',
  'bg-[#ecfccb] text-secondary-hover shadow-[4px_4px_0_var(--color-logo-green)]',
  'bg-[#ffedd5] text-accent-hover shadow-[4px_4px_0_var(--color-logo-orange)]',
];

/** Logo color of a position, for a role label next to the avatar. */
export const roleStyles = ['bg-logo-pink text-black', 'bg-logo-green text-black', 'bg-logo-orange text-black'];

const sizeStyles = {
  md: 'size-24 text-2xl',
  lg: 'size-26 text-[28px]',
};

export const initials = (naam: string) => naam
  .split(' ')
  .map(deel => deel[0])
  .join('')
  .toUpperCase()
  .slice(0, 2);

/** Round portrait with a contour and a hard shadow in a logo color; initials when there is no photo. */
export function TeamAvatar({lid, index, size = 'md'}: Readonly<{lid: Pick<Teamlid, 'naam' | 'foto'>; index: number; size?: 'md' | 'lg'}>) {
  return (
    <span className={`relative shrink-0 rounded-full contour overflow-hidden flex items-center justify-center font-display font-extrabold ${sizeStyles[size]} ${avatarStyles[index % avatarStyles.length]}`}>
      {lid.foto
        ? <Image src={lid.foto.src} alt='' fill sizes='104px' className='object-cover' />
        : <span aria-hidden='true'>{initials(lid.naam)}</span>}
    </span>
  );
}
