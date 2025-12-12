'use client';

import Image from 'next/image';
import Link from 'next/link';

type HeaderProperties = {
	navigation: {value: {data: {links: Array<{url: string; text: string}>}}};
};

function Header({navigation}: Readonly<HeaderProperties>) {
	const links = navigation?.value?.data?.links ?? [];

	return (
		<header role='banner' className='flex justify-center min-h-72'>
			<div className='py-10 header text-base-content max-w-[1280px] flex w-full items-center gap-10'>
				<Image priority width={300} height={200} src='/Logo.jpeg' alt='Logo' className='w-[300px] h-auto' />
				<nav role='navigation' className='flex flex-row gap-20 text-lg font-bold'>
					{links.map(item => (
						<Link key={item.url} href={item.url} className='link link-hover'>{item.text}</Link>
					))}
				</nav>
			</div>
		</header>
	);
}

export const HeaderInfo = {
	name: 'Header',
	component: Header,
	inputs: [
		{
			name: 'navigation',
			type: 'reference',
			model: 'navigation-list',
			required: true,
		},
	],
};
