import React from 'react';
import { SunIcon, MoonIcon, MenuIcon } from './icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onMenuClick }) => {
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <header className="py-3 px-4 md:px-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="Toggle history sidebar"
                >
                    <MenuIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                    <span className="text-blue-600 dark:text-blue-500">Token</span>Slicer
                </h1>
            </div>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
        </header>
    );
};

export default Header;
