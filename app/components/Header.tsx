import Image from 'next/image';
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex justify-center min-h-72">
            <div className="py-10 header text-base-content max-w-[1280px] flex w-full items-center gap-10">
                <Image width={1600} height={890} src="/Logo.jpeg" alt="Logo" className="w-[300px] h-auto" />
                <nav className="flex flex-row gap-20 text-lg font-bold">
                    <a className="link link-hover">Coffee</a>
                    <a className="link link-hover">Espresso</a>
                    <a className="link link-hover">Cappuccino</a>
                    <a className="link link-hover">Latte</a>
                </nav>
            </div>
        </header>
    );
};

export default Header;