import { useState, useEffect, useCallback } from 'react';
import { FaEye, FaTruck, FaCheckCircle } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, StatusBadge } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, ORDER_STATUS } from '../api/endpoints';

const OrdersPage = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPaginated(API_ENDPOINTS.ORDERS.GET_ALL, { page, size: 20 });
            setOrders(response.content || []);
            setPagination({
                number: response.number || 0,
                size: response.size || 20,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 1,
            });
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, toast]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleShip = async (id) => {
        try {
            await api.post(API_ENDPOINTS.ORDERS.SHIP(id));
            toast.success('Order marked as shipped');
            loadOrders();
        } catch (error) {
            toast.error('Failed to ship order');
        }
    };

    const handleDeliver = async (id) => {
        try {
            await api.post(API_ENDPOINTS.ORDERS.DELIVER(id));
            toast.success('Order marked as delivered');
            loadOrders();
        } catch (error) {
            toast.error('Failed to mark as delivered');
        }
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const columns = [
        { key: 'id', label: 'Order ID', render: (val) => val?.slice(0, 8) + '...' },
        { key: 'customerName', label: 'Customer', sortable: true, render: (val, row) => val || row.userName || '-' },
        { key: 'customerEmail', label: 'Email', render: (val) => val || '-' },
        {
            key: 'totalAmount',
            label: 'Total',
            render: (val) => val ? `₹${parseFloat(val).toFixed(2)}` : '-'
        },
        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
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
                    <button onClick={() => openModal(row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="View Details">
                        <FaEye />
                    </button>
                    {row.status === 'PROCESSING' && (
                        <button onClick={() => handleShip(row.id)} className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" title="Mark as Shipped">
                            <FaTruck />
                        </button>
                    )}
                    {row.status === 'SHIPPED' && (
                        <button onClick={() => handleDeliver(row.id)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Mark as Delivered">
                            <FaCheckCircle />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Orders</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage customer orders and shipping</p>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
            />

            {/* Order Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Order Details"
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>Order ID:</strong> {selectedOrder.id}</div>
                            <div><strong>Status:</strong> <StatusBadge status={selectedOrder.status} /></div>
                            <div><strong>Customer:</strong> {selectedOrder.customerName || selectedOrder.userName || '-'}</div>
                            <div><strong>Email:</strong> {selectedOrder.customerEmail || '-'}</div>
                            <div><strong>Phone:</strong> {selectedOrder.customerPhone || '-'}</div>
                            <div><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</div>
                        </div>

                        <div>
                            <strong>Shipping Address:</strong>
                            <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress || '-'}</p>
                        </div>

                        {/* Order Items */}
                        <div>
                            <strong className="block mb-2">Items:</strong>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{item.productName || item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                )) || <p className="text-gray-500">No items</p>}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="text-right space-y-1">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Subtotal: ₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Shipping: ₹{selectedOrder.shippingCost?.toFixed(2) || '0.00'}
                                </p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    Total: ₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                                </p>

                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {selectedOrder.status === 'PROCESSING' && (
                                <Button onClick={() => { handleShip(selectedOrder.id); setModalOpen(false); }}>
                                    <FaTruck /> Mark as Shipped
                                </Button>
                            )}
                            {selectedOrder.status === 'SHIPPED' && (
                                <Button onClick={() => { handleDeliver(selectedOrder.id); setModalOpen(false); }}>
                                    <FaCheckCircle /> Mark as Delivered
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrdersPage;
