import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Select, Textarea, StatusBadge } from '../components/ui/FormComponents';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, EVENT_TYPES } from '../api/endpoints';

const EventsPage = () => {
    const toast = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: '',
        startDateTime: '',
        endDateTime: '',
        location: '',
        isOnline: false,
        meetingLink: '',
        meetingPassword: '',
        imageUrl: '',
        bannerUrl: '',
        maxParticipants: '',
        isPublic: true,
        isRegistrationOpen: true,
        fee: 0,
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
                startDateTime: item.startDateTime ? item.startDateTime.slice(0, 16) : '',
                endDateTime: item.endDateTime ? item.endDateTime.slice(0, 16) : '',
                location: item.location || '',
                isOnline: item.isOnline ?? false,
                meetingLink: item.meetingLink || '',
                meetingPassword: item.meetingPassword || '',
                imageUrl: item.imageUrl || '',
                bannerUrl: item.bannerUrl || '',
                maxParticipants: item.maxParticipants || '',
                isPublic: item.isPublic ?? true,
                isRegistrationOpen: item.isRegistrationOpen ?? true,
                fee: item.fee || 0,
            });
        } else if (mode === 'create') {
            setFormData({
                title: '',
                description: '',
                eventType: 'WORKSHOP',
                startDateTime: '',
                endDateTime: '',
                location: '',
                isOnline: false,
                meetingLink: '',
                meetingPassword: '',
                imageUrl: '',
                bannerUrl: '',
                maxParticipants: '',
                isPublic: true,
                isRegistrationOpen: true,
                fee: 0,
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Manual validation check
        if (!formData.title || !formData.eventType || !formData.startDateTime || !formData.endDateTime) {
            toast.error('Please fill in all required fields (Title, Type, Start/End Date)');
            return;
        }

        setFormLoading(true);
        try {
            const requestData = {
                ...formData,
                startDateTime: new Date(formData.startDateTime).toISOString(),
                endDateTime: new Date(formData.endDateTime).toISOString(),
                maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                fee: parseFloat(formData.fee),
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
        { key: 'eventType', label: 'Type', render: (val) => <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">{val?.replace(/_/g, ' ')}</span> },
        {
            key: 'startDateTime',
            label: 'When',
            render: (val, row) => (
                <div className="text-xs">
                    <div>{new Date(val).toLocaleDateString()}</div>
                    <div className="text-gray-500">{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            )
        },
        {
            key: 'location',
            label: 'Where',
            render: (val, row) => row.isOnline ? <span className="text-[#2383e2] font-semibold">Online</span> : val || '-'
        },
        {
            key: 'isPublic',
            label: 'Visibility',
            render: (val) => val ? <span className="text-green-600 font-medium">Public</span> : <span className="text-gray-500">Private</span>
        },
        {
            key: 'participants',
            label: 'Participants',
            render: (_, row) => (
                <div className="text-xs">
                    <span className="font-semibold">{row.currentParticipants || 0}</span>
                    <span className="text-gray-500"> / {row.maxParticipants || '∞'}</span>
                </div>
            )
        },
        {
            key: 'fee',
            label: 'Fee',
            render: (val) => val > 0 ? `₹${val}` : <span className="text-green-600 font-semibold">Free</span>
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

    const filteredEvents = useMemo(() => {
        if (!searchTerm) return events;
        const term = searchTerm.toLowerCase();
        return events.filter(e =>
            (e.title || '').toLowerCase().includes(term) ||
            (e.description || '').toLowerCase().includes(term) ||
            (e.location || '').toLowerCase().includes(term) ||
            (e.eventType || '').toLowerCase().includes(term) ||
            (e.status || '').toLowerCase().includes(term)
        );
    }, [events, searchTerm]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">Events Management</h1>
                <p className="text-gray-600 dark:text-gray-400">Create and manage workshops, exhibitions, and other events</p>
            </div>

            <DataTable
                columns={columns}
                data={filteredEvents}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                onSearch={setSearchTerm}
                searchPlaceholder="Search events..."
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
                            <Button type="submit" form="event-form" loading={formLoading}>{modalMode === 'create' ? 'Create' : 'Update'}</Button>
                        </>
                    )
                }
            >
                {modalMode === 'view' ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                            {selectedItem?.imageUrl && <img src={selectedItem.imageUrl} alt="Event" className="w-full h-48 object-cover rounded-lg mb-4" />}
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Title</span>
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedItem?.title}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Type</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedItem?.eventType?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Fee</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedItem?.fee > 0 ? `₹${selectedItem.fee}` : 'Free'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Start</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedItem?.startDateTime).toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">End</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedItem?.endDateTime).toLocaleString()}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Location / Link</span>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                {selectedItem?.isOnline ? (
                                    <>
                                        <span className="text-[#2383e2] mr-2">Online</span>
                                        {selectedItem?.meetingLink && <a href={selectedItem.meetingLink} target="_blank" rel="noreferrer" className="text-blue-500 underline">{selectedItem.meetingLink}</a>}
                                        {selectedItem?.meetingPassword && <span className="ml-2 text-gray-500">(Pass: {selectedItem.meetingPassword})</span>}
                                    </>
                                ) : selectedItem?.location || '-'}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Visibility</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedItem?.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Registration</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{selectedItem?.isRegistrationOpen ? 'Open' : 'Closed'}</span>
                        </div>
                        <div className="col-span-2 p-3 bg-gray-50 dark:bg-[#2c2c2c]/50 rounded-lg">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description</span>
                            <p className="font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedItem?.description || '-'}</p>
                        </div>
                    </div>
                ) : (
                    <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        <Select label="Event Type" value={formData.eventType} onChange={(e) => setFormData({ ...formData, eventType: e.target.value })} options={eventTypeOptions} required />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Start Date & Time" type="datetime-local" value={formData.startDateTime} onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })} required />
                            <Input label="End Date & Time" type="datetime-local" value={formData.endDateTime} onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })} required />
                        </div>

                        <div className="border-t border-gray-200 dark:border-[#2f2f2f] pt-4 my-2">
                            <div className="flex items-center gap-2 mb-3">
                                <input type="checkbox" id="isOnline" checked={formData.isOnline} onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                                <label htmlFor="isOnline" className="font-medium text-gray-700 dark:text-gray-300">Online Event</label>
                            </div>

                            {formData.isOnline ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Meeting Link" value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} placeholder="https://zoom.us/..." />
                                    <Input label="Meeting Password" value={formData.meetingPassword} onChange={(e) => setFormData({ ...formData, meetingPassword: e.target.value })} />
                                </div>
                            ) : (
                                <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Venue address..." />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Max Participants" type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} placeholder="Leave empty for unlimited" />
                            <Input label="Entry Fee (₹)" type="number" step="0.01" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isPublic" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                                <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">Public Visibility</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isRegistrationOpen" checked={formData.isRegistrationOpen} onChange={(e) => setFormData({ ...formData, isRegistrationOpen: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                                <label htmlFor="isRegistrationOpen" className="text-sm text-gray-700 dark:text-gray-300">Registration Open</label>
                            </div>
                        </div>

                        <ImageUpload
                            label="Event Image"
                            currentImage={formData.imageUrl}
                            onImageSelected={(url) => setFormData({ ...formData, imageUrl: url })}
                        />
                        <Input label="Banner URL" value={formData.bannerUrl} onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })} placeholder="Optional banner image URL" />

                        <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default EventsPage;
