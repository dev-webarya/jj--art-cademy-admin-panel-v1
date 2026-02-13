import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaHome, FaUsers, FaUserGraduate, FaCalendarCheck, FaMoneyBillWave,
    FaClock, FaClipboardList, FaImages, FaPalette, FaStore,
    FaPaintBrush, FaCalendarAlt, FaGraduationCap, FaShoppingCart,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState(['lms', 'shop']);

    const toggleGroup = (group) => {
        setExpandedGroups((prev) =>
            prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
        );
    };

    const navGroups = [
        {
            id: 'main',
            items: [
                { path: '/dashboard', name: 'Dashboard', icon: FaHome },
                { path: '/users', name: 'Users', icon: FaUsers },
            ],
        },
        {
            id: 'lms',
            title: 'LMS Management',
            items: [
                { path: '/enrollments', name: 'Enrollments', icon: FaUserGraduate },
                { path: '/subscriptions', name: 'Subscriptions', icon: FaMoneyBillWave },
                { path: '/sessions', name: 'Class Sessions', icon: FaClock },
                { path: '/attendance', name: 'Attendance', icon: FaClipboardList },
                { path: '/events', name: 'Events', icon: FaCalendarAlt },
                { path: '/lms-gallery', name: 'Student Gallery', icon: FaImages },
            ],
        },
        {
            id: 'shop',
            title: 'Shop & Content',
            items: [
                { path: '/art-works', name: 'Art Works', icon: FaPalette },
                { path: '/materials', name: 'Materials', icon: FaPaintBrush },
                { path: '/galleries', name: 'Galleries', icon: FaStore },
                { path: '/exhibitions', name: 'Exhibitions', icon: FaCalendarCheck },
                { path: '/classes', name: 'Classes', icon: FaGraduationCap },
                { path: '/orders', name: 'Orders', icon: FaShoppingCart },
            ],
        },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose?.()}
            className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-colors duration-100 ${isActive
                    ? 'bg-gray-200/80 dark:bg-[#363636] text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c2c2c] hover:text-gray-900 dark:hover:text-gray-200'
                }`
            }
        >
            <item.icon className="text-sm opacity-60 flex-shrink-0" />
            <span>{item.name}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-60 bg-[#fbfbfa] dark:bg-[#202020] border-r border-gray-200/80 dark:border-[#2f2f2f] z-50 transform transition-transform duration-200 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } lg:static lg:transform-none flex flex-col`}
            >
                {/* Logo */}
                <div className="h-12 flex items-center justify-between px-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#2383e2] flex items-center justify-center flex-shrink-0">
                            <FaPalette className="text-white text-xs" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">Art Academy</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
                    {navGroups.map((group) => (
                        <div key={group.id} className={group.title ? 'mt-4' : ''}>
                            {group.title && (
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="w-full flex items-center justify-between px-3 py-1 mb-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-400"
                                >
                                    {group.title}
                                    {expandedGroups.includes(group.id) ? (
                                        <FaChevronDown className="text-[9px]" />
                                    ) : (
                                        <FaChevronRight className="text-[9px]" />
                                    )}
                                </button>
                            )}
                            <div
                                className={`space-y-0.5 ${group.title && !expandedGroups.includes(group.id) ? 'hidden' : ''
                                    }`}
                            >
                                {group.items.map((item) => (
                                    <NavItem key={item.path} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-2 border-t border-gray-200/80 dark:border-[#2f2f2f]">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                        <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[11px] font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-[#2c2c2c] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                        <FaSignOutAlt className="text-xs" />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
