import type {Metadata} from 'next';
import {Suspense} from 'react';
import {count, isNull, desc} from 'drizzle-orm';
import Link from 'next/link';
import {
  Inbox,
  Mail,
  Calendar,
  Newspaper,
  ArrowRight,
  FileText,
  Users,
  Zap,
  Heart,
} from 'lucide-react';
import {db, submissions} from '@lib/db';
import {getTotalClapsStats} from '@lib/claps-admin';
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

type ClapsStats = {
  totalClaps: number;
  newsClaps: number;
  activitiesClaps: number;
  topContent: Array<{contentType: string; contentId: string; totalClaps: number}>;
};

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
  clapsStats: ClapsStats;
};

async function fetchDashboardData(): Promise<DashboardData> {
  // Default values for when database is unavailable
  let totalCount = 0;
  let unreadCount = 0;
  let recentSubmissions: DashboardData['recentSubmissions'] = [];
  let clapsStats: ClapsStats = {
    totalClaps: 0, newsClaps: 0, activitiesClaps: 0, topContent: [],
  };

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

      // Fetch claps stats
      clapsStats = await getTotalClapsStats();
    } catch {
      // Silently fail - dashboard will show zeros for submissions
    }
  }

  return {
    totalCount,
    unreadCount,
    recentSubmissions,
    clapsStats,
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

function ClapsOverview({clapsStats}: Readonly<{clapsStats: ClapsStats}>) {
  return (
    <div className='bg-white rounded-card shadow-base overflow-hidden'>
      <div className='p-4 sm:p-5 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Heart className='w-4 h-4 text-pink-500 fill-pink-500' />
          Bezoekers Claps
        </h2>
      </div>
      <div className='p-4 sm:p-5'>
        <div className='grid grid-cols-3 gap-4'>
          {/* Total Claps */}
          <div className='flex flex-col items-center'>
            <div className='w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center'>
              <span className='text-xl font-bold text-pink-600'>{clapsStats.totalClaps}</span>
            </div>
            <p className='text-xs text-gray-500 mt-2'>Totaal</p>
          </div>

          {/* News Claps */}
          <div className='flex flex-col items-center justify-center'>
            <div className='flex items-center gap-1 text-blue-600'>
              <Newspaper className='w-4 h-4' />
              <p className='text-2xl font-bold'>{clapsStats.newsClaps}</p>
            </div>
            <p className='text-xs text-gray-500'>Nieuws</p>
          </div>

          {/* Activities Claps */}
          <div className='flex flex-col items-center justify-center'>
            <div className='flex items-center gap-1 text-green-600'>
              <Calendar className='w-4 h-4' />
              <p className='text-2xl font-bold'>{clapsStats.activitiesClaps}</p>
            </div>
            <p className='text-xs text-gray-500'>Activiteiten</p>
          </div>
        </div>

        {clapsStats.totalClaps > 0 && (
          <div className='mt-4 flex items-center gap-2 text-sm text-pink-700 bg-pink-50 px-3 py-2 rounded-button'>
            <Heart className='w-4 h-4 fill-pink-500' />
            <span>Bezoekers waarderen je content!</span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickLinks() {
  return (
    <div className='bg-white rounded-card shadow-base overflow-hidden'>
      <div className='p-4 sm:p-5 border-b border-gray-100'>
        <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
          <Zap className='w-4 h-4 text-purple-500' />
          Snelle links
        </h2>
      </div>
      <div className='p-3 sm:p-4 grid grid-cols-2 gap-2'>
        <Link
          href='/admin/submissions'
          className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
        >
          <div className='w-10 h-10 bg-primary/10 rounded-button flex items-center justify-center'>
            <FileText className='w-5 h-5 text-primary' />
          </div>
          <div>
            <p className='font-medium text-gray-800 text-sm'>Berichten</p>
            <p className='text-xs text-gray-500'>Inbox beheren</p>
          </div>
        </Link>
        <Link
          href='/admin/gebruikers'
          className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
        >
          <div className='w-10 h-10 bg-blue-100 rounded-button flex items-center justify-center'>
            <Users className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <p className='font-medium text-gray-800 text-sm'>Gebruikers</p>
            <p className='text-xs text-gray-500'>Beheerders</p>
          </div>
        </Link>
        <Link
          href='/'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-3 p-3 rounded-button hover:bg-gray-50 transition-colors'
        >
          <div className='w-10 h-10 bg-green-100 rounded-button flex items-center justify-center'>
            <ArrowRight className='w-5 h-5 text-green-600' />
          </div>
          <div>
            <p className='font-medium text-gray-800 text-sm'>Website</p>
            <p className='text-xs text-gray-500'>Bekijk live site</p>
          </div>
        </Link>
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

      {/* Claps Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        <ClapsOverview clapsStats={data.clapsStats} />
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
        <QuickLinks />
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className='space-y-6 sm:space-y-8'>
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
