import Image from 'next/image';
import Link from 'next/link';

type HeaderProperties = {
	navigation: {value: {data: {links: Array<{url: string; text: string}>}}};
};

const Header: React.FC<Readonly<HeaderProperties>> = ({navigation}) => {
	const {links} = navigation.value.data;

	return (
		<header className='flex justify-center min-h-72'>
			<div className='py-10 header text-base-content max-w-[1280px] flex w-full items-center gap-10'>
				<Image priority width={1600} height={890} src='/Logo.jpeg' alt='Logo' className='w-[300px] h-auto' />
				<nav className='flex flex-row gap-20 text-lg font-bold'>
					{links.map(item => (
						<Link key={item.url} href={item.url} className='link link-hover'>{item.text}</Link>
					))}
				</nav>
			</div>
		</header>
	);
};

export default Header;
