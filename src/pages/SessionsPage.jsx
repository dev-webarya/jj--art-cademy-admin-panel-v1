import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPlay, FaStop, FaCheck } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, Textarea, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, SESSION_STATUS } from '../api/endpoints';

const SessionsPage = () => {
    const toast = useToast();
    const location = useLocation();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('view');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        sessionDate: '',
        startTime: '',
        endTime: '',
        topic: '',
        description: '',
        meetingLink: '',
        meetingPassword: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // ... loadClasses removed (not needed) ...

    const loadSessions = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 20 };
            // Removed classId filter
            const response = await getPaginated(API_ENDPOINTS.SESSIONS.GET_ALL, params);
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

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // ... handleStatusUpdate ...

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'edit' && item) {
            setFormData({
                sessionDate: item.sessionDate || '',
                startTime: item.startTime || '',
                endTime: item.endTime || '',
                topic: item.topic || '',
                description: item.description || '',
                meetingLink: item.meetingLink || '',
                meetingPassword: item.meetingPassword || '',
            });
        } else if (mode === 'create') {
            setFormData({
                sessionDate: '',
                startTime: '',
                endTime: '',
                topic: '',
                description: '',
                meetingLink: '',
                meetingPassword: '',
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const requestData = {
                // classId removed
                sessionDate: formData.sessionDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                topic: formData.topic,
                description: formData.description,
                meetingLink: formData.meetingLink,
                meetingPassword: formData.meetingPassword,
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.SESSIONS.CREATE, requestData);
                toast.success('Session created');
            } else {
                await api.put(API_ENDPOINTS.SESSIONS.UPDATE(selectedItem.id), requestData);
                toast.success('Session updated');
            }
            setModalOpen(false);
            loadSessions();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this session?')) return;
        try {
            await api.delete(API_ENDPOINTS.SESSIONS.DELETE(id));
            toast.success('Session deleted');
            loadSessions();
        } catch (error) {
            toast.error('Failed to delete session');
        }
    };

    const columns = [
        { key: 'topic', label: 'Topic', sortable: true },
        { key: 'sessionDate', label: 'Date' },
        { key: 'startTime', label: 'Start Time' },
        { key: 'endTime', label: 'End Time' },
        { key: 'totalStudents', label: 'Students', render: (val) => val || 0 },
        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-1">
                    <button onClick={() => openModal('view', row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <FaEye />
                    </button>
                    <button onClick={() => openModal('edit', row)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <FaEdit />
                    </button>
                    {row.status === 'SCHEDULED' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'IN_PROGRESS')} className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg" title="Start">
                            <FaPlay />
                        </button>
                    )}
                    {row.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'COMPLETED')} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Complete">
                            <FaCheck />
                        </button>
                    )}
                    {row.status === 'SCHEDULED' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'CANCELLED', 'Cancelled by admin')} className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg" title="Cancel">
                            <FaStop />
                        </button>
                    )}
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const filteredSessions = useMemo(() => {
        if (!searchTerm) return sessions;
        const term = searchTerm.toLowerCase();
        return sessions.filter(s =>
            (s.topic || '').toLowerCase().includes(term) ||
            (s.sessionDate || '').toLowerCase().includes(term) ||
            (s.status || '').toLowerCase().includes(term) ||
            (s.startTime || '').toLowerCase().includes(term)
        );
    }, [sessions, searchTerm]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Class Sessions</h1>
                <p className="text-gray-600 dark:text-gray-400">Schedule and manage class sessions</p>
            </div>


            <DataTable
                columns={columns}
                data={filteredSessions}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                onSearch={setSearchTerm}
                searchPlaceholder="Search sessions..."
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> New Session
                    </Button>
                }
            />

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'New Session' : modalMode === 'edit' ? 'Edit Session' : 'Session Details'}
                size="lg"
                footer={
                    modalMode !== 'view' && (
                        <>
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} loading={formLoading}>{modalMode === 'create' ? 'Create' : 'Update'}</Button>
                        </>
                    )
                }
            >
                {modalMode === 'view' ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Topic</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.topic}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.sessionDate}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</span>
                            <StatusBadge status={selectedItem?.status} />
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Time</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.startTime} - {selectedItem?.endTime}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Attendance</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.attendanceTaken ? 'Taken' : 'Not Taken'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Students</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.totalStudents || 0}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Present / Absent</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">
                                <span className="text-green-600 dark:text-green-400">{selectedItem?.presentCount || 0}</span>
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-red-600 dark:text-red-400">{selectedItem?.absentCount || 0}</span>
                            </span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Meeting Link</span>
                            <a href={selectedItem?.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#2383e2] dark:text-purple-400 hover:underline break-all">
                                {selectedItem?.meetingLink || '-'}
                            </a>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Meeting Password</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">{selectedItem?.meetingPassword || '-'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-base whitespace-pre-wrap">
                                {selectedItem?.description || '-'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Class selection removed as sessions are global */}
                        <Input label="Topic" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} required />
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Date" type="date" value={formData.sessionDate} onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })} required />
                            <Input label="Start Time" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
                            <Input label="End Time" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Meeting Link" value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://..." />
                            <Input label="Meeting Password" value={formData.meetingPassword} onChange={(e) => setFormData({ ...formData, meetingPassword: e.target.value })} />
                        </div>
                        <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default SessionsPage;
