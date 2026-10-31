'use client';

import {Container, Grid} from '@components/ui/layout';
import type {Teamlid} from '@lib/content';

type TeamGridProperties = {
  leden: Teamlid[];
  columns: 3 | 4;
  showDescription: boolean;
};

function TeamGrid({
  leden,
  columns,
  showDescription,
}: Readonly<TeamGridProperties>) {
  const teamMembers = leden.map(lid => ({
    name: lid.naam,
    role: lid.rol,
    description: lid.html ? lid.html : undefined,
    slug: lid.slug,
  }));

  const getInitials = (fullName: string) => fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Map columns prop to responsive Grid props
  const getGridColsLg = (cols: number): 3 | 4 => {
    if (cols === 4) {
      return 4;
    }

    return 3;
  };

  const avatarColors = [
    'from-brand-primary-500 to-brand-primary-700',
    'from-[#7c3aed] to-[#5b21b6]',
    'from-[#0891b2] to-[#0e7490]',
    'from-[#059669] to-[#047857]',
    'from-[#d97706] to-[#b45309]',
  ];

  if (teamMembers.length === 0) {
    return (
      <Container size='xl' className='text-center py-12 text-gray-500'>
        Geen teamleden gevonden
      </Container>
    );
  }

  return (
    <Container size='xl'>
      <Grid cols={1} colsMd={2} colsLg={getGridColsLg(columns)} gap='lg'>
        {teamMembers.map((member, index) => (
          <div key={member.slug} className='text-center group'>
            <div className='relative mb-5 inline-block'>
              <div className={[
                'w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center',
                'shadow-elevated group-hover:shadow-floating transition-shadow',
                avatarColors[index % avatarColors.length],
              ].join(' ')}>
                <span className='text-white font-bold text-3xl'>
                  {getInitials(member.name)}
                </span>
              </div>
              <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-base'>
                <span className='text-xs font-semibold text-primary'>
                  {member.role}
                </span>
              </div>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mt-4'>
              {member.name}
            </h3>
            {showDescription && member.description && (
              <div
                className='text-gray-600 text-sm mt-2 max-w-xs mx-auto'
                dangerouslySetInnerHTML={{__html: member.description}}
              />
            )}
          </div>
        ))}
      </Grid>
    </Container>
  );
}

export {TeamGrid};
