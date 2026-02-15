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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={`w-full ${sizeClasses[size]} bg-white dark:bg-[#252525] rounded-lg shadow-xl animate-fadeInUp overflow-hidden border border-gray-200 dark:border-[#2f2f2f]`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#2f2f2f]">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2c2c2c]"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 dark:border-[#2f2f2f] bg-gray-50/50 dark:bg-[#1e1e1e]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
