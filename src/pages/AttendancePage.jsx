import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaClipboardCheck, FaEye, FaCheckCircle, FaTimes, FaSync, FaCheckDouble, FaTimesCircle } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, StatusBadge, Card } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';
import StudentAttendanceHistory from '../components/attendance/StudentAttendanceHistory';

const AttendancePage = () => {
    const toast = useToast();
    const [viewMode, setViewMode] = useState('SESSIONS'); // 'SESSIONS' or 'HISTORY'
    const [sessions, setSessions] = useState([]);
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.SESSIONS.GET_ALL, { page, size: 20 });
            setSessions(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    const loadEligibleStudents = useCallback(async () => {
        try {
            const response = await api.get(API_ENDPOINTS.ATTENDANCE.ELIGIBLE_STUDENTS);
            setEligibleStudents(response || []);
        } catch (error) {
            console.error('Failed to load eligible students:', error);
        }
    }, []);

    useEffect(() => {
        loadSessions();
        loadEligibleStudents();
    }, [loadSessions, loadEligibleStudents]);

    // Open Take Attendance modal for a session
    const openAttendanceModal = (session) => {
        setSelectedSession(session);
        // Initialize attendance list with approved students
        setAttendanceList(eligibleStudents.map(s => {
            const isAtThreshold = s.isOverLimit || (s.attendedSessions >= s.allowedSessions);
            return {
                studentId: s.studentId,
                studentName: s.studentName,
                rollNo: s.rollNo,
                studentEmail: s.studentEmail,
                attendedSessions: s.attendedSessions,
                allowedSessions: s.allowedSessions,
                isOverLimit: isAtThreshold,
                isPresent: !isAtThreshold, // Default to Absent if over limit
                remarks: '',
            };
        }));
        setAttendanceModalOpen(true);
    };

    // Open View Attendance modal for a session
    const openViewModal = (session) => {
        setSelectedSession(session);
        setViewModalOpen(true);
    };

    // Submit attendance for all students
    const handleSubmitAttendance = async () => {
        if (!selectedSession) return;

        setFormLoading(true);
        try {
            await api.post(API_ENDPOINTS.ATTENDANCE.MARK, {
                sessionId: selectedSession.id,
                attendanceList: attendanceList.map(a => ({
                    studentId: a.studentId,
                    isPresent: a.isPresent,
                    remarks: a.remarks,
                })),
            });
            toast.success('Attendance submitted successfully!');
            setAttendanceModalOpen(false);
            loadSessions(); // Refresh to show updated attendance counts
        } catch (error) {
            toast.error(error.message || 'Failed to submit attendance');
        } finally {
            setFormLoading(false);
        }
    };

    // Toggle single student attendance
    const toggleStudentAttendance = (studentId) => {
        setAttendanceList(prev => prev.map(a => {
            if (a.studentId !== studentId) return a;

            // If currently absent (trying to mark present) AND over limit
            if (!a.isPresent && a.isOverLimit) {
                const confirmed = window.confirm(
                    `Student ${a.studentName} has exceeded their allowed sessions (${a.attendedSessions}/${a.allowedSessions}).\n\nAre you sure you want to mark them as PRESENT?`
                );
                if (!confirmed) return a; // Do nothing if cancelled
            }

            return { ...a, isPresent: !a.isPresent };
        }));
    };

    // Mark all present
    const markAllPresent = () => {
        setAttendanceList(prev => prev.map(a => ({ ...a, isPresent: true })));
    };

    // Mark all absent
    const markAllAbsent = () => {
        setAttendanceList(prev => prev.map(a => ({ ...a, isPresent: false })));
    };

    // Update remarks
    const updateRemarks = (studentId, remarks) => {
        setAttendanceList(prev => prev.map(a =>
            a.studentId === studentId ? { ...a, remarks } : a
        ));
    };

    // Session columns
    const columns = [
        { key: 'topic', label: 'Topic', sortable: true },
        { key: 'sessionDate', label: 'Date' },
        { key: 'startTime', label: 'Start' },
        { key: 'endTime', label: 'End' },
        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        {
            key: 'totalStudents',
            label: 'Students',
            render: (val) => val || 0
        },
        {
            key: 'presentCount',
            label: 'Present',
            render: (val, row) => (
                <span className="text-green-600 font-semibold">{val || 0}</span>
            )
        },
        {
            key: 'absentCount',
            label: 'Absent',
            render: (val) => (
                <span className="text-red-500 font-semibold">{val || 0}</span>
            )
        },
        {
            key: 'attendanceTaken',
            label: 'Attendance',
            render: (val) => val ? (
                <span className="flex items-center gap-1 text-green-600">
                    <FaCheckCircle /> Taken
                </span>
            ) : (
                <span className="flex items-center gap-1 text-yellow-600">
                    <FaTimes /> Pending
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => openAttendanceModal(row)}
                        className="!py-1 !px-3"
                    >
                        <FaClipboardCheck /> Take Attendance
                    </Button>
                    {row.attendanceTaken && (
                        <button
                            onClick={() => openViewModal(row)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="View Attendance"
                        >
                            <FaEye />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const presentCount = attendanceList.filter(a => a.isPresent).length;
    const absentCount = attendanceList.filter(a => !a.isPresent).length;

    const filteredSessions = useMemo(() => {
        if (!searchTerm) return sessions;
        const term = searchTerm.toLowerCase();
        return sessions.filter(s =>
            (s.topic || '').toLowerCase().includes(term) ||
            (s.sessionDate || '').toLowerCase().includes(term) ||
            (s.status || '').toLowerCase().includes(term)
        );
    }, [sessions, searchTerm]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Attendance Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage class attendance and view student history</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-[#2c2c2c] p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('SESSIONS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'SESSIONS'
                            ? 'bg-white dark:bg-gray-600 shadow text-[#2383e2] dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Class Sessions
                    </button>
                    <button
                        onClick={() => setViewMode('HISTORY')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'HISTORY'
                            ? 'bg-white dark:bg-gray-600 shadow text-[#2383e2] dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        Student History
                    </button>
                </div>
            </div>

            {/* Over Limit Warning Alert */}
            {eligibleStudents.filter(s => s.isOverLimit).length > 0 && (
                <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <FaTimesCircle className="text-xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
                            Attention Needed: Students Over Limit
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            The following students have exceeded their allowed sessions for this month.
                            Please review their status before taking attendance.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {eligibleStudents.filter(s => s.isOverLimit).map(student => (
                                <span key={student.studentId} className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded text-xs font-semibold text-orange-700 dark:text-orange-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                    {student.studentName} ({student.attendedSessions}/{student.allowedSessions})
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'SESSIONS' ? (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <Card className="p-3">
                            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sessions</h3>
                            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{pagination?.totalElements || 0}</p>
                        </Card>
                        <Card className="p-3">
                            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Eligible Students</h3>
                            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{eligibleStudents.length}</p>
                        </Card>
                        <Card className="p-3">
                            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Attendance Taken</h3>
                            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                {sessions.filter(s => s.attendanceTaken).length}/{sessions.length}
                            </p>
                        </Card>
                    </div>

                    {/* Sessions Table */}
                    <DataTable
                        columns={columns}
                        data={filteredSessions}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={setPage}
                        onSearch={setSearchTerm}
                        searchPlaceholder="Search sessions..."
                        emptyMessage="No sessions found"
                        actions={
                            <Button variant="secondary" onClick={() => { loadSessions(); loadEligibleStudents(); }}>
                                <FaSync /> Refresh
                            </Button>
                        }
                    />
                </>
            ) : (
                <StudentAttendanceHistory />
            )}

            {/* Take Attendance Modal */}
            <Modal
                isOpen={attendanceModalOpen}
                onClose={() => setAttendanceModalOpen(false)}
                title={`Take Attendance - ${selectedSession?.topic || ''}`}
                size="xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAttendanceModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitAttendance} loading={formLoading}>
                            <FaCheckDouble /> Submit Attendance ({presentCount} Present, {absentCount} Absent)
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Session Info */}
                    <div className="bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedSession?.sessionDate}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Time</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedSession?.startTime} - {selectedSession?.endTime}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</span>
                                <StatusBadge status={selectedSession?.status} />
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Meeting</span>
                                <a href={selectedSession?.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#2383e2] dark:text-purple-400 hover:underline font-medium">Join</a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" size="sm" onClick={markAllPresent}>
                            <FaCheckCircle /> Mark All Present
                        </Button>
                        <Button variant="secondary" size="sm" onClick={markAllAbsent}>
                            <FaTimesCircle /> Mark All Absent
                        </Button>
                    </div>

                    {/* Attendance Sheet */}
                    {eligibleStudents.length > 0 ? (
                        <div className="border border-gray-200 dark:border-[#2f2f2f] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-[#252525]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sessions</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {attendanceList.map((student) => (
                                        <tr
                                            key={student.studentId}
                                            className={`transition-colors ${student.isOverLimit
                                                ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500' // Highlight overlimit
                                                : student.isPresent
                                                    ? 'bg-green-50 dark:bg-green-900/10'
                                                    : 'bg-red-50 dark:bg-red-900/10'
                                                }`}
                                        >
                                            <td className="px-4 py-3 font-mono font-semibold text-gray-800 dark:text-gray-100">
                                                {student.rollNo}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-100">{student.studentName}</p>
                                                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                                                    {student.isOverLimit && (
                                                        <span className="inline-block mt-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                                                            ⚠️ Threshold Reached
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={student.isOverLimit ? 'text-orange-600 font-bold' : ''}>
                                                    {student.attendedSessions}/{student.allowedSessions}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => toggleStudentAttendance(student.studentId)}
                                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${student.isPresent
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                        }`}
                                                >
                                                    {student.isPresent ? (
                                                        <span className="flex items-center gap-1"><FaCheckCircle /> Present</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1"><FaTimes /> Absent</span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Input
                                                    placeholder="Optional remarks..."
                                                    value={student.remarks}
                                                    onChange={(e) => updateRemarks(student.studentId, e.target.value)}
                                                    className="!py-1 !text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-lg font-semibold">No Eligible Students</p>
                            <p className="text-sm">Students need approved enrollment and active subscription to appear here.</p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="flex justify-end gap-4 text-sm font-semibold">
                        <span className="text-green-600">Present: {presentCount}</span>
                        <span className="text-red-500">Absent: {absentCount}</span>
                        <span className="text-gray-600 dark:text-gray-400">Total: {attendanceList.length}</span>
                    </div>
                </div>
            </Modal>

            {/* View Attendance Modal */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title={`Attendance Record - ${selectedSession?.topic || ''}`}
                size="lg"
            >
                <div className="space-y-4">
                    {/* Session Info */}
                    <div className="bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedSession?.sessionDate}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Time</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedSession?.startTime} - {selectedSession?.endTime}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Present</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{selectedSession?.presentCount || 0}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Absent</span>
                                <span className="font-bold text-red-600 dark:text-red-400">{selectedSession?.absentCount || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Records */}
                    {selectedSession?.attendanceRecords?.length > 0 ? (
                        <div className="border border-gray-200 dark:border-[#2f2f2f] rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-[#252525]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sessions</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marked At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedSession.attendanceRecords.map((record, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 dark:text-gray-100">{record.studentName}</p>
                                                <p className="text-xs text-gray-500">{record.studentEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {record.isPresent ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                                                        <FaCheckCircle /> Present
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                                                        <FaTimes /> Absent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={record.isOverLimit ? 'text-red-500 font-semibold' : ''}>
                                                    {record.sessionCountThisMonth || 0}
                                                    {record.isOverLimit && ' (Over Limit!)'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {record.remarks || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {record.markedAt ? new Date(record.markedAt).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-500">No attendance records found</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AttendancePage;
