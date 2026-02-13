import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaEye, FaTruck, FaCheckCircle } from 'react-icons/fa';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { Button, StatusBadge, Input, Textarea } from '../components/ui/FormComponents';
import { useToast } from '../components/ui/Toast';
import api, { getPaginated } from '../api/apiService';
import { API_ENDPOINTS, ORDER_STATUS } from '../api/endpoints';

const OrdersPage = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Shipment Modal State
    const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
    const [shipmentData, setShipmentData] = useState({
        trackingNumber: '',
        carrier: '',
        notes: ''
    });
    const [shipmentLoading, setShipmentLoading] = useState(false);
    const [orderToShip, setOrderToShip] = useState(null);

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

    const handleShipClick = (order) => {
        setOrderToShip(order);
        setShipmentData({ trackingNumber: '', carrier: '', notes: '' });
        setShipmentModalOpen(true);
    };

    const handleShipSubmit = async (e) => {
        e.preventDefault();
        if (!orderToShip) return;

        setShipmentLoading(true);
        try {
            await api.post(API_ENDPOINTS.ORDERS.SHIP(orderToShip.id), shipmentData);
            toast.success('Order marked as shipped');
            setShipmentModalOpen(false);
            if (selectedOrder && selectedOrder.id === orderToShip.id) {
                setModalOpen(false); // Close details modal if open
            }
            loadOrders();
        } catch (error) {
            toast.error(error.message || 'Failed to ship order');
        } finally {
            setShipmentLoading(false);
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
        { key: 'orderNumber', label: 'Order #', render: (val) => val || '-' },
        { key: 'userEmail', label: 'Customer', sortable: true, render: (val) => val || '-' },
        {
            key: 'totalPrice',
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
                        <button onClick={() => handleShipClick(row)} className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg" title="Mark as Shipped">
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

    const filteredOrders = useMemo(() => {
        if (!searchTerm) return orders;
        const term = searchTerm.toLowerCase();
        return orders.filter(o =>
            (o.orderNumber || '').toLowerCase().includes(term) ||
            (o.userEmail || '').toLowerCase().includes(term) ||
            (o.status || '').toLowerCase().includes(term)
        );
    }, [orders, searchTerm]);

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Orders</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage customer orders and shipping</p>
            </div>

            <DataTable
                columns={columns}
                data={filteredOrders}
                loading={loading}
                pagination={pagination}
                onPageChange={setPage}
                onSearch={setSearchTerm}
                searchPlaceholder="Search orders..."
            />

            {/* Order Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Order Details"
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div><strong className="text-gray-500">Order #:</strong> <span className="text-gray-900 dark:text-white font-medium">{selectedOrder.orderNumber}</span></div>
                            <div><strong className="text-gray-500">Status:</strong> <StatusBadge status={selectedOrder.status} /></div>
                            <div><strong className="text-gray-500">Email:</strong> <span className="text-gray-900 dark:text-white">{selectedOrder.userEmail}</span></div>
                            <div><strong className="text-gray-500">Date:</strong> <span className="text-gray-900 dark:text-white">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'}</span></div>
                            {selectedOrder.trackingNumber && (
                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <strong className="text-gray-500">Tracking:</strong> <span className="text-purple-600 font-medium">{selectedOrder.carrier} - {selectedOrder.trackingNumber}</span>
                                </div>
                            )}
                        </div>

                        {/* Addresses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    {selectedOrder.shippingAddress || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Billing Address</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    {selectedOrder.billingAddress || 'Same as shipping'}
                                </p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                            <div className="space-y-3">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">{item.itemName}</p>
                                            <p className="text-xs text-gray-500">{item.itemType} • Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900 dark:text-white">₹{item.subtotal?.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">₹{item.unitPrice} ea</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <div className="text-right">
                                    <span className="text-gray-500 mr-4">Total Amount:</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{selectedOrder.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status History */}
                        {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order History</h3>
                                <div className="space-y-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-4 py-1">
                                    {selectedOrder.statusHistory.map((history, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-2 ring-white dark:ring-gray-900" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{history.status.replace('_', ' ')}</p>
                                            <p className="text-xs text-gray-500">{new Date(history.changedAt).toLocaleString()}</p>
                                            {history.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">{history.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {selectedOrder.status === 'PROCESSING' && (
                                <Button onClick={() => { handleShipClick(selectedOrder); }}>
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

            {/* Shipment Modal */}
            <Modal
                isOpen={shipmentModalOpen}
                onClose={() => setShipmentModalOpen(false)}
                title="Ship Order"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShipmentModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleShipSubmit} loading={shipmentLoading}>Confirm Shipment</Button>
                    </>
                }
            >
                <form className="space-y-4">
                    <Input
                        label="Tracking Number"
                        value={shipmentData.trackingNumber}
                        onChange={(e) => setShipmentData({ ...shipmentData, trackingNumber: e.target.value })}
                        required
                        placeholder="e.g. TRK123456789"
                    />
                    <Input
                        label="Carrier Name"
                        value={shipmentData.carrier}
                        onChange={(e) => setShipmentData({ ...shipmentData, carrier: e.target.value })}
                        required
                        placeholder="e.g. FedEx, BlueDart"
                    />
                    <Textarea
                        label="Notes (Optional)"
                        value={shipmentData.notes}
                        onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
                        placeholder="Any additional shipping notes..."
                        rows={3}
                    />
                </form>
            </Modal>
        </div>
    );
};

export default OrdersPage;
