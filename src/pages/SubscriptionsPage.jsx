import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEye, FaBan, FaSync } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, SUBSCRIPTION_STATUS } from '../api/endpoints';

const SubscriptionsPage = () => {
    const toast = useToast();
    const [subscriptions, setSubscriptions] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        enrollmentId: '',
        subscriptionMonth: new Date().getMonth() + 1,
        subscriptionYear: new Date().getFullYear(),
        allowedSessions: 8,
        notes: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    const loadEnrollments = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ENROLLMENTS.GET_ALL, { size: 100 });
            // Filter only approved enrollments
            setEnrollments((response.content || []).filter(e => e.status === 'APPROVED'));
        } catch (error) {
            console.error('Failed to load enrollments:', error);
        }
    }, []);

    const loadSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL, { page, size: 20 });
            setSubscriptions(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadEnrollments();
        loadSubscriptions();
    }, [loadEnrollments, loadSubscriptions]);

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;
        try {
            await api.post(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id));
            toast.success('Subscription cancelled');
            loadSubscriptions();
        } catch (error) {
            toast.error('Failed to cancel subscription');
        }
    };

    const handleRenew = async (enrollmentId) => {
        try {
            await api.post(API_ENDPOINTS.SUBSCRIPTIONS.RENEW(enrollmentId));
            toast.success('Subscription renewed for new month');
            loadSubscriptions();
        } catch (error) {
            toast.error(error.message || 'Failed to renew subscription');
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'create') {
            const today = new Date();
            setFormData({
                enrollmentId: '',
                subscriptionMonth: today.getMonth() + 1,
                subscriptionYear: today.getFullYear(),
                allowedSessions: 8,
                notes: ''
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await api.post(API_ENDPOINTS.SUBSCRIPTIONS.CREATE, {
                enrollmentId: formData.enrollmentId,
                subscriptionMonth: parseInt(formData.subscriptionMonth),
                subscriptionYear: parseInt(formData.subscriptionYear),
                allowedSessions: parseInt(formData.allowedSessions),
                notes: formData.notes
            });
            toast.success('Subscription created');
            setModalOpen(false);
            loadSubscriptions();
        } catch (error) {
            toast.error(error.message || 'Failed to create subscription');
        } finally {
            setFormLoading(false);
        }
    };

    const columns = [
        { key: 'id', label: 'ID', render: (val) => val?.slice(0, 8) + '...' },
        { key: 'studentName', label: 'Student', sortable: true },
        { key: 'rollNo', label: 'Roll No', render: (val) => val || '-' },
        {
            key: 'monthYear',
            label: 'Month/Year',
            render: (_, row) => `${row.subscriptionMonth}/${row.subscriptionYear}`
        },
        {
            key: 'attendedSessions',
            label: 'Attended',
            render: (val, row) => `${val || 0}/${row.allowedSessions || 8}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />
        },
        {
            key: 'isOverLimit',
            label: 'Over Limit',
            render: (val) => val ? <span className="text-red-500 font-semibold">Yes</span> : 'No'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal('view', row)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    >
                        <FaEye />
                    </button>
                    {row.status === 'ACTIVE' && (
                        <>
                            <button
                                onClick={() => handleRenew(row.enrollmentId)}
                                className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                title="Renew for next month"
                            >
                                <FaSync />
                            </button>
                            <button
                                onClick={() => handleCancel(row.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                title="Cancel"
                            >
                                <FaBan />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const enrollmentOptions = enrollments.map(e => ({
        value: e.id,
        label: `${e.studentName || e.userName} - ${e.className}`
    }));

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Subscriptions</h1>
                <p className="text-gray-600 dark:text-gray-400">Monthly class subscriptions (8 classes per month)</p>
            </div>

            <DataTable
                columns={columns}
                data={subscriptions}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> New Subscription
                    </Button>
                }
            />

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'New Subscription' : 'Subscription Details'}
                size="md"
                footer={
                    modalMode === 'create' && (
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} loading={formLoading}>Create</Button>
                        </>
                    )
                }
            >
                {modalMode === 'view' ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.studentName}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Roll No</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.rollNo || '-'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</span>
                            <span className="font-medium text-gray-900 dark:text-white break-all">{selectedItem?.studentEmail || '-'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Period</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.subscriptionMonth}/{selectedItem?.subscriptionYear}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</span>
                            <StatusBadge status={selectedItem?.status} />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Start Date</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.startDate}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">End Date</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.endDate}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Allowed Sessions</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.allowedSessions}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Attended</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.attendedSessions}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Remaining</span>
                            <span className="font-medium text-gray-900 dark:text-white text-base">{selectedItem?.remainingSessions}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Over Limit</span>
                            <span className={`font-medium text-base ${selectedItem?.isOverLimit ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                {selectedItem?.isOverLimit ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes</span>
                            <p className="font-medium text-gray-900 dark:text-white text-base whitespace-pre-wrap">
                                {selectedItem?.notes || '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select
                            label="Enrollment"
                            value={formData.enrollmentId}
                            onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                            options={enrollmentOptions}
                            placeholder="Select approved enrollment..."
                            required
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Month"
                                type="number"
                                value={formData.subscriptionMonth}
                                onChange={(e) => setFormData({ ...formData, subscriptionMonth: e.target.value })}
                                min={1}
                                max={12}
                                required
                            />
                            <Input
                                label="Year"
                                type="number"
                                value={formData.subscriptionYear}
                                onChange={(e) => setFormData({ ...formData, subscriptionYear: e.target.value })}
                                min={2025}
                                required
                            />
                        </div>
                        <Input
                            label="Allowed Sessions"
                            type="number"
                            value={formData.allowedSessions}
                            onChange={(e) => setFormData({ ...formData, allowedSessions: e.target.value })}
                            min={1}
                            max={31}
                            required
                        />
                        <Input
                            label="Notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Optional notes"
                        />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionsPage;
