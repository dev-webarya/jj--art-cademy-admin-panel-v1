import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaCheckCircle, FaFilter, FaEye, FaTimesCircle } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const LmsGalleryPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]); // Add categories state
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState('PENDING'); // PENDING, APPROVED, REJECTED, ALL
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '', // Add categoryId field
        imageUrl: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // Reject modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [itemToReject, setItemToReject] = useState(null);

    // Image preview
    const [previewImage, setPreviewImage] = useState(null);
    const [previewTitle, setPreviewTitle] = useState('');


    const loadCategories = useCallback(async () => {
        try {
            const response = await getPaginated(API_ENDPOINTS.ART_GALLERIES_CATEGORIES.GET_ALL, { size: 100 });
            setCategories(response.content || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    const loadItems = useCallback(async () => {
        setLoading(true);
        try {
            // Use Art Galleries API
            const response = await getPaginated(API_ENDPOINTS.ART_GALLERIES.GET_ALL, { page, size: 100 });
            const data = response.content || [];

            setAllItems(data);

            // Filter by status (API uses 'status' field)
            let filteredData = data;
            if (statusFilter !== 'ALL') {
                filteredData = data.filter(item => item.status === statusFilter);
            }

            setItems(filteredData);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: filteredData.length,
                totalPages: Math.ceil(filteredData.length / 20) || 1,
            });
        } catch (error) {
            toast.error('Failed to load gallery');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, toast]);


    useEffect(() => {
        loadCategories();
        loadItems();
    }, [loadCategories, loadItems]);

    const handleApprove = async (id) => {
        try {
            // Use Art Galleries verify endpoint with status=APPROVED
            await api.put(`${API_ENDPOINTS.ART_GALLERIES.VERIFY(id)}?status=APPROVED`);
            toast.success('Gallery item approved and published!');
            loadItems();
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const openRejectModal = (item) => {
        setItemToReject(item);
        setRejectReason('');
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!itemToReject) return;
        try {
            // Use Art Galleries verify endpoint with status=REJECTED
            await api.put(`${API_ENDPOINTS.ART_GALLERIES.VERIFY(itemToReject.id)}?status=REJECTED`);
            toast.success('Gallery item rejected');
            setRejectModalOpen(false);
            setItemToReject(null);
            loadItems();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (mode === 'edit' && item) {
            setFormData({
                name: item.name || '',
                description: item.description || '',
                categoryId: item.categoryId || '',
                imageUrl: item.imageUrl || '',
            });
        } else if (mode === 'create') {
            setFormData({ name: '', description: '', categoryId: '', imageUrl: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_GALLERIES.CREATE, formData);
                toast.success('Gallery item created');
            } else {
                await api.put(API_ENDPOINTS.ART_GALLERIES.UPDATE(selectedItem.id), formData);
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
        if (!confirm('Delete this gallery item permanently?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_GALLERIES.DELETE(id));
            toast.success('Gallery item deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Count stats by status
    const pendingCount = allItems.filter(i => i.status === 'PENDING').length;
    const approvedCount = allItems.filter(i => i.status === 'APPROVED').length;
    const rejectedCount = allItems.filter(i => i.status === 'REJECTED').length;

    const statusTabs = [
        { value: 'PENDING', label: 'Pending Approval', count: pendingCount, icon: FaClock, color: 'yellow' },
        { value: 'APPROVED', label: 'Published', count: approvedCount, icon: FaCheckCircle, color: 'green' },
        { value: 'REJECTED', label: 'Rejected', count: rejectedCount, icon: FaTimesCircle, color: 'red' },
        { value: 'ALL', label: 'All Submissions', count: allItems.length, icon: FaFilter, color: 'purple' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        <FaCheckCircle /> Published
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                        <FaTimesCircle /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                        <FaClock /> Pending
                    </span>
                );
        }
    };

    const columns = [
        {
            key: 'imageUrl',
            label: 'Image',
            render: (val, row) => val ? (
                <img
                    src={val}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => { setPreviewImage(val); setPreviewTitle(row.name); }}
                />
            ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FaEye className="text-gray-400" />
                </div>
            )
        },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'userName', label: 'Uploaded By', render: (val) => val || '-' },
        { key: 'categoryName', label: 'Category', render: (val) => val || '-' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => getStatusBadge(val)
        },
        {
            key: 'createdAt',
            label: 'Submitted',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div className="flex gap-2">
                    {row.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleApprove(row.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
                                title="Approve & Publish"
                            >
                                <FaCheck /> Approve
                            </button>
                            <button
                                onClick={() => openRejectModal(row)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                title="Reject"
                            >
                                <FaTimes /> Reject
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => openModal('edit', row)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                    >
                        <FaTrash />
                    </button>
                </div>
            ),
        },
    ];

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(i =>
            (i.name || '').toLowerCase().includes(term) ||
            (i.userName || '').toLowerCase().includes(term) ||
            (i.categoryName || '').toLowerCase().includes(term) ||
            (i.status || '').toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Student Gallery</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Review student photo submissions. Approve to publish in the public gallery, or reject with feedback. Focus on pending submissions that need your attention.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                        className={`p-4 rounded-xl border-2 transition-all ${statusFilter === tab.value
                            ? `border-${tab.color}-500 bg-${tab.color}-50 dark:bg-${tab.color}-900/20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-lg ${tab.color === 'yellow' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                tab.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                    tab.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                }`}>
                                <tab.icon className="text-xl" />
                            </div>
                            <div className="text-left">
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{tab.count}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tab.label}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredItems}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                onSearch={setSearchTerm}
                searchPlaceholder="Search gallery..."
                actions={
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Gallery Item
                    </Button>
                }
            />

            {items.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-semibold">
                        {statusFilter === 'PENDING' ? 'No pending submissions' :
                            statusFilter === 'APPROVED' ? 'No published items yet' :
                                statusFilter === 'REJECTED' ? 'No rejected items' : 'No submissions yet'}
                    </p>
                    <p className="text-sm">
                        {statusFilter === 'PENDING' && 'All caught up! No student submissions need review.'}
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Add Gallery Item' : 'Edit Gallery Item'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={formLoading}>
                            {modalMode === 'create' ? 'Create' : 'Update'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter gallery item name"
                    />

                    <Select
                        label="Category"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        placeholder="Select Category"
                        required
                    />

                    <ImageUpload
                        label="Image"
                        value={formData.imageUrl}
                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />

                    <Textarea
                        label="Description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the artwork..."
                    />
                </form>
            </Modal>

            {/* Reject Confirmation Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Reject Submission"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleReject}>
                            <FaTimes /> Reject
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                            <strong>Note:</strong> Rejecting will mark this submission as rejected. It can be approved later if needed.
                        </p>
                    </div>
                    {itemToReject && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {itemToReject.imageUrl && (
                                <img src={itemToReject.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                                <p className="font-medium text-gray-800 dark:text-white">{itemToReject.name}</p>
                                <p className="text-sm text-gray-500">{itemToReject.location || 'No location'}</p>
                            </div>
                        </div>
                    )}
                    <Textarea
                        label="Reason for rejection (optional)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Provide feedback..."
                        rows={3}
                    />
                </div>
            </Modal>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title={previewTitle}
            />
        </div>
    );
};

export default LmsGalleryPage;
