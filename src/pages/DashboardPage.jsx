import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserGraduate, FaCalendarCheck, FaShoppingCart, FaMoneyBillWave, FaClock } from 'react-icons/fa';
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
        { path: '/users', name: 'Manage Users', icon: FaUsers, color: 'from-blue-500 to-cyan-500' },
        { path: '/enrollments', name: 'Enrollments', icon: FaUserGraduate, color: 'from-green-500 to-emerald-500' },
        { path: '/sessions', name: 'Class Sessions', icon: FaClock, color: 'from-purple-500 to-pink-500' },
        { path: '/orders', name: 'View Orders', icon: FaShoppingCart, color: 'from-orange-500 to-amber-500' },
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
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    Dashboard Overview
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Welcome back! Here's what's happening with your art school today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Users" value={stats.totalUsers} icon={FaUsers} color="blue" />
                <StatsCard title="Enrollments" value={stats.totalEnrollments} icon={FaUserGraduate} color="green" />
                <StatsCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={FaMoneyBillWave} color="purple" />
                <StatsCard title="Total Orders" value={stats.totalOrders} icon={FaShoppingCart} color="orange" />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {quickLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                        <Link
                            key={index}
                            to={link.path}
                            className={`bg-gradient-to-br ${link.color} text-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:scale-105`}
                        >
                            <Icon className="text-4xl mb-4" />
                            <h3 className="text-xl font-bold">{link.name}</h3>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Recent Enrollments
                    </h2>
                    <Link
                        to="/enrollments"
                        className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                    >
                        View All →
                    </Link>
                </div>
                <div className="space-y-4">
                    {recentEnrollments.length > 0 ? (
                        recentEnrollments.map((enrollment, index) => (
                            <div
                                key={enrollment.id || index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800 dark:text-white">
                                        {enrollment.studentName || enrollment.userName || 'Student'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {enrollment.className || 'Art Class'} • {new Date(enrollment.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${enrollment.status === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : enrollment.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {enrollment.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No recent enrollments
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
