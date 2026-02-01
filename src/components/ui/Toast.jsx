import { useState, useEffect, createContext, useContext } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ id, type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <FaCheckCircle className="text-green-500" />,
        error: <FaExclamationCircle className="text-red-500" />,
        info: <FaInfoCircle className="text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    };

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-slideIn ${bgColors[type]}`}
        >
            {icons[type]}
            <p className="flex-1 text-sm text-gray-700 dark:text-gray-200">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const toast = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        info: (message) => addToast('info', message),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} onClose={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
