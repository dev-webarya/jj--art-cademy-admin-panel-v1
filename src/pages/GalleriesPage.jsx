import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaFilter, FaUser, FaSearch } from 'react-icons/fa';
import Modal from '../components/ui/Modal';
import ImagePreviewModal from '../components/ui/ImagePreviewModal';
import { Button, Input, Select, Textarea } from '../components/ui/FormComponents';
import Pagination from '../components/ui/Pagination';
import ImageUpload from '../components/ui/ImageUpload';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS } from '../api/endpoints';

const GalleriesPage = () => {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState('APPROVED'); // Default to APPROVED for management focus
    const [searchTerm, setSearchTerm] = useState('');

    // Gallery Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        imageUrl: '',
    });
    const [formLoading, setFormLoading] = useState(false);

    // Category Modal State
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        parentId: ''
    });
    const [categoryFormLoading, setCategoryFormLoading] = useState(false);

    // Reject Modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [itemToReject, setItemToReject] = useState(null);

    // Image Preview State
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
            const response = await getPaginated(API_ENDPOINTS.ART_GALLERIES.GET_ALL, { page, size: 100 });
            const data = response.content || [];
            setAllItems(data);

            // Filter by status (API uses 'status' field, not 'verificationStatus')
            let filteredData = data;
            if (statusFilter !== 'ALL') {
                filteredData = data.filter(item => item.status === statusFilter);
            }

            setItems(filteredData);
            setPagination({
                number: response.number || 0,
                size: response.size || pageSize,
                totalElements: filteredData.length,
                totalPages: Math.ceil(filteredData.length / pageSize) || 1,
            });
        } catch (error) {
            toast.error('Failed to load galleries');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, statusFilter, toast]);

    useEffect(() => {
        loadCategories();
        loadItems();
    }, [loadCategories, loadItems]);

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
            setFormData({
                name: '',
                description: '',
                categoryId: '',
                imageUrl: '',
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const requestData = { ...formData };
            if (modalMode === 'create') {
                await api.post(API_ENDPOINTS.ART_GALLERIES.CREATE, requestData);
                toast.success('Gallery created');
            } else {
                await api.put(API_ENDPOINTS.ART_GALLERIES.UPDATE(selectedItem.id), requestData);
                toast.success('Gallery updated');
            }
            setModalOpen(false);
            loadItems();
        } catch (error) {
            toast.error(error.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setCategoryFormLoading(true);
        try {
            await api.post(API_ENDPOINTS.ART_GALLERIES_CATEGORIES.CREATE, categoryFormData);
            toast.success('Category created successfully');
            setCategoryModalOpen(false);
            setCategoryFormData({ name: '', parentId: '' });
            loadCategories();
        } catch (error) {
            toast.error(error.message || 'Failed to create category');
        } finally {
            setCategoryFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this gallery?')) return;
        try {
            await api.delete(API_ENDPOINTS.ART_GALLERIES.DELETE(id));
            toast.success('Gallery deleted');
            loadItems();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`${API_ENDPOINTS.ART_GALLERIES.VERIFY(id)}?status=APPROVED`);
            toast.success('Gallery approved!');
            loadItems();
        } catch (error) {
            toast.error('Failed to approve');
        }
    };

    const openRejectModal = (item) => {
        setItemToReject(item);
        setRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!itemToReject) return;
        try {
            await api.put(`${API_ENDPOINTS.ART_GALLERIES.VERIFY(itemToReject.id)}?status=REJECTED`);
            toast.success('Gallery rejected');
            setRejectModalOpen(false);
            setItemToReject(null);
            loadItems();
        } catch (error) {
            toast.error('Failed to reject');
        }
    };

    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    // Count stats
    const pendingCount = allItems.filter(i => i.status === 'PENDING').length;
    const approvedCount = allItems.filter(i => i.status === 'APPROVED').length;
    const rejectedCount = allItems.filter(i => i.status === 'REJECTED').length;

    const statusTabs = [
        { value: 'ALL', label: 'All', count: allItems.length, icon: FaFilter, color: 'purple' },
        { value: 'PENDING', label: 'Pending', count: pendingCount, icon: FaClock, color: 'yellow' },
        { value: 'APPROVED', label: 'Approved', count: approvedCount, icon: FaCheckCircle, color: 'green' },
        { value: 'REJECTED', label: 'Rejected', count: rejectedCount, icon: FaTimesCircle, color: 'red' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        <FaCheckCircle className="text-[10px]" /> Approved
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                        <FaTimesCircle className="text-[10px]" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold">
                        <FaClock className="text-[10px]" /> Pending
                    </span>
                );
        }
    };

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(i =>
            (i.name || '').toLowerCase().includes(term) ||
            (i.description || '').toLowerCase().includes(term) ||
            (i.userName || '').toLowerCase().includes(term) ||
            (i.categoryName || '').toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    return (
        <div className="animate-fadeIn p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Art Galleries</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage all gallery content including partner galleries and approved student submissions. Edit, organize, and moderate published galleries.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setCategoryModalOpen(true)}>
                        <FaPlus /> Add Category
                    </Button>
                    <Button onClick={() => openModal('create')}>
                        <FaPlus /> Add Gallery
                    </Button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setPage(0); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === tab.value
                            ? tab.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                tab.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    tab.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        <tab.icon className="text-sm" />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === tab.value ? 'bg-white/50 dark:bg-black/20' : 'bg-gray-200 dark:bg-[#2c2c2c]'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search galleries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2f2f2f] bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2383e2] focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#252525] rounded-lg shadow-md hover:shadow-sm transition-all duration-300 overflow-hidden group">
                            {/* Image Header - Compact */}
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/300?text=Gallery'}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                    onClick={() => {
                                        setPreviewImage(item.imageUrl || 'https://via.placeholder.com/300?text=Gallery');
                                        setPreviewTitle(item.name);
                                    }}
                                />
                                {/* Status badge - compact */}
                                <div className="absolute top-2 left-2">
                                    {getStatusBadge(item.status)}
                                </div>
                                {/* Category badge - compact */}
                                <div className="absolute top-2 right-2 bg-white/95 dark:bg-[#1e1e1e]/95 px-2 py-0.5 rounded text-[10px] font-semibold shadow-sm text-gray-800 dark:text-gray-200">
                                    {item.categoryName || 'Uncategorized'}
                                </div>
                            </div>

                            {/* Content Body - Compact */}
                            <div className="p-4">
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-2" title={item.name}>
                                    {item.name}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 h-8 leading-tight mb-2">
                                    {item.description || 'No description provided.'}
                                </p>

                                {/* Uploaded By Info - Compact */}
                                {item.userName && (
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-2 flex items-center gap-1">
                                        <FaUser className="text-[8px]" />
                                        <span>By: <span className="font-medium">{item.userName}</span></span>
                                    </p>
                                )}

                                {/* Action Buttons - Compact */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2f2f2f]">
                                    {/* Status Action Icons */}
                                    <div className="flex items-center gap-1">
                                        {item.status !== 'APPROVED' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm"
                                                    title="Approve"
                                                >
                                                    <FaCheck className="text-xs" />
                                                </button>
                                                {item.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => openRejectModal(item)}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-sm"
                                                        title="Reject"
                                                    >
                                                        <FaTimes className="text-xs" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => openRejectModal(item)}
                                                className="p-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors shadow-sm"
                                                title="Revoke Approval"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Edit/Delete Icons - Compact */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openModal('edit', item)}
                                            className="p-1.5 text-[#2383e2] hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit className="text-sm" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {
                items.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-semibold">
                            {statusFilter === 'PENDING' ? 'No pending galleries' :
                                statusFilter === 'APPROVED' ? 'No approved galleries' :
                                    statusFilter === 'REJECTED' ? 'No rejected galleries' : 'No galleries found'}
                        </p>
                        <p className="text-sm">Add a new gallery to get started.</p>
                    </div>
                )
            }

            <Pagination
                pagination={pagination}
                onPageChange={(newPage) => setPage(newPage)}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(0);
                }}
            />

            {/* Gallery Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === 'create' ? 'Create Gallery' : 'Edit Gallery'}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={formLoading}>{modalMode === 'create' ? 'Create' : 'Save Changes'}</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Select
                        label="Category"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        options={categoryOptions}
                        placeholder="Select Category"
                        required
                    />

                    <ImageUpload
                        value={formData.imageUrl}
                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    />

                    <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />
                </form>
            </Modal>

            {/* Create Category Modal */}
            <Modal
                isOpen={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                title="Create New Category"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCategorySubmit} loading={categoryFormLoading}>Create Category</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Category Name"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        required
                        placeholder="Enter category name"
                    />

                    <Input
                        label="Parent Category ID (Optional)"
                        value={categoryFormData.parentId}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, parentId: e.target.value })}
                        placeholder="Enter parent ID if applicable"
                    />
                </form>
            </Modal>

            {/* Reject Confirmation Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Reject Gallery"
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
                            This will mark the gallery as rejected. It can be re-approved later.
                        </p>
                    </div>
                    {itemToReject && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                            {itemToReject.imageUrl && (
                                <img src={itemToReject.imageUrl} alt="" className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-100">{itemToReject.name}</p>
                                <p className="text-sm text-gray-500">{itemToReject.categoryName || 'No category'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
                imageUrl={previewImage}
                title={previewTitle}
            />
        </div >
    );
};

export default GalleriesPage;
