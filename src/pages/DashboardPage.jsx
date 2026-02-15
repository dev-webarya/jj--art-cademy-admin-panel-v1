import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaCalendarCheck, FaShoppingCart, FaMoneyBillWave, FaClock, FaArrowRight } from 'react-icons/fa';
import { StatsCard } from '../components/ui/FormComponents';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEnrollments: 0,
        totalOrders: 0,
        totalSessions: 0,
        pendingEnrollments: 0,
        activeSubscriptions: 0,
    });
    const [recentEnrollments, setRecentEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Fetch data in parallel
            const [usersRes, enrollmentsRes, ordersRes, sessionsRes, subscriptionsRes] = await Promise.all([
                getPaginated(API_ENDPOINTS.USERS.GET_ALL, { size: 1 }).catch(() => ({ totalElements: 0 })),
                getPaginated(API_ENDPOINTS.ENROLLMENTS.GET_ALL, { size: 5 }).catch(() => ({ content: [], totalElements: 0 })),
                getPaginated(API_ENDPOINTS.ORDERS.GET_ALL, { size: 1 }).catch(() => ({ totalElements: 0 })),
                getPaginated(API_ENDPOINTS.SESSIONS.GET_ALL, { size: 1 }).catch(() => ({ totalElements: 0 })),
                getPaginated(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL, { size: 1 }).catch(() => ({ totalElements: 0 })),
            ]);

            setStats({
                totalUsers: usersRes.totalElements || 0,
                totalEnrollments: enrollmentsRes.totalElements || 0,
                totalOrders: ordersRes.totalElements || 0,
                totalSessions: sessionsRes.totalElements || 0,
                pendingEnrollments: enrollmentsRes.content?.filter(e => e.status === 'PENDING').length || 0,
                activeSubscriptions: subscriptionsRes.totalElements || 0,
            });

            setRecentEnrollments(enrollmentsRes.content || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickLinks = [
        { path: '/users', name: 'Manage Users', icon: FaUsers, color: 'text-blue-600 dark:text-blue-400' },
        { path: '/enrollments', name: 'Enrollments', icon: FaUserGraduate, color: 'text-green-600 dark:text-green-400' },
        { path: '/sessions', name: 'Class Sessions', icon: FaClock, color: 'text-[#2383e2] dark:text-purple-400' },
        { path: '/orders', name: 'View Orders', icon: FaShoppingCart, color: 'text-orange-600 dark:text-orange-400' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Welcome back! Here's what's happening with your art school today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatsCard title="Total Users" value={stats.totalUsers} icon={FaUsers} color="blue" />
                <StatsCard title="Enrollments" value={stats.totalEnrollments} icon={FaUserGraduate} color="green" />
                <StatsCard title="Subscriptions" value={stats.activeSubscriptions} icon={FaMoneyBillWave} color="purple" />
                <StatsCard title="Total Orders" value={stats.totalOrders} icon={FaShoppingCart} color="orange" />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={index}
                            to={link.path}
                            className="group bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#2f2f2f] rounded-lg p-3.5 hover:border-gray-300 dark:hover:border-[#404040] transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Icon className={`text-base ${link.color}`} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.name}</span>
                                </div>
                                <FaArrowRight className="text-xs text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors" />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-[#2f2f2f]">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-[#2f2f2f]">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Recent Enrollments
                    </h2>
                    <Link
                        to="/enrollments"
                        className="text-[#2383e2] hover:text-[#0b6cd8] text-xs font-medium"
                    >
                        View all →
                    </Link>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-[#2a2a2a]">
                    {recentEnrollments.length > 0 ? (
                        recentEnrollments.map((enrollment, index) => (
                            <div
                                key={enrollment.id || index}
                                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 dark:hover:bg-[#2a2a2a] transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {enrollment.studentName || enrollment.userName || 'Student'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        {enrollment.className || 'Art Class'} · {new Date(enrollment.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${enrollment.status === 'PENDING'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/40'
                                        : enrollment.status === 'APPROVED'
                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40'
                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
                                        }`}
                                >
                                    {enrollment.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-center text-sm py-8">
                            No recent enrollments
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
