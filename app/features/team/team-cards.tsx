import type {Teamlid} from '@lib/content';
import {roleStyles, TeamAvatar} from './team-avatar';

/**
 * `rij`: a grid, cards in one row share a height (the board: a few cards of similar length).
 * `kolommen`: columns of cards that keep their own height, so a short or empty introduction
 * does not leave a tall empty card next to a long one (the members).
 */
const layoutStyles = {
  rij: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-7',
  kolommen: 'columns-[300px] gap-7 -mb-7 [&>li]:break-inside-avoid [&>li]:mb-7',
};

/** Team members as cards: avatar, name, role and their own introduction. */
export function TeamCards({leden, layout = 'rij'}: Readonly<{leden: Teamlid[]; layout?: keyof typeof layoutStyles}>) {
  return (
    <ul className={layoutStyles[layout]}>
      {leden.map((lid, index) => (
        <li key={lid.slug} className='flex flex-col gap-4 bg-white rounded-tile contour-sm shadow-hard-md p-7'>
          <div className='flex items-center gap-[18px]'>
            <TeamAvatar lid={lid} index={index} />
            <div className='flex flex-col items-start gap-1.5'>
              <h3 className='font-display font-bold text-black text-2xl leading-[1.1]'>{lid.naam}</h3>
              <span className={`rounded-full contour-xs px-2.5 py-0.5 text-[13px] font-bold ${roleStyles[index % roleStyles.length]}`}>{lid.rol}</span>
            </div>
          </div>
          {lid.html.trim() && (
            <div className='leading-relaxed text-gray-700 [&_p+p]:mt-3' dangerouslySetInnerHTML={{__html: lid.html}} />
          )}
        </li>
      ))}
    </ul>
  );
}
