import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, Input, Textarea, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const LmsGalleryPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        studentId: '',
        sessionId: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.LMS_GALLERY.GET_ALL, { page, size: 20 });
            setItems(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleVerify = async (id) => {
        try {
            await api.post(API_ENDPOINTS.LMS_GALLERY.VERIFY(id));
            toast.success('Gallery item verified');
            loadItems();
        } catch (error) {
            toast.error('Failed to verify');
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'edit' && item) {
            setFormData({
                title: item.title || '',
                description: item.description || '',
                imageUrl: item.imageUrl || '',
                studentId: item.studentId || '',
                sessionId: item.sessionId || '',
            });
        } else if (mode === 'create') {
            setFormData({ title: '', description: '', imageUrl: '', studentId: '', sessionId: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.LMS_GALLERY.CREATE, formData);
                toast.success('Gallery item created');
            } else {
                await api.put(API_ENDPOINTS.LMS_GALLERY.UPDATE(selectedItem.id), formData);
                toast.success('Gallery item updated');
            }
            setModalOpen(false);
            loadItems();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this gallery item?')) return;
        try {
            await api.delete(API_ENDPOINTS.LMS_GALLERY.DELETE(id));
            toast.success('Gallery item deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const columns = [
        {
            key: 'imageUrl',
            label: 'Image',
            render: (val) => val ? <img src={val} alt="" className="w-16 h-16 object-cover rounded-lg" /> : <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        },
        { key: 'title', label: 'Title', sortable: true },
        { key: 'studentName', label: 'Student', render: (val) => val || '-' },
        { key: 'className', label: 'Class', render: (val) => val || '-' },
        {
            key: 'isVerified',
            label: 'Verified',
            render: (val) => val ? (
                <span className="flex items-center gap-1 text-green-600"><FaCheck /> Yes</span>
            ) : (
                <span className="flex items-center gap-1 text-yellow-600"><FaTimes /> No</span>
            )
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
                    {!row.isVerified && (
                        <button onClick={() => handleVerify(row.id)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Verify">
                            <FaCheck />
                        </button>
                    )}
                    <button onClick={() => openModal('edit', row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Student Gallery</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage student artwork submissions</p>
            </div>

            <DataTable columns={columns} data={items} loading={loading} pagination={pagination} onPageChange={setPage} actions={<Button onClick={() => openModal('create')}><FaPlus /> Add Item</Button>} />

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Add Gallery Item' : 'Edit Gallery Item'} size="md" footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSubmit} loading={formLoading}>{modalMode === 'create' ? 'Create' : 'Update'}</Button></>}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    <Input label="Image URL" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
                    <Input label="Student ID" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} />
                    <Input label="Session ID" value={formData.sessionId} onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })} />
                    <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </form>
            </Modal>
        </div>
    );
};

export default LmsGalleryPage;
