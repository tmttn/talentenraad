import type {Metadata} from 'next';
import Link from 'next/link';
import {cookies, headers} from 'next/headers';
import {notFound, redirect} from 'next/navigation';
import {connection} from 'next/server';
import {SpeechBubble} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {Bestelstatus} from '@features/bestellen/bestelstatus';
import {formatDag} from '@lib/bestellingen/acties';
import {kanOuderAnnuleren, uitersteBetaaldatum, vindOpToken} from '@lib/bestellingen/bestellingen';
import {formatKorteCode, isTokenVorm} from '@lib/bestellingen/codes';
import {formatMededeling} from '@lib/bestellingen/mededeling';
import {bestelUrl, qrSvg} from '@lib/bestellingen/qr';
import {content} from '@lib/content';
import {formatIban} from '@lib/content/iban';
import {getSession} from '@lib/auth/session';
import {afgifteAdres, momentCookie} from '@lib/bestellingen/qr-link';
import {createPersistentRateLimiter} from '@lib/persistent-rate-limit';
import {getClientIp} from '@lib/rate-limit';
import {annuleer} from './actions';

export const metadata: Metadata = {
  title: 'Je bestelling',
  robots: {index: false, follow: false},
};

// Unknown tokens per address: whoever guesses links gets the 404 for every link after 20 misses
const missers = createPersistentRateLimiter({scope: 'bestelpagina', limit: 20, windowMs: 10 * 60 * 1000});

type PageProperties = {
  params: Promise<{token: string}>;
  searchParams: Promise<{besteld?: string; annuleren?: string; geannuleerd?: string; ouder?: string}>;
};

const knop = 'inline-flex justify-center items-center px-5 py-3 font-bold rounded-control contour-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2';

export default async function BestellingPage({params, searchParams}: Readonly<PageProperties>) {
  await connection();
  const {token} = await params;
  const ip = getClientIp(await headers() as unknown as Headers);
  if (!isTokenVorm(token) || missers.isLimited(ip)) {
    notFound();
  }

  const order = await vindOpToken(token);
  if (!order) {
    missers.check(ip);
    notFound();
  }

  const {besteld, annuleren, geannuleerd, ouder} = await searchParams;
  // A member who scanned this code with the phone's camera app goes to the hand-over screen
  const session = await getSession();
  const afgifte = session && afgifteAdres({
    rol: session.user.role, gekozen: (await cookies()).get(momentCookie)?.value, order, token, ouder: ouder === '1',
  });
  if (afgifte) {
    redirect(afgifte);
  }

  const actie = content.getActie(order.actie);
  const magAnnuleren = kanOuderAnnuleren(order, actie);

  return (
    <PageWithAnnouncements>
      <section className='px-4 sm:px-5 pt-[clamp(28px,4vw,48px)] pb-[clamp(56px,7vw,96px)]'>
        <div className='max-w-[640px] mx-auto flex flex-col gap-6'>
          {besteld && order.status === 'wacht' && (
            <SpeechBubble tone='green' tail='bottom' size='md' className='mb-6'>
              <div role='status' className='flex flex-col gap-1'>
                <h2 className='font-display font-extrabold text-2xl text-black'>Bedankt voor je bestelling!</h2>
                <p className='text-[17px] text-black'>We stuurden je ook een mail met alles hieronder. Geen mail gekregen? Kijk in je spam; deze pagina blijft altijd werken.</p>
              </div>
            </SpeechBubble>
          )}
          {geannuleerd && (
            <p role='status' className='p-4 rounded-control contour-xs bg-gray-50 font-semibold text-gray-900'>Je bestelling is geannuleerd.</p>
          )}
          {annuleren === 'mislukt' && (
            <p role='alert' className='p-4 rounded-control border-(length:--contour-width-sm) border-red-700 bg-red-50 font-semibold text-red-700'>
              Annuleren kan niet meer. Neem contact met ons op als er iets niet klopt.
            </p>
          )}

          <Bestelstatus
            order={order}
            titel={actie?.titel ?? order.actie}
            betalen={order.status === 'wacht' && actie
              ? {
                iban: formatIban(actie.betalen.rekening.iban),
                begunstigde: actie.betalen.rekening.begunstigde,
                mededeling: formatMededeling(order.mededeling),
                uiterlijk: formatDag(uitersteBetaaldatum(order, actie)),
                cash: actie.betalen.wijzen.includes('cash'),
              }
              : undefined}
            qr={order.status === 'betaald' ? {svg: qrSvg(bestelUrl(token), 'QR-code om je bestelling af te halen'), korteCode: formatKorteCode(order.korteCode)} : undefined}
          />

          {magAnnuleren && actie && (
            <div className='border-t border-gray-200 pt-5 flex flex-col gap-3'>
              {annuleren === '1'
                ? (
                  <form action={annuleer} className='flex flex-col gap-3 p-5 rounded-tile contour-sm bg-red-50'>
                    <input type='hidden' name='token' value={token} />
                    <p className='font-bold text-gray-900'>Wil je deze bestelling echt annuleren?</p>
                    {order.status === 'betaald' && <p className='text-gray-700'>Je hebt al betaald: we storten het bedrag terug.</p>}
                    <div className='flex flex-wrap gap-3'>
                      <button type='submit' className={`${knop} text-white bg-red-700 border-red-700 hover:bg-red-800`}>Ja, annuleer mijn bestelling</button>
                      <Link href={`/b/${token}`} className={`${knop} text-black bg-white hover:bg-gray-50`}>Nee, terug</Link>
                    </div>
                  </form>
                )
                : (
                  <>
                    <Link href={`/b/${token}?annuleren=1`} className={`${knop} self-start text-red-700 bg-white border-red-700 hover:bg-red-50`}>Bestelling annuleren</Link>
                    <p className='text-sm leading-normal text-gray-600'>
                      Kan tot en met {formatDag(actie.bestellen.tot)}.
                      {order.status === 'betaald' ? ' Omdat je al betaald hebt, storten we het bedrag terug.' : ''}
                      {' '}Iets wijzigen? Annuleer en bestel opnieuw.
                    </p>
                  </>
                )}
            </div>
          )}

          <p className='text-sm text-gray-600'>
            Vragen over je bestelling? <Link href='/contact' className='text-primary-text underline underline-offset-2'>Neem contact op</Link>.
          </p>
        </div>
      </section>
    </PageWithAnnouncements>
  );
}
