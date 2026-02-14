import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaSave, FaExclamationTriangle, FaUserGraduate, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Button, Card, StatusBadge, Input } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const AttendanceTakingPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [session, setSession] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mode, setMode] = useState('initial'); // 'initial', 'new', 'edit'

    // Load Session Details
    const loadSession = useCallback(async () => {
        try {
            const data = await api.get(API_ENDPOINTS.SESSIONS.GET_BY_ID(sessionId));
            setSession(data);

            if (data.attendanceTaken) {
                // If attendance already taken, ask user what to do (Edit or View?)
                // For now, we'll auto-trigger a confirmation logic or just set mode to 'existing'
                // But let's fetch the existing attendance first to be ready
                loadExistingAttendance();
            } else {
                setMode('new');
                loadEligibleStudents();
            }
        } catch (error) {
            toast.error('Failed to load session details');
            navigate('/attendance');
        }
    }, [sessionId, navigate, toast]);

    // Load Eligible Students (For NEW attendance)
    const loadEligibleStudents = async () => {
        try {
            const data = await api.get(API_ENDPOINTS.ATTENDANCE.ELIGIBLE_STUDENTS);
            // Default all to Absent (isPresent: false)
            const initializedStudents = data.map(s => ({
                studentId: s.studentId,
                studentName: s.studentName,
                rollNo: s.rollNo,
                studentEmail: s.studentEmail,
                allowedSessions: s.allowedSessions || 0,
                attendedSessions: s.attendedSessions || 0,
                isOverLimit: s.isOverLimit || false,
                isPresent: false, // DEFAULT ABSENT
                remarks: '',
            }));
            setStudents(initializedStudents);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    // Load Existing Attendance (For EDIT mode)
    const loadExistingAttendance = async () => {
        try {
            // We need an endpoint that returns the session WITH attendance records
            // API_ENDPOINTS.SESSIONS.GET_WITH_ATTENDANCE(id) seems correct
            const data = await api.get(API_ENDPOINTS.SESSIONS.GET_WITH_ATTENDANCE(sessionId));

            if (data && data.attendanceRecords) {
                const mappedStudents = data.attendanceRecords.map(r => ({
                    studentId: r.studentId, // Note: verify if backend returns studentId or just embedded details
                    studentName: r.studentName,
                    rollNo: r.studentId, // Fallback if rollNo missing in record
                    studentEmail: r.studentEmail,
                    // For existing records, we might not have 'allowedSessions' / 'isOverLimit' directly 
                    // unless the DTO includes it. 
                    // If not, we might need to merge with eligibleStudents or just rely on what we have.
                    // Let's assume the record has basics.
                    isPresent: r.isPresent,
                    remarks: r.remarks || '',
                    // We might miss overlimit info here if the backend DTO doesn't have it.
                    // For safety, let's try to keeping 'Over Limit' UI logic simple or fetch eligible to merge.
                    // For now, simple mapping.
                }));

                // MERGE with eligible students to get OverLimit info? 
                // That's safer. Let's fetch eligible students too.
                const eligibleData = await api.get(API_ENDPOINTS.ATTENDANCE.ELIGIBLE_STUDENTS);

                const mergedStudents = eligibleData.map(eligible => {
                    const existingRecord = data.attendanceRecords.find(r => r.studentId === eligible.studentId);
                    return {
                        ...eligible,
                        isPresent: existingRecord ? existingRecord.isPresent : false, // Default absent if not in record
                        remarks: existingRecord ? existingRecord.remarks : '',
                        // Keep eligible stats
                        attendedSessions: eligible.attendedSessions,
                        allowedSessions: eligible.allowedSessions,
                        isOverLimit: eligible.isOverLimit,
                    };
                });

                setStudents(mergedStudents);
                setMode('edit');
            }
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load existing attendance');
        }
    };

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const handleToggleAttendance = (studentId) => {
        setStudents(prev => prev.map(s => {
            if (s.studentId !== studentId) return s;

            // Check OverLimit before marking Present
            if (!s.isPresent && s.isOverLimit) {
                if (!window.confirm(`⚠️ WARNING: ${s.studentName} is over their session limit! Mark Present anyway?`)) {
                    return s;
                }
            }

            return { ...s, isPresent: !s.isPresent };
        }));
    };

    const handleRemarkChange = (studentId, val) => {
        setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, remarks: val } : s));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post(API_ENDPOINTS.ATTENDANCE.MARK, {
                sessionId: sessionId,
                attendanceList: students.map(s => ({
                    studentId: s.studentId,
                    isPresent: s.isPresent,
                    remarks: s.remarks,
                })),
            });
            toast.success('Attendance saved successfully!');
            navigate('/attendance');
        } catch (error) {
            toast.error(error.message || 'Failed to submit attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const markAll = (status) => {
        if (status === true) {
            if (!window.confirm('Mark ALL students as Present?')) return;
        }
        setStudents(prev => prev.map(s => ({ ...s, isPresent: status })));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>;
    }

    const presentCount = students.filter(s => s.isPresent).length;
    const absentCount = students.filter(s => !s.isPresent).length;

    return (
        <div className="p-6 animate-fadeIn max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/attendance')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <FaArrowLeft className="text-xl text-gray-600 dark:text-gray-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {mode === 'edit' ? 'Edit Attendance' : 'Take Attendance'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm">
                        <span className="font-semibold text-[#2383e2]">{session?.topic}</span>
                        <span>•</span>
                        <FaCalendarAlt /> {session?.sessionDate}
                        <span>•</span>
                        <FaClock /> {session?.startTime} - {session?.endTime}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="bg-white dark:bg-[#2c2c2c] px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex gap-4 text-sm font-medium">
                        <span className="text-green-600 flex items-center gap-1"><FaCheckCircle /> Present: {presentCount}</span>
                        <span className="text-red-500 flex items-center gap-1"><FaTimesCircle /> Absent: {absentCount}</span>
                        <span className="text-gray-500">Total: {students.length}</span>
                    </div>
                </div>
            </div>

            {/* Warning Banner for Overlimit Students */}
            {students.some(s => s.isOverLimit && s.isPresent) && (
                <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center gap-3 text-orange-800 dark:text-orange-200">
                    <FaExclamationTriangle className="text-xl" />
                    <div>
                        <span className="font-bold">Warning:</span> You are marking students as present who have exceeded their session limit.
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-sm border border-gray-200 dark:border-[#2f2f2f] overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-[#2c2c2c] border-b border-gray-200 dark:border-[#2f2f2f] flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700 dark:text-gray-200">Student List</h2>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => markAll(false)}>Mark All Absent</Button>
                        <Button size="sm" variant="secondary" onClick={() => markAll(true)}>Mark All Present</Button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {students.map((student) => (
                        <div
                            key={student.studentId}
                            className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#2c2c2c]/50 transition-colors
                                ${student.isPresent ? 'bg-green-50/50 dark:bg-green-900/10' : ''}
                                ${student.isOverLimit ? 'border-l-4 border-orange-400 pl-3' : 'pl-4'}
                            `}
                        >
                            <div className="flex items-center gap-4 min-w-[300px]">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                    ${student.isOverLimit
                                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                    }`}
                                >
                                    {student.studentName.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{student.studentName}</h3>
                                        {student.isOverLimit && (
                                            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200">
                                                OVER LIMIT
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">{student.studentEmail}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Sessions: <span className={student.isOverLimit ? 'text-orange-600 font-bold' : ''}>
                                            {student.attendedSessions} / {student.allowedSessions}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 px-4">
                                <Input
                                    placeholder="Add remarks..."
                                    value={student.remarks}
                                    onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                                    className="!text-sm !py-1.5"
                                />
                            </div>

                            <div className="flex items-center gap-4 min-w-[200px] justify-end">
                                <button
                                    onClick={() => handleToggleAttendance(student.studentId)}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2383e2] focus:ring-offset-2
                                        ${student.isPresent ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}
                                    `}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                                            ${student.isPresent ? 'translate-x-9' : 'translate-x-1'}
                                        `}
                                    />
                                    <span className={`absolute text-[10px] font-bold text-white
                                        ${student.isPresent ? 'left-2' : 'right-2'}
                                    `}>
                                        {student.isPresent ? 'YES' : 'NO'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {students.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No eligible students found for this session.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 fixed bottom-6 right-6 z-10">
                <Button variant="secondary" size="lg" onClick={() => navigate('/attendance')} className="shadow-lg">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} loading={submitting} size="lg" className="shadow-lg min-w-[150px]">
                    <FaSave /> Save Attendance
                </Button>
            </div>
        </div>
    );
};

export default AttendanceTakingPage;
