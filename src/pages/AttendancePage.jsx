import { useState, useEffect, useCallback } from 'react';
import { FaClipboardCheck, FaEye, FaCheckCircle, FaTimes, FaSync, FaCheckDouble, FaTimesCircle } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, StatusBadge, Card } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const AttendancePage = () => {
    const toast = useToast();
    const [sessions, setSessions] = useState([]);
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);

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
        // Initialize attendance list with all eligible students as present
        setAttendanceList(eligibleStudents.map(s => ({
            studentId: s.studentId,
            studentName: s.studentName,
            rollNo: s.rollNo,
            studentEmail: s.studentEmail,
            attendedSessions: s.attendedSessions,
            allowedSessions: s.allowedSessions,
            isOverLimit: s.isOverLimit,
            isPresent: true,
            remarks: '',
        })));
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
        setAttendanceList(prev => prev.map(a =>
            a.studentId === studentId ? { ...a, isPresent: !a.isPresent } : a
        ));
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

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Attendance Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Take attendance for class sessions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <h3 className="text-lg font-semibold mb-1">Total Sessions</h3>
                    <p className="text-3xl font-bold">{pagination?.totalElements || 0}</p>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                    <h3 className="text-lg font-semibold mb-1">Eligible Students</h3>
                    <p className="text-3xl font-bold">{eligibleStudents.length}</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <h3 className="text-lg font-semibold mb-1">Attendance Taken</h3>
                    <p className="text-3xl font-bold">
                        {sessions.filter(s => s.attendanceTaken).length}/{sessions.length}
                    </p>
                </Card>
            </div>

            {/* Sessions Table */}
            <DataTable
                columns={columns}
                data={sessions}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                emptyMessage="No sessions found"
                actions={
                    <Button variant="secondary" onClick={() => { loadSessions(); loadEligibleStudents(); }}>
                        <FaSync /> Refresh
                    </Button>
                }
            />

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
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedSession?.sessionDate}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Time</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedSession?.startTime} - {selectedSession?.endTime}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</span>
                                <StatusBadge status={selectedSession?.status} />
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Meeting</span>
                                <a href={selectedSession?.meetingLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Join</a>
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
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
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
                                            className={`transition-colors ${student.isPresent
                                                ? 'bg-green-50 dark:bg-green-900/10'
                                                : 'bg-red-50 dark:bg-red-900/10'
                                                }`}
                                        >
                                            <td className="px-4 py-3 font-mono font-semibold text-gray-800 dark:text-white">
                                                {student.rollNo}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-white">{student.studentName}</p>
                                                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={student.isOverLimit ? 'text-red-500 font-semibold' : ''}>
                                                    {student.attendedSessions}/{student.allowedSessions}
                                                    {student.isOverLimit && ' (Over!)'}
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
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedSession?.sessionDate}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Time</span>
                                <span className="font-medium text-gray-900 dark:text-white">{selectedSession?.startTime} - {selectedSession?.endTime}</span>
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
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
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
                                                <p className="font-medium text-gray-800 dark:text-white">{record.studentName}</p>
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
