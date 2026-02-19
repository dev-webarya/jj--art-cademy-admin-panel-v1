import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaSun, FaMoon } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex h-screen bg-[#f7f7f5] dark:bg-[#191919]">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="h-12 bg-white/95 dark:bg-[#202020]/95 border-b border-gray-200/80 dark:border-[#2f2f2f] flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            <FaBars className="text-base" />
                        </button>
                        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:block">
                            Art Academy · Admin
                        </h2>
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-6 py-5 lg:px-8 flex flex-col">
                    <Outlet />
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
