'use client';

import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';

type AdminSidebarProperties = {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
};

const navItems = [
	{href: '/admin', label: 'Dashboard'},
	{href: '/admin/submissions', label: 'Berichten'},
];

export function AdminSidebar({user}: Readonly<AdminSidebarProperties>) {
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/admin') {
			return pathname === '/admin';
		}

		return pathname.startsWith(href);
	};

	return (
		<aside className='w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen'>
			<div className='p-6 border-b border-gray-200'>
				<Link href='/admin'>
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
			<nav className='flex-1 p-4'>
				<ul className='space-y-2'>
					{navItems.map(item => (
						<li key={item.href}>
							<Link
								href={item.href}
								className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
									isActive(item.href)
										? 'bg-primary/10 text-primary font-medium'
										: 'text-gray-600 hover:bg-gray-100'
								}`}
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>
			</nav>
			<div className='p-4 border-t border-gray-200'>
				<div className='flex items-center gap-3 mb-4'>
					{user.image && (
						<Image
							src={user.image}
							alt=''
							width={32}
							height={32}
							className='rounded-full'
						/>
					)}
					<div className='text-sm min-w-0 flex-1'>
						<p className='font-medium text-gray-800 truncate'>{user.name}</p>
						<p className='text-gray-500 text-xs truncate'>{user.email}</p>
					</div>
				</div>
				<a
					href='/auth/logout'
					className='block w-full px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors text-left'
				>
					Uitloggen
				</a>
			</div>
		</aside>
	);
}
