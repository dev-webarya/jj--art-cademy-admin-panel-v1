import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPlay, FaStop, FaCheck } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, Textarea, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, SESSION_STATUS } from '../api/endpoints';

const SessionsPage = () => {
    const toast = useToast();
    const [sessions, setSessions] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
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

    const loadClasses = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_CLASSES.GET_ALL, { size: 100 });
            setClasses(response.content || []);
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    }, []);

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

    useEffect(() => {
        loadClasses();
        loadSessions();
    }, [loadClasses, loadSessions]);

    const handleStatusUpdate = async (id, status, reason = '') => {
        try {
            await api.patch(`${API_ENDPOINTS.SESSIONS.UPDATE_STATUS(id)}?status=${status}${reason ? `&reason=${reason}` : ''}`);
            toast.success(`Session ${status.toLowerCase().replace('_', ' ')}`);
            loadSessions();
        } catch (error) {
            toast.error('Failed to update session status');
        }
    };

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

    const classOptions = classes.map(c => ({ value: c.id, label: c.title || c.name }));

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Class Sessions</h1>
                <p className="text-gray-600 dark:text-gray-400">Schedule and manage class sessions</p>
            </div>

            <DataTable
                columns={columns}
                data={sessions}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
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
                    <div className="space-y-3">
                        <div><strong>Topic:</strong> {selectedItem?.topic}</div>
                        <div><strong>Date:</strong> {selectedItem?.sessionDate}</div>
                        <div><strong>Time:</strong> {selectedItem?.startTime} - {selectedItem?.endTime}</div>
                        <div><strong>Status:</strong> <StatusBadge status={selectedItem?.status} /></div>
                        <div><strong>Total Students:</strong> {selectedItem?.totalStudents || 0}</div>
                        <div><strong>Present:</strong> {selectedItem?.presentCount || 0}</div>
                        <div><strong>Absent:</strong> {selectedItem?.absentCount || 0}</div>
                        <div><strong>Attendance Taken:</strong> {selectedItem?.attendanceTaken ? 'Yes' : 'No'}</div>
                        <div><strong>Meeting Link:</strong> <a href={selectedItem?.meetingLink} target="_blank" rel="noopener noreferrer" className="text-purple-500">{selectedItem?.meetingLink || '-'}</a></div>
                        <div><strong>Meeting Password:</strong> {selectedItem?.meetingPassword || '-'}</div>
                        <div><strong>Description:</strong> {selectedItem?.description || '-'}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
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
