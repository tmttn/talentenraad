import Link from 'next/link';
import {ChevronRight, LogOut} from 'lucide-react';
import {requireStaffSession} from '@lib/auth/require-admin';
import {afhaalmomenten} from '@lib/bestellingen/afhalen';
import {content} from '@lib/content';
import {todayString} from '@lib/dates';

export const dynamic = 'force-dynamic';

/** Start of the pickup app: choose the sale and pickup moment you help with. */
export default async function AfhalenStartPage() {
  const session = await requireStaffSession();
  const today = todayString();
  const momenten = await afhaalmomenten(today);

  return (
    <>
      <header className='bg-white border-b border-gray-200 px-4 py-3.5 flex items-center justify-between gap-3'>
        <div className='flex flex-col'>
          <h1 className='text-lg font-bold'>Afhalen</h1>
          <span className='text-sm text-gray-600'>{session.user.name ?? session.user.email}</span>
        </div>
        <form method='post' action='/api/auth/logout'>
          <button type='submit' className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 rounded-button hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'>
            <LogOut className='w-4 h-4' aria-hidden='true' />
            Afmelden
          </button>
        </form>
      </header>

      <main className='flex-1 p-4 flex flex-col gap-4'>
        <p className='text-gray-700'>Kies waar je helpt afhalen.</p>
        {momenten.length === 0 && <p className='rounded-card border border-gray-200 bg-white p-4 text-gray-700'>Er zijn nu geen afhaalmomenten met bestellingen.</p>}
        <ul className='flex flex-col gap-3'>
          {momenten.map(moment => (
            <li key={`${moment.actie}/${moment.afhaalId}`}>
              <Link
                href={`/admin/afhalen/${moment.actie}/${moment.afhaalId}`}
                className='flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-card hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              >
                <span className='flex flex-col gap-0.5 min-w-0'>
                  <span className='font-bold'>{content.getActie(moment.actie)?.titel ?? moment.actie}</span>
                  <span className='text-[15px] text-gray-700'>{moment.label}{moment.datum === today ? ' · vandaag' : ''}</span>
                  <span className='text-sm text-gray-600'>{moment.plaats} · {moment.afgehaald} van {moment.totaal} afgehaald</span>
                </span>
                <ChevronRight className='w-5 h-5 shrink-0 text-gray-500' aria-hidden='true' />
              </Link>
            </li>
          ))}
        </ul>
        {session.user.role !== 'helper' && (
          <Link href='/admin/bestellingen' className='self-start text-sm font-semibold text-primary-text hover:underline'>Naar het beheer van bestellingen</Link>
        )}
      </main>
    </>
  );
}
