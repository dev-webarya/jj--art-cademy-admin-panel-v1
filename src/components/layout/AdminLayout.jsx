import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaBell, FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <FaBars className="text-xl" />
                        </button>

                        {/* Search */}
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                            <FaBell className="text-xl" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                3
                            </span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 mesh-gradient">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
