'use client';

import {useState, useEffect, useCallback} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {ChevronLeftIcon, ChevronRightIcon} from '@/components/ui/icons';

type AdminSidebarProperties = {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
};

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

const navItems = [
	{href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'},
	{href: '/admin/submissions', label: 'Berichten', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'},
	{href: '/admin/activiteiten', label: 'Activiteiten', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
	{href: '/admin/nieuws', label: 'Nieuws', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'},
	{href: '/admin/aankondigingen', label: 'Aankondigingen', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'},
	{href: '/admin/gebruikers', label: 'Gebruikers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'},
];

export function AdminSidebar({user}: Readonly<AdminSidebarProperties>) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

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
					<Link href='/admin' className='hidden lg:flex w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mx-auto'>
						<span className='text-primary font-bold text-lg'>T</span>
					</Link>
				)}
				{/* Close button for mobile */}
				<button
					type='button'
					onClick={() => setIsOpen(false)}
					className='lg:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
					aria-label='Sluit menu'
				>
					<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
					</svg>
				</button>
			</div>
			<nav className={`flex-1 ${isCollapsed ? 'lg:p-2' : 'p-4'} overflow-y-auto`}>
				<ul className='space-y-1'>
					{navItems.map(item => (
						<li key={item.href}>
							<Link
								href={item.href}
								onClick={() => setIsOpen(false)}
								title={isCollapsed ? item.label : undefined}
								className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center lg:px-2' : 'px-4'} py-3 rounded-lg transition-colors ${
									isActive(item.href)
										? 'bg-primary/10 text-primary font-medium'
										: 'text-gray-600 hover:bg-gray-100'
								}`}
							>
								<svg className='w-5 h-5 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d={item.icon} />
								</svg>
								<span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
			{/* Collapse toggle button - only on desktop */}
			<div className='hidden lg:flex p-2 border-t border-gray-200 justify-center'>
				<button
					type='button'
					onClick={toggleCollapsed}
					title={isCollapsed ? 'Uitklappen' : 'Inklappen'}
					className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
				>
					{isCollapsed ? <ChevronRightIcon size='md' /> : <ChevronLeftIcon size='md' />}
				</button>
			</div>
			<div className={`${isCollapsed ? 'lg:p-2' : 'p-4'} border-t border-gray-200`}>
				<div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''} mb-4`}>
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
					<div className={`text-sm min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
						<p className='font-medium text-gray-800 truncate'>{user.name ?? 'Gebruiker'}</p>
						<p className='text-gray-500 text-xs truncate'>{user.email}</p>
					</div>
				</div>
				<a
					href='/auth/logout'
					title={isCollapsed ? 'Uitloggen' : undefined}
					className={`flex items-center gap-3 w-full ${isCollapsed ? 'lg:justify-center lg:px-2' : 'px-4'} py-3 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
				>
					<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
					</svg>
					<span className={isCollapsed ? 'lg:hidden' : ''}>Uitloggen</span>
				</a>
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
					className='p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
					aria-label='Open menu'
				>
					<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
					</svg>
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
					fixed lg:static inset-y-0 left-0 z-50
					w-72 ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} bg-white border-r border-gray-200
					flex flex-col min-h-screen
					transform transition-all duration-300 ease-in-out
					${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
				`}
			>
				{sidebarContent}
			</aside>
		</>
	);
}
