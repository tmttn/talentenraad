'use client';

import {useState, useEffect, useCallback, useMemo} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {
	Home,
	Mail,
	Calendar,
	Newspaper,
	Megaphone,
	Sparkles,
	Users,
	History,
	Bell,
	Search,
	Database,
	Building2,
	ChevronLeft,
	ChevronRight,
	X,
	Menu,
	LogOut,
	type LucideIcon,
} from 'lucide-react';
import {useFlags} from '@lib/flags-client';
import type {FlagValues} from '@generated/hypertune/hypertune';

type UnreadCounts = {
	unreadFeedback: number;
	unreadSubmissions: number;
};

type AdminSidebarProperties = {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
	unreadCounts?: UnreadCounts;
};

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

type NavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	flag?: keyof FlagValues;
};

const navItems: NavItem[] = [
	{href: '/admin', label: 'Dashboard', icon: Home},
	{href: '/admin/submissions', label: 'Berichten', icon: Mail, flag: 'adminSubmissions'},
	{href: '/admin/activiteiten', label: 'Activiteiten', icon: Calendar, flag: 'adminActivities'},
	{href: '/admin/nieuws', label: 'Nieuws', icon: Newspaper, flag: 'adminNews'},
	{href: '/admin/aankondigingen', label: 'Aankondigingen', icon: Megaphone, flag: 'adminAnnouncements'},
	{href: '/admin/notificaties', label: 'Notificaties', icon: Bell, flag: 'adminNotifications'},
	{href: '/admin/seo', label: 'SEO', icon: Search},
	{href: '/admin/sponsors', label: 'Sponsors', icon: Building2},
	{href: '/admin/data', label: 'Data', icon: Database},
	{href: '/admin/decoraties', label: 'Decoraties', icon: Sparkles, flag: 'adminDecorations'},
	{href: '/admin/gebruikers', label: 'Gebruikers', icon: Users, flag: 'adminUsers'},
	{href: '/admin/audit-logs', label: 'Audit Logs', icon: History, flag: 'adminAuditLogs'},
];

export function AdminSidebar({user, unreadCounts}: Readonly<AdminSidebarProperties>) {
	const pathname = usePathname();
	const flags = useFlags();

	// Calculate total unread for the Berichten nav item
	const totalUnread = (unreadCounts?.unreadFeedback ?? 0) + (unreadCounts?.unreadSubmissions ?? 0);
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Filter nav items based on feature flags
	const visibleNavItems = useMemo(() =>
		navItems.filter(item => !item.flag || flags[item.flag]),
	[flags]);

	// Load collapsed state from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
		if (stored !== null) {
			setIsCollapsed(stored === 'true');
		}
	}, []);

	const toggleCollapsed = useCallback(() => {
		setIsCollapsed(previous => {
			const newValue = !previous;
			localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
			return newValue;
		});
	}, []);

	const isActive = (href: string) => {
		if (href === '/admin') {
			return pathname === '/admin';
		}

		return pathname.startsWith(href);
	};

	// Close sidebar on route change
	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	// Close sidebar on escape key
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			setIsOpen(false);
		}
	}, []);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	// Prevent body scroll when sidebar is open on mobile
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	const sidebarContent = (
		<>
			<div className={`p-4 ${isCollapsed ? 'lg:px-2' : 'lg:p-6'} border-b border-gray-200 flex items-center justify-between`}>
				<div className={isCollapsed ? 'lg:hidden' : ''}>
					<Link href='/admin' onClick={() => setIsOpen(false)}>
						<Image
							src='/Logo.png'
							alt='Talentenraad'
							width={120}
							height={80}
							className='h-10 w-auto'
						/>
					</Link>
					<p className='text-xs text-gray-500 mt-2'>Admin Dashboard</p>
				</div>
				{/* Collapsed logo - just show T */}
				{isCollapsed && (
					<Link href='/admin' className='hidden lg:flex w-10 h-10 rounded-button bg-primary/10 items-center justify-center mx-auto'>
						<span className='text-primary font-bold text-lg'>T</span>
					</Link>
				)}
				{/* Close button for mobile */}
				<button
					type='button'
					onClick={() => setIsOpen(false)}
					className='lg:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-button transition-colors'
					aria-label='Sluit menu'
				>
					<X className='w-6 h-6' />
				</button>
			</div>
			<nav className={`flex-1 ${isCollapsed ? 'lg:p-2' : 'p-4'} overflow-y-auto`}>
				<ul className='space-y-1'>
					{visibleNavItems.map(item => {
						const Icon = item.icon;
						const showBadge = item.href === '/admin/submissions' && totalUnread > 0;
						return (
							<li key={item.href}>
								<Link
									href={item.href}
									onClick={() => setIsOpen(false)}
									title={isCollapsed ? item.label : undefined}
									className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center lg:px-2' : 'px-4'} py-3 rounded-button transition-colors ${
										isActive(item.href)
											? 'bg-primary/10 text-primary-text font-medium'
											: 'text-gray-600 hover:bg-gray-100'
									}`}
								>
									<span className='relative'>
										<Icon className='w-5 h-5 flex-shrink-0' strokeWidth={1.5} />
										{showBadge && isCollapsed && (
											<span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full hidden lg:block' />
										)}
									</span>
									<span className={`flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
									{showBadge && !isCollapsed && (
										<span className='px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full min-w-[1.25rem] text-center'>
											{totalUnread > 99 ? '99+' : totalUnread}
										</span>
									)}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>
			{/* Collapse toggle button - only on desktop */}
			<div className='hidden lg:flex p-2 border-t border-gray-200 justify-center'>
				<button
					type='button'
					onClick={toggleCollapsed}
					title={isCollapsed ? 'Uitklappen' : 'Inklappen'}
					className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-button transition-colors'
				>
					{isCollapsed ? <ChevronRight className='w-5 h-5' /> : <ChevronLeft className='w-5 h-5' />}
				</button>
			</div>
			<div className={`${isCollapsed ? 'lg:p-2' : 'p-4'} border-t border-gray-200`}>
				<div className={`flex flex-col items-center ${isCollapsed ? '' : 'mb-4'}`}>
					{user.image ? (
						<Image
							src={user.image}
							alt=''
							width={40}
							height={40}
							className='rounded-full flex-shrink-0'
							title={isCollapsed ? (user.name ?? user.email ?? '') : undefined}
						/>
					) : (
						<div
							className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'
							title={isCollapsed ? (user.name ?? user.email ?? '') : undefined}
						>
							<span className='text-primary font-medium'>
								{user.name?.charAt(0) ?? user.email?.charAt(0) ?? '?'}
							</span>
						</div>
					)}
					<div className={`text-sm text-center mt-2 ${isCollapsed ? 'lg:hidden' : ''}`}>
						<p className='font-medium text-gray-800 truncate'>{user.name ?? 'Gebruiker'}</p>
						<p className='text-gray-500 text-xs truncate'>{user.email}</p>
					</div>
				</div>
				<a
					href='/api/admin/auth/logout'
					title={isCollapsed ? 'Uitloggen' : undefined}
					className={`flex items-center justify-center gap-3 w-full ${isCollapsed ? 'lg:px-2' : 'px-4'} py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-button transition-colors`}
				>
					<LogOut className='w-5 h-5' strokeWidth={1.5} />
					<span className={isCollapsed ? 'lg:hidden' : ''}>Uitloggen</span>
				</a>
				{!isCollapsed && (
					<p className='text-xs text-gray-400 text-center mt-3 hidden lg:block'>v{process.env.NEXT_PUBLIC_APP_VERSION}</p>
				)}
			</div>
		</>
	);

	return (
		<>
			{/* Mobile header with hamburger */}
			<div className='lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between'>
				<button
					type='button'
					onClick={() => setIsOpen(true)}
					className='p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-button transition-colors'
					aria-label='Open menu'
				>
					<Menu className='w-6 h-6' />
				</button>
				<Link href='/admin'>
					<Image
						src='/Logo.png'
						alt='Talentenraad'
						width={100}
						height={67}
						className='h-8 w-auto'
					/>
				</Link>
				<div className='w-10' /> {/* Spacer for centering */}
			</div>

			{/* Mobile overlay */}
			{isOpen && (
				<div
					className='lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity'
					onClick={() => setIsOpen(false)}
					aria-hidden='true'
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
					fixed inset-y-0 left-0 z-50
					w-72 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} bg-white border-r border-gray-200
					flex flex-col
					transform transition-all duration-slow ease-in-out
					${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
				`}
			>
				{sidebarContent}
			</aside>

			{/* Spacer to push content right of fixed sidebar on desktop */}
			<div
				className='hidden lg:block flex-shrink-0 transition-all duration-slow'
				style={{width: isCollapsed ? '4rem' : '16rem'}}
			/>
		</>
	);
}
