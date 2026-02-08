import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    FaHome, FaUsers, FaUserGraduate, FaCalendarCheck, FaMoneyBillWave,
    FaClock, FaClipboardList, FaImages, FaPalette, FaStore,
    FaPaintBrush, FaCalendarAlt, FaGraduationCap, FaShoppingCart,
    FaChevronDown, FaChevronRight, FaSignOutAlt, FaTimes, FaBars
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
                order                { path: '/payments', name: 'Payments', icon: FaMoneyBillWave },
            ],
        },
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            onClick={() => window.innerWidth < 1024 && onClose?.()}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
            }
        >
            <item.icon className="text-lg" />
            <span className="font-medium">{item.name}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } lg:static lg:transform-none flex flex-col`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <FaPalette className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Art Academy</h1>
                                <p className="text-xs text-gray-400">Admin Panel</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
                    {navGroups.map((group) => (
                        <div key={group.id}>
                            {group.title && (
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300"
                                >
                                    {group.title}
                                    {expandedGroups.includes(group.id) ? (
                                        <FaChevronDown className="text-xs" />
                                    ) : (
                                        <FaChevronRight className="text-xs" />
                                    )}
                                </button>
                            )}
                            <div
                                className={`space-y-1 ${group.title && !expandedGroups.includes(group.id) ? 'hidden' : ''
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
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
