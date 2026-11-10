import type {Metadata} from 'next';
import {requireEditorSession} from '@lib/auth/require-admin';
import {Suspense} from 'react';
import {count, isNull, desc} from 'drizzle-orm';
import Link from 'next/link';
import {
  Inbox,
  Mail,
  ArrowRight,
  ExternalLink,
  FileText,
  Globe,
  ShoppingBag,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {db, submissions} from '@lib/db';
import {DashboardSkeleton} from '@components/skeletons';

export const metadata: Metadata = {
  title: 'Dashboard',
};
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Goedemorgen';
  }

  if (hour < 18) {
    return 'Goedemiddag';
  }

  return 'Goedenavond';
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('nl-BE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type DashboardData = {
  totalCount: number;
  unreadCount: number;
  recentSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    createdAt: Date;
    readAt: Date | null;
    archivedAt: Date | null;
  }>;
};

async function fetchDashboardData(): Promise<DashboardData> {
  // Default values for when database is unavailable
  let totalCount = 0;
  let unreadCount = 0;
  let recentSubmissions: DashboardData['recentSubmissions'] = [];

  // Skip database calls during build phase
  if (!isBuildPhase) {
    try {
      const [totalResult] = await db.select({count: count()}).from(submissions);
      const [unreadResult] = await db.select({count: count()})
        .from(submissions)
        .where(isNull(submissions.readAt));

      // Fetch recent unread submissions
      recentSubmissions = await db.select()
        .from(submissions)
        .where(isNull(submissions.archivedAt))
        .orderBy(desc(submissions.createdAt))
        .limit(5);

      totalCount = totalResult.count;
      unreadCount = unreadResult.count;
    } catch {
      // Silently fail - dashboard will show zeros for submissions
    }
  }

  return {
    totalCount,
    unreadCount,
    recentSubmissions,
  };
}

function DashboardHeader() {
  const greeting = getGreeting();

  return (
    <>
      {/* Header with greeting */}
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{greeting}!</h1>
        <p className='text-gray-500 mt-1'>Hier is een overzicht van je website.</p>
      </div>
    </>
  );
}

type QuickLink = {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tint: string;
  external?: boolean;
};

const contentLink: QuickLink = {href: '/admin/content', label: 'Content', hint: 'Activiteiten, nieuws, team en meer', icon: FileText, tint: 'bg-primary/10 text-primary'};
const bestellingenLink: QuickLink = {href: '/admin/bestellingen', label: 'Bestellingen', hint: 'Acties en betalingen', icon: ShoppingBag, tint: 'bg-amber-100 text-amber-700'};
const websiteLink: QuickLink = {href: '/', label: 'Website', hint: 'Bekijk de site zoals ouders ze zien', icon: Globe, tint: 'bg-green-100 text-green-700', external: true};

const adminLinks: QuickLink[] = [
  contentLink,
  bestellingenLink,
  {href: '/admin/submissions', label: 'Berichten', hint: 'Inbox beheren', icon: Mail, tint: 'bg-pink-100 text-primary-text'},
  {href: '/admin/gebruikers', label: 'Gebruikers', hint: 'Beheerders en helpers', icon: Users, tint: 'bg-blue-100 text-blue-600'},
  websiteLink,
];

const redacteurLinks: QuickLink[] = [contentLink, bestellingenLink, websiteLink];

function QuickLinkItem({link}: Readonly<{link: QuickLink}>) {
  const Icon = link.icon;
  const className = 'flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';
  const inner = (
    <>
      <span className={`w-10 h-10 shrink-0 rounded-button flex items-center justify-center ${link.tint}`}>
        <Icon className='w-5 h-5' aria-hidden='true' />
      </span>
      <span className='min-w-0'>
        <span className='flex items-center gap-1 font-medium text-gray-800 text-sm'>
          {link.label}
          {link.external && <ExternalLink className='w-3.5 h-3.5 text-gray-400' aria-hidden='true' />}
        </span>
        <span className='block text-xs text-gray-500'>{link.hint}</span>
      </span>
    </>
  );

  return link.external
    ? (
      <a href={link.href} target='_blank' rel='noopener noreferrer' className={className}>
        {inner}
        <span className='sr-only'>(opent in een nieuw tabblad)</span>
      </a>
    )
    : <Link href={link.href} className={className}>{inner}</Link>;
}

function QuickLinks({links}: Readonly<{links: QuickLink[]}>) {
  return (
    <div className='bg-white rounded-card shadow-base overflow-hidden'>
      <div className='p-4 sm:p-5 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Zap className='w-4 h-4 text-purple-500' aria-hidden='true' />
          Snelle links
        </h2>
      </div>
      <div className='p-3 sm:p-4 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-2'>
        {links.map(link => <QuickLinkItem key={link.href} link={link} />)}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const data = await fetchDashboardData();

  return (
    <>
      {/* Statistics Cards */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        <Link href='/admin/submissions' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
          <div className='flex items-center justify-between mb-2'>
            <Inbox className='w-5 h-5 text-gray-500 group-hover:text-primary transition-colors' />
            <span className='text-xs text-gray-500'>totaal</span>
          </div>
          <p className='text-2xl sm:text-3xl font-bold text-gray-800'>{data.totalCount}</p>
          <p className='text-xs text-gray-500 mt-1'>Berichten</p>
        </Link>
        <Link href='/admin/submissions' className='bg-white p-4 sm:p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow group'>
          <div className='flex items-center justify-between mb-2'>
            <Mail className='w-5 h-5 text-primary' />
            {data.unreadCount > 0 && (
              <span className='bg-primary text-white text-xs px-2 py-0.5 rounded-full'>nieuw</span>
            )}
          </div>
          <p className='text-2xl sm:text-3xl font-bold text-primary'>{data.unreadCount}</p>
          <p className='text-xs text-gray-500 mt-1'>Ongelezen</p>
        </Link>
      </div>

      {/* Content Lists Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        {/* Recent Submissions */}
        <div className='bg-white rounded-card shadow-base overflow-hidden'>
          <div className='p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between'>
            <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
              <Mail className='w-4 h-4 text-primary' />
              Recente berichten
            </h2>
            <Link href='/admin/submissions' className='text-primary-text text-sm hover:underline flex items-center gap-1'>
              Alles bekijken
              <ArrowRight className='w-3 h-3' />
            </Link>
          </div>
          <div className='divide-y divide-gray-50'>
            {data.recentSubmissions.length === 0
              ? (
                <div className='p-4 text-center text-gray-500 text-sm'>
                  Geen berichten
                </div>
              )
              : (
                data.recentSubmissions.map(submission => (
                  <Link
                    key={submission.id}
                    href={`/admin/submissions/${submission.id}`}
                    className={`block p-3 sm:p-4 hover:bg-gray-50 transition-colors ${submission.readAt ? '' : 'bg-primary/5'}`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          {!submission.readAt && (
                            <span className='w-2 h-2 bg-primary rounded-full flex-shrink-0' />
                          )}
                          <span className='font-medium text-gray-800 truncate text-sm'>
                            {submission.name}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500 mt-0.5 truncate'>
                          {submission.subject} - {submission.message.slice(0, 50)}...
                        </p>
                      </div>
                      <span className='text-xs text-gray-500 whitespace-nowrap'>
                        {formatDateTime(submission.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
          </div>
        </div>

        {/* Quick Links */}
        <QuickLinks links={adminLinks} />
      </div>
    </>
  );
}

export default async function AdminDashboardPage() {
  const session = await requireEditorSession();

  // Messages contain parents' personal data: a redacteur gets a welcome only.
  if (session.user.role !== 'admin') {
    return (
      <div className='space-y-6 sm:space-y-8'>
        <DashboardHeader />
        <p className='text-gray-600'>Je bent ingelogd als redacteur. Hier bewerk je de inhoud van de website.</p>
        <QuickLinks links={redacteurLinks} />
      </div>
    );
  }

  return (
    <div className='space-y-6 sm:space-y-8'>
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
