import {and, isNull} from 'drizzle-orm';
import {Toaster} from 'sonner';
import {requireEditorSession} from '@lib/auth/require-admin';
import {db, feedback, submissions} from '@lib/db';
import {AdminSidebar} from '@features/admin/admin-sidebar';
import {SessionValidator} from '@features/admin/session-validator';

async function getUnreadCounts(): Promise<{unreadFeedback: number; unreadSubmissions: number}> {
  try {
    const [unreadFeedbackItems, unreadSubmissionItems] = await Promise.all([
      db.query.feedback.findMany({
        where: isNull(feedback.readAt),
        columns: {id: true},
      }),
      db.query.submissions.findMany({
        where: and(isNull(submissions.readAt), isNull(submissions.archivedAt)),
        columns: {id: true},
      }),
    ]);
    return {
      unreadFeedback: unreadFeedbackItems.length,
      unreadSubmissions: unreadSubmissionItems.length,
    };
  } catch {
    return {unreadFeedback: 0, unreadSubmissions: 0};
  }
}

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Proxy already checked the cookie; this also checks the user still exists and has a role.
  // Every page repeats the check, because layouts don't re-render on client navigation.
  const session = await requireEditorSession();

  // Messages are for admins only; a redacteur gets no counts.
  const isAdmin = session.user.role === 'admin';
  const unreadCounts = isAdmin ? await getUnreadCounts() : undefined;

  return (
      <div className='min-h-screen bg-gray-50 flex'>
        <Toaster position='top-right' richColors closeButton />
        <SessionValidator />
        <AdminSidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
          unreadCounts={unreadCounts}
        />
        <main id='main-content' className='flex-1 overflow-auto pt-16 lg:pt-0'>
          <div className='p-4 sm:p-6 lg:p-8'>
            {children}
          </div>
        </main>
      </div>
  );
}
