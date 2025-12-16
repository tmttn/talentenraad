# Contact Form Admin System Implementation Plan

## Overview
Add a complete admin system for managing contact form submissions with:
- Vercel Postgres database for storing submissions
- NextAuth.js with Auth0 for admin authentication
- Resend for notification emails
- Admin dashboard to view/manage submissions
- URL parameter prefilling for contact form subject

## Key Decisions
- **User seeding**: Allow-list via `ADMIN_EMAILS` environment variable
- **Auth restriction**: No domain restriction, any Auth0 account in allow-list can sign in
- **Roles**: Admin only (no viewer role) - simplifies the system

---

## Phase 1: Dependencies & Database Setup

### 1.1 Install packages
```bash
npm install @vercel/postgres drizzle-orm next-auth@5 resend
npm install -D drizzle-kit
```

### 1.2 Create database schema
**File: `app/lib/db/schema.ts`**
```typescript
import {pgTable, text, timestamp, uuid} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name'),
	auth0Id: text('auth0_id').unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const submissions = pgTable('submissions', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	phone: text('phone'),
	subject: text('subject').notNull(),
	message: text('message').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	readAt: timestamp('read_at'),
	archivedAt: timestamp('archived_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
```

### 1.3 Create database client
**File: `app/lib/db/index.ts`**
```typescript
import {sql} from '@vercel/postgres';
import {drizzle} from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

export const db = drizzle(sql, {schema});
export * from './schema';
```

### 1.4 Create Drizzle config
**File: `drizzle.config.ts`**
```typescript
import type {Config} from 'drizzle-kit';

export default {
	schema: './app/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
} satisfies Config;
```

### 1.5 Add npm scripts to package.json
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Phase 2: Authentication (NextAuth.js v5)

### 2.1 Auth configuration
**File: `app/lib/auth/config.ts`**
```typescript
import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import {db, users} from '@/lib/db';
import {eq} from 'drizzle-orm';

const getAdminEmails = (): string[] => {
	const emails = process.env.ADMIN_EMAILS ?? '';
	return emails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
};

export const {handlers, signIn, signOut, auth} = NextAuth({
	providers: [
		Auth0({
			clientId: process.env.AUTH0_CLIENT_ID!,
			clientSecret: process.env.AUTH0_CLIENT_SECRET!,
			issuer: process.env.AUTH0_ISSUER,
		}),
	],
	callbacks: {
		async signIn({user, account}) {
			if (account?.provider !== 'auth0' || !user.email) {
				return false;
			}

			const adminEmails = getAdminEmails();
			const userEmail = user.email.toLowerCase();

			// Only allow emails in the allow-list
			if (!adminEmails.includes(userEmail)) {
				return false;
			}

			// Check if user exists, create if not
			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, userEmail),
			});

			if (!existingUser) {
				await db.insert(users).values({
					email: userEmail,
					name: user.name ?? null,
					auth0Id: account.providerAccountId,
				});
			} else if (!existingUser.auth0Id) {
				await db.update(users)
					.set({auth0Id: account.providerAccountId, updatedAt: new Date()})
					.where(eq(users.id, existingUser.id));
			}

			return true;
		},
		async session({session}) {
			if (session.user?.email) {
				const dbUser = await db.query.users.findFirst({
					where: eq(users.email, session.user.email.toLowerCase()),
				});
				if (dbUser) {
					session.user.id = dbUser.id;
				}
			}
			return session;
		},
	},
	pages: {
		signIn: '/admin/login',
		error: '/admin/login',
	},
});
```

### 2.2 Extend NextAuth types
**File: `types/next-auth.d.ts`**
```typescript
import type {DefaultSession} from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
		} & DefaultSession['user'];
	}
}
```

### 2.3 API route handlers
**File: `app/api/auth/[...nextauth]/route.ts`**
```typescript
import {handlers} from '@/lib/auth/config';
export const {GET, POST} = handlers;
```

---

## Phase 3: Email Notifications (Resend)

### 3.1 Email service
**File: `app/lib/email/resend.ts`**
```typescript
import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactNotificationData = {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
	submissionId: string;
};

const subjectLabels: Record<string, string> = {
	vraag: 'Algemene vraag',
	activiteit: 'Vraag over activiteit',
	lidmaatschap: 'Lid worden',
	sponsoring: 'Sponsoring',
	anders: 'Anders',
};

export async function sendContactNotification(data: ContactNotificationData) {
	const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'voorzitterouderraad@talentenhuis.be';
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://talentenraad.be';
	const subjectLabel = subjectLabels[data.subject] ?? data.subject;

	await resend.emails.send({
		from: 'Talentenraad <noreply@talentenraad.be>',
		to: adminEmail,
		subject: `Nieuw contactbericht: ${subjectLabel}`,
		html: `
			<h2>Nieuw contactbericht ontvangen</h2>
			<p><strong>Van:</strong> ${data.name} (${data.email})</p>
			${data.phone ? `<p><strong>Telefoon:</strong> ${data.phone}</p>` : ''}
			<p><strong>Onderwerp:</strong> ${subjectLabel}</p>
			<hr />
			<p><strong>Bericht:</strong></p>
			<p>${data.message.replaceAll('\n', '<br />')}</p>
			<hr />
			<p><a href="${siteUrl}/admin/submissions/${data.submissionId}">Bekijk in admin dashboard</a></p>
		`,
	});
}
```

---

## Phase 4: Update Contact Form API

### 4.1 Modify existing API route
**File: `app/api/contact/route.ts`** (MODIFY)
- Import db and submissions from `@/lib/db`
- Import sendContactNotification from `@/lib/email/resend`
- Replace Builder.io storage with Drizzle insert
- Call sendContactNotification (non-blocking with .catch())

---

## Phase 5: URL Parameter Support for Contact Form

### 5.1 Update contact form component
**File: `app/features/contact/contact-form.tsx`** (MODIFY)
- Add `useSearchParams()` hook
- Read `onderwerp` parameter from URL
- Initialize subject state with URL param value
- Wrap component with Suspense

---

## Phase 6: Update CTAs with URL Parameters

### 6.1 Activity detail page
**File: `app/(main)/activiteiten/[slug]/page.tsx`** (MODIFY line 257)
```typescript
// Change from:
<AnimatedButton href='/contact'>
// To:
<AnimatedButton href='/contact?onderwerp=activiteit'>
```

### 6.2 Activities list
**File: `app/features/activities/activities-list.tsx`** (MODIFY line 235)
```typescript
// Change from:
<AnimatedLink href='/contact' size='sm'>
// To:
<AnimatedLink href='/contact?onderwerp=activiteit' size='sm'>
```

---

## Phase 7: Admin Route Group & Layout

### 7.1 Admin layout with auth check
**File: `app/(admin)/layout.tsx`**
- Check session with `auth()`
- Redirect to `/admin/login` if not authenticated
- Render AdminSidebar + children

### 7.2 Admin sidebar component
**File: `app/features/admin/admin-sidebar.tsx`**
- Logo
- Navigation: Dashboard, Berichten
- User info with avatar
- Sign out button

---

## Phase 8: Admin Pages

### 8.1 Login page
**File: `app/(admin)/admin/login/page.tsx`**
- Auth0 sign-in button with server action

### 8.2 Dashboard page
**File: `app/(admin)/admin/page.tsx`**
- Stats: Total submissions, Unread count

### 8.3 Submissions list page
**File: `app/(admin)/admin/submissions/page.tsx`**
- Fetch non-archived submissions
- Render SubmissionsTable

### 8.4 Submissions table component
**File: `app/features/admin/submissions-table.tsx`**
- Columns: checkbox, status, from, subject, date, actions
- Row highlighting for unread
- Bulk actions toolbar

### 8.5 Submission detail page
**File: `app/(admin)/admin/submissions/[id]/page.tsx`**
- Full submission details
- Auto-mark as read
- Actions: archive, delete

### 8.6 Submission actions component
**File: `app/features/admin/submission-actions.tsx`**
- Archive and delete buttons

---

## Phase 9: Admin API Routes

### 9.1 Submissions bulk actions
**File: `app/api/admin/submissions/route.ts`**
- PATCH handler for: markRead, markUnread, archive, delete
- Auth check required

---

## Phase 10: Environment Variables

```bash
# Vercel Postgres (auto-added by Vercel integration)
POSTGRES_URL=

# NextAuth.js
AUTH_SECRET=          # openssl rand -base64 32

# Auth0
AUTH0_CLIENT_ID=      # Auth0 Dashboard
AUTH0_CLIENT_SECRET=  # Auth0 Dashboard
AUTH0_ISSUER=         # https://YOUR_AUTH0_DOMAIN (e.g., https://dev-xxx.us.auth0.com)

# Admin allow-list (comma-separated)
ADMIN_EMAILS=admin@example.com,another@example.com

# Resend
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=voorzitterouderraad@talentenhuis.be
```

---

## Phase 11: Testing & Linting

### 11.1 Update jest.config.ts
Add coverage exclusions:
- `app/\\(admin\\)/**`
- `app/lib/db/**`

### 11.2 Pre-commit checklist
```bash
npm run test:xo
npm test
npm run build
```

---

## File Structure Summary

```
app/
├── (admin)/
│   ├── layout.tsx
│   └── admin/
│       ├── page.tsx
│       ├── login/page.tsx
│       └── submissions/
│           ├── page.tsx
│           └── [id]/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── admin/submissions/route.ts
│   └── contact/route.ts (MODIFY)
├── features/
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── submissions-table.tsx
│   │   └── submission-actions.tsx
│   └── contact/contact-form.tsx (MODIFY)
├── lib/
│   ├── auth/config.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   └── email/resend.ts
drizzle.config.ts
types/next-auth.d.ts
```

---

## Critical Files to Modify
1. `app/api/contact/route.ts`
2. `app/features/contact/contact-form.tsx`
3. `app/(main)/activiteiten/[slug]/page.tsx`
4. `app/features/activities/activities-list.tsx`
5. `package.json`
6. `jest.config.ts`

## Implementation Order
1. Install dependencies
2. Database schema and client
3. NextAuth configuration
4. Resend email service
5. Update contact API (DB + email)
6. Update contact form (URL params)
7. Update CTAs
8. Admin layout and sidebar
9. Admin pages
10. Admin API routes
11. Linting, tests, build
12. Commit and push
