import { useState, useEffect, useCallback } from 'react';
import { FaCheck, FaTimes, FaEye, FaPlus } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, Textarea, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, ENROLLMENT_STATUS, SCHEDULE_OPTIONS } from '../api/endpoints';

const EnrollmentsPage = () => {
    const toast = useToast();
    const [enrollments, setEnrollments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        classId: '',
        parentGuardianName: '',
        studentAge: '',
        schedule: '',
        additionalMessage: '',
        address: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // Load classes for dropdown
    const loadClasses = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_CLASSES.GET_ALL, { size: 100 });
            setClasses(response.content || []);
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    }, []);

    const loadEnrollments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.ENROLLMENTS.GET_ALL, { page, size: 20 });
            setEnrollments(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadClasses();
        loadEnrollments();
    }, [loadClasses, loadEnrollments]);

    const handleStatusUpdate = async (enrollmentId, status) => {
        try {
            await api.put(API_ENDPOINTS.ENROLLMENTS.UPDATE_STATUS(enrollmentId), {
                status: status,
                adminNotes: ""
            });
            toast.success(`Enrollment ${status.toLowerCase()}`);
            loadEnrollments();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openModal = (mode, enrollment = null) => {
        setModalMode(mode);
        setSelectedEnrollment(enrollment);
        if (mode === 'create') {
            setFormData({
                userId: '',
                classId: '',
                parentGuardianName: '',
                studentAge: '',
                schedule: '',
                additionalMessage: '',
                address: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            // Prepare data following API schema
            const requestData = {
                userId: formData.userId,
                classId: formData.classId,
                parentGuardianName: formData.parentGuardianName,
                studentAge: parseInt(formData.studentAge),
                schedule: formData.schedule,
                additionalMessage: formData.additionalMessage,
                address: formData.address,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone,
            };

            await api.post(API_ENDPOINTS.ENROLLMENTS.CREATE, requestData);
            toast.success('Enrollment created successfully');
            setModalOpen(false);
            loadEnrollments();
        } catch (error) {
            toast.error(error.message || 'Failed to create enrollment');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        {
            key: 'rollNo',
            label: 'Roll No',
            sortable: true,
            render: (val) => val || '-'
        },
        {
            key: 'studentName',
            label: 'Student',
            sortable: true,
            render: (val, row) => val || row.userName || '-'
        },
        {
            key: 'className',
            label: 'Class',
            render: (val) => val || '-'
        },
        {
            key: 'schedule',
            label: 'Schedule',
            render: (val) => val?.replace(/_/g, ' ') || '-'
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal('view', row)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View Details"
                    >
                        <FaEye />
                    </button>
                    {row.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(row.id, 'APPROVED')}
                                className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                title="Approve"
                            >
                                <FaCheck />
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(row.id, 'REJECTED')}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                title="Reject"
                            >
                                <FaTimes />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const scheduleOptions = SCHEDULE_OPTIONS.map(s => ({ value: s, label: s.replace(/_/g, ' ') }));
    const classOptions = classes.map(c => ({ value: c.id, label: c.title || c.name }));

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Enrollments</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage student enrollments and approvals</p>
            </div>

            <DataTable
                columns={columns}
                data={enrollments}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> New Enrollment
                    </Button>
                }
            />

            {/* Enrollment Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'New Enrollment' : 'Enrollment Details'}
                size="lg"
                footer={
                    modalMode === 'create' && (
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} loading={formLoading}>Create Enrollment</Button>
                        </>
                    )
                }
            >
                {modalMode === 'view' ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Roll No</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.rollNo || '-'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</span>
                            <StatusBadge status={selectedEnrollment?.status} />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.studentName || selectedEnrollment?.userName}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</span>
                            <span className="font-medium text-gray-900 dark:text-white break-all">{selectedEnrollment?.studentEmail || '-'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Class</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.className}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Schedule</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.schedule?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Parent/Guardian</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.parentGuardianName || '-'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Age</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.studentAge || '-'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Address</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedEnrollment?.address || '-'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">
                                {selectedEnrollment?.emergencyContactName && (
                                    <>
                                        {selectedEnrollment.emergencyContactName}
                                        <span className="mx-2 text-gray-400">|</span>
                                        {selectedEnrollment.emergencyContactPhone}
                                    </>
                                )}
                            </span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Message</span>
                            <p className="font-medium text-gray-900 dark:text-white text-base whitespace-pre-wrap">
                                {selectedEnrollment?.additionalMessage || '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="User ID"
                            value={formData.userId}
                            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                            placeholder="Enter student's user ID"
                            required
                        />
                        <Select
                            label="Class"
                            value={formData.classId}
                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                            options={classOptions}
                            placeholder="Select a class..."
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Parent/Guardian Name"
                                value={formData.parentGuardianName}
                                onChange={(e) => setFormData({ ...formData, parentGuardianName: e.target.value })}
                                required
                            />
                            <Input
                                label="Student Age"
                                type="number"
                                value={formData.studentAge}
                                onChange={(e) => setFormData({ ...formData, studentAge: e.target.value })}
                                required
                            />
                        </div>
                        <Select
                            label="Preferred Schedule"
                            value={formData.schedule}
                            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                            options={scheduleOptions}
                            required
                        />
                        <Input
                            label="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Emergency Contact Name"
                                value={formData.emergencyContactName}
                                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                required
                            />
                            <Input
                                label="Emergency Contact Phone"
                                value={formData.emergencyContactPhone}
                                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                required
                            />
                        </div>
                        <Textarea
                            label="Additional Message"
                            value={formData.additionalMessage}
                            onChange={(e) => setFormData({ ...formData, additionalMessage: e.target.value })}
                        />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default EnrollmentsPage;
