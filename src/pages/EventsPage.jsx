import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, EVENT_TYPES } from '../api/endpoints';

const EventsPage = () => {
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: '',
        startDate: '',
        endDate: '',
        location: '',
        isPublic: true,
        maxParticipants: '',
        imageUrl: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.EVENTS.GET_ALL, { page, size: 20 });
            setEvents(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'edit' && item) {
            setFormData({
                title: item.title || '',
                description: item.description || '',
                eventType: item.eventType || '',
                startDate: item.startDate?.split('T')[0] || '',
                endDate: item.endDate?.split('T')[0] || '',
                location: item.location || '',
                isPublic: item.isPublic ?? true,
                maxParticipants: item.maxParticipants || '',
                imageUrl: item.imageUrl || '',
            });
        } else if (mode === 'create') {
            setFormData({
                title: '',
                description: '',
                eventType: '',
                startDate: '',
                endDate: '',
                location: '',
                isPublic: true,
                maxParticipants: '',
                imageUrl: '',
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const requestData = {
                title: formData.title,
                description: formData.description,
                eventType: formData.eventType,
                startDate: formData.startDate,
                endDate: formData.endDate,
                location: formData.location,
                isPublic: formData.isPublic,
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                imageUrl: formData.imageUrl,
            };

            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.EVENTS.CREATE, requestData);
                toast.success('Event created');
            } else {
                await api.put(API_ENDPOINTS.EVENTS.UPDATE(selectedItem.id), requestData);
                toast.success('Event updated');
            }
            setModalOpen(false);
            loadEvents();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event?')) return;
        try {
            await api.delete(API_ENDPOINTS.EVENTS.DELETE(id));
            toast.success('Event deleted');
            loadEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const columns = [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'eventType', label: 'Type', render: (val) => val?.replace(/_/g, ' ') || '-' },
        {
            key: 'startDate',
            label: 'Start Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            key: 'endDate',
            label: 'End Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        { key: 'location', label: 'Location', render: (val) => val || '-' },
        {
            key: 'isPublic',
            label: 'Public',
            render: (val) => val ? (
                <span className="text-green-500">Yes</span>
            ) : (
                <span className="text-gray-500">No</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button onClick={() => openModal('view', row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <FaEye />
                    </button>
                    <button onClick={() => openModal('edit', row)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                        <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const eventTypeOptions = EVENT_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') }));

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Events</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage workshops, exhibitions, and more</p>
            </div>

            <DataTable
                columns={columns}
                data={events}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> New Event
                    </Button>
                }
            />

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
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
                        <div><strong>Title:</strong> {selectedItem?.title}</div>
                        <div><strong>Type:</strong> {selectedItem?.eventType?.replace(/_/g, ' ')}</div>
                        <div><strong>Start:</strong> {selectedItem?.startDate}</div>
                        <div><strong>End:</strong> {selectedItem?.endDate}</div>
                        <div><strong>Location:</strong> {selectedItem?.location || '-'}</div>
                        <div><strong>Public:</strong> {selectedItem?.isPublic ? 'Yes' : 'No'}</div>
                        <div><strong>Max Participants:</strong> {selectedItem?.maxParticipants || 'Unlimited'}</div>
                        <div><strong>Description:</strong> {selectedItem?.description || '-'}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        <Select label="Event Type" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} options={eventTypeOptions} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                            <Input label="End Date" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                        </div>
                        <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Max Participants" type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} placeholder="Leave empty for unlimited" />
                            <div className="flex items-center gap-2 pt-6">
                                <input type="checkbox" id="isPublic" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="w-4 h-4" />
                                <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">Public Event</label>
                            </div>
                        </div>
                        <Input label="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                        <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default EventsPage;
