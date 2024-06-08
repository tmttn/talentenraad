import Image from 'next/image';

type HeaderProps = {
    navigation: { value: { data: { links?: { url: string, text: string }[] } } };
};

const Header: React.FC<Readonly<HeaderProps>> = ({ navigation }) => {

    const links = navigation.value.data.links;

    return (
        <header className="flex justify-center min-h-72">
            <div className="py-10 header text-base-content max-w-[1280px] flex w-full items-center gap-10">
                <Image priority width={1600} height={890} src="/Logo.jpeg" alt="Logo" className="w-[300px] h-auto" />
                <nav className="flex flex-row gap-20 text-lg font-bold">
                    {links?.map((item) => (
                        <a key={item.url} href={item.url} className="link link-hover">{item.text}</a>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;