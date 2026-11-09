import type {Teamlid} from '@lib/content';
import {TeamAvatar} from './team-avatar';

/**
 * `rij`: a grid, cards in one row share a height (the board: a few cards of similar length).
 * `kolommen`: columns of cards that keep their own height, so a short or empty introduction
 * does not leave a tall empty card next to a long one (the members).
 */
const layoutStyles = {
  rij: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-7',
  kolommen: 'columns-[300px] gap-7 -mb-7 [&>li]:break-inside-avoid [&>li]:mb-7',
};

/**
 * Logo colors in turn, in the order of the avatars: a header in the full color (white text on pink,
 * black on green and orange), the introduction on a faded tint of it.
 */
export const cardTones = [
  {header: 'bg-primary text-white', body: 'bg-logo-pink-tint', fill: 'var(--color-primary)'},
  {header: 'bg-logo-green text-black', body: 'bg-logo-green-tint', fill: 'var(--color-logo-green)'},
  {header: 'bg-logo-orange text-black', body: 'bg-logo-orange-tint', fill: 'var(--color-logo-orange)'},
];

/**
 * Tail under the avatar, slanted like the speech balloon in the logo, so the introduction reads as said by them.
 * Its base sits on the header's bottom border: the fill hides that stretch of the border, the strokes continue it.
 */
function Tail({fill}: Readonly<{fill: string}>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 36 22' className='absolute top-full left-11 w-9 h-[22px] overflow-visible'>
      <path d='M0 -1 L0 0 L8 20.5 L36 0 L36 -1 Z' fill={fill} />
      <path d='M0 0 L8 20.5 L36 0' fill='none' stroke='var(--color-ink)' strokeWidth='2.5' strokeLinejoin='round' />
    </svg>
  );
}

/** Team members as cards: a colored header with avatar, name and role, and their own introduction below. */
export function TeamCards({leden, layout = 'rij'}: Readonly<{leden: Teamlid[]; layout?: keyof typeof layoutStyles}>) {
  return (
    <ul className={layoutStyles[layout]}>
      {leden.map((lid, index) => {
        const tone = cardTones[index % cardTones.length];
        const heeftTekst = lid.html.trim() !== '';

        return (
          <li key={lid.slug} className='flex flex-col bg-white rounded-tile contour-sm shadow-hard-md overflow-hidden'>
            <div className={`relative flex items-center gap-[18px] px-6 py-5 ${tone.header} ${heeftTekst ? 'border-b-(length:--contour-width-sm) border-ink' : ''}`}>
              {/* The next logo color, so the avatar and its shadow stand out on the header */}
              <TeamAvatar lid={lid} index={index + 1} />
              <div className='flex flex-col items-start gap-1.5'>
                <h3 className='font-display font-bold text-2xl leading-[1.1]'>{lid.naam}</h3>
                <span className='rounded-full contour-xs bg-white text-black px-2.5 py-0.5 text-[13px] font-bold'>{lid.rol}</span>
              </div>
              {heeftTekst && <Tail fill={tone.fill} />}
            </div>
            {heeftTekst && (
              <div
                className={`flex-1 px-7 pt-8 pb-7 leading-relaxed text-gray-700 [&_p+p]:mt-3 ${tone.body}`}
                dangerouslySetInnerHTML={{__html: lid.html}}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
