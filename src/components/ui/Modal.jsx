import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * Reusable Modal Component
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    footer,
}) => {
    const modalRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose?.();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-fadeInUp overflow-hidden border border-gray-200/50 dark:border-gray-700/50`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-gray-800 dark:to-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/80">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
