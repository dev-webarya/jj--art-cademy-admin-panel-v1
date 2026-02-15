import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaCalendarAlt, FaCheckCircle, FaTimes, FaFilter } from 'react-icons/fa';
import { Button, Input, Select, Card } from '../ui/FormComponents';
import api from '../../api/apiService';
import { API_ENDPOINTS } from '../../api/endpoints';
import { useToast } from '../ui/Toast';

const StudentAttendanceHistory = () => {
    const toast = useToast();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

    // Load eligible students for the dropdown
    useEffect(() => {
        const loadStudents = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.ATTENDANCE.ELIGIBLE_STUDENTS);
                setStudents(response || []);
            } catch (error) {
                console.error('Failed to load students:', error);
                toast.error('Failed to load student list');
            }
        };
        loadStudents();
    }, [toast]);

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!studentSearch) return students;
        const term = studentSearch.toLowerCase();
        return students.filter(s =>
            (s.studentName || '').toLowerCase().includes(term) ||
            (s.rollNo || '').toString().toLowerCase().includes(term) ||
            (s.studentEmail || '').toLowerCase().includes(term)
        );
    }, [students, studentSearch]);

    // Fetch logs when student/month/year changes
    const fetchLogs = async () => {
        if (!selectedStudent) return;

        setLoading(true);
        try {
            const response = await api.get(API_ENDPOINTS.ATTENDANCE.LOGS(selectedStudent, year, month));
            setLogs(response || []);

            // Calculate stats
            const present = response.filter(l => l.status === 'PRESENT').length;
            const absent = response.filter(l => l.status === 'ABSENT').length;
            setStats({ present, absent, total: response.length });

        } catch (error) {
            console.error('Failed to fetch logs:', error);
            toast.error('Failed to fetch attendance history');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white dark:bg-[#252525] p-4 rounded-xl border border-gray-100 dark:border-[#2f2f2f]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Student
                        </label>
                        <div className="relative mb-2">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search by name or roll no..."
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-[#3d3d3d] bg-white dark:bg-[#2c2c2c] text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-[#2383e2] focus:border-transparent transition-all"
                            />
                        </div>
                        <Select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            placeholder="Choose a student..."
                            options={filteredStudents.map(s => ({
                                value: s.studentId,
                                label: `${s.studentName} (${s.rollNo})`
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year
                        </label>
                        <Input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Month
                        </label>
                        <Select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            placeholder="Select month..."
                            options={Array.from({ length: 12 }, (_, i) => ({
                                value: i + 1,
                                label: new Date(0, i).toLocaleString('default', { month: 'long' })
                            }))}
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={fetchLogs}
                        disabled={!selectedStudent || loading}
                        className="w-full md:w-auto"
                    >
                        <FaFilter /> Filter Logs
                    </Button>
                </div>
            </Card>

            {/* Stats Summary */}
            {logs.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4 text-center">
                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase">Present</h4>
                        <p className="text-lg font-semibold text-green-800 dark:text-green-300">{stats.present}</p>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4 text-center">
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase">Absent</h4>
                        <p className="text-lg font-semibold text-red-800 dark:text-red-300">{stats.absent}</p>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4 text-center">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase">Total</h4>
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">{stats.total}</p>
                    </Card>
                </div>
            )}

            {/* Logs Table */}
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-sm border border-gray-200 dark:border-[#2f2f2f] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[#2c2c2c]/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Counts</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Loading attendance logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        {selectedStudent ? 'No attendance records found for this period.' : 'Select a student to view history.'}
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {log.sessionDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.status === 'PRESENT' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <FaCheckCircle className="mr-1" /> Present
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                    <FaTimes className="mr-1" /> Absent
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className={log.isOverLimit ? 'text-red-600 font-bold' : ''}>
                                                {log.sessionCountThisMonth}
                                                {log.isOverLimit && ' (Over Limit)'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {log.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceHistory;
