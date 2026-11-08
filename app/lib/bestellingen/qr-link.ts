/** Reading a scanned QR code in the pickup app. Client-safe. */

/**
 * The token from a scanned `https://talentenraad.be/b/<token>`, only for a link of our own site
 * (one of `origins`); undefined for anything else, so a strange QR code never opens a page.
 */
export function leesTokenUitQr(tekst: string, origins: string[]): string | undefined {
  let url: URL;
  try {
    url = new URL(tekst.trim());
  } catch {
    return undefined;
  }

  const eigen = origins.some(origin => {
    try {
      return new URL(origin).origin === url.origin;
    } catch {
      return false;
    }
  });
  const match = /^\/b\/([\w-]{22})\/?$/.exec(url.pathname);
  return eigen && match ? match[1] : undefined;
}

/** The pickup moment this phone helps with (`<actie>/<moment>`), so a link opened by the camera app lands on the right screen. */
export const momentCookie = 'tr_afhaalmoment';

const slug = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/**
 * Where a logged-in member who opens /b/<token> goes, or undefined for the parent page. A helper
 * always goes to the hand-over screen; another member only when this phone chose a moment of that
 * sale in the pickup app in the last day (`gekozen`, the cookie), so an admin who opens the link of
 * their own order sees it as a parent. `ouder` (`?ouder=1`) shows the parent page, not for a helper.
 */
export function afgifteAdres({rol, gekozen, order, token, ouder}: {
  rol: string;
  gekozen: string | undefined;
  order: {actie: string; afhaalId: string};
  token: string;
  ouder: boolean;
}): string | undefined {
  const helper = rol === 'helper';
  if (ouder && !helper) {
    return undefined;
  }

  const [actie, moment = ''] = (gekozen ?? '').split('/');
  const vanDezeActie = actie === order.actie && slug.test(moment);
  if (!vanDezeActie && !helper) {
    return undefined;
  }

  return `/admin/afhalen/${order.actie}/${vanDezeActie ? moment : order.afhaalId}/${token}`;
}
