import Link from 'next/link';
import {ArrowLeft, ExternalLink} from 'lucide-react';

/**
 * Makes a whole table row, list item or card clickable through its main link ("stretched link"):
 * the link's ::after covers the nearest `relative` ancestor. Other controls in that row need
 * `relative z-10` to stay on top. No JavaScript, so middle-click and "open in new tab" keep working.
 */
export const rowLink = 'after:absolute after:inset-0 after:content-[\'\'] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary';

/** A row that `rowLink` stretches over. */
export const clickableRow = 'relative cursor-pointer hover:bg-gray-50 transition-colors';

/** Sits above a `rowLink` (checkboxes, buttons, other links in the same row). */
export const aboveRowLink = 'relative z-10';

type BackLinkProperties = {
  href: string;
  /** Where the link goes, e.g. "Bestellingen". */
  label: string;
};

/** The back button at the top of every admin subpage. Hidden on paper. */
export function BackLink({href, label}: Readonly<BackLinkProperties>) {
  return (
    <Link
      href={href}
      className='inline-flex items-center gap-1.5 -ml-2 mb-1 min-h-11 px-2 text-sm font-semibold text-primary-text rounded-button hover:bg-brand-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary print:hidden'
    >
      <ArrowLeft className='w-4 h-4' aria-hidden='true' />
      Terug naar {label}
    </Link>
  );
}

type SiteLinkProperties = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/** A link to the public website, in a new tab so the admin stays open. */
export function SiteLink({href, children, className}: Readonly<SiteLinkProperties>) {
  return (
    <a href={href} target='_blank' rel='noopener noreferrer' className={className}>
      {children}
      <ExternalLink className='w-4 h-4 shrink-0' aria-hidden='true' />
      <span className='sr-only'> (opent in een nieuw tabblad)</span>
    </a>
  );
}
