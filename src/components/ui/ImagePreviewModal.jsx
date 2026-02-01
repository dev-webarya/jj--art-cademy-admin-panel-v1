import { useEffect, useState, useRef } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaDownload, FaRedo, FaExpand, FaCompress } from 'react-icons/fa';

/**
 * Premium Image Preview Modal with Zoom, Pan, and Download capabilities
 */
const ImagePreviewModal = ({ isOpen, onClose, imageUrl, title }) => {
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const imageContainerRef = useRef(null);

    // Reset state when opening new image
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setIsFullscreen(false);
        }
    }, [isOpen, imageUrl]);

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
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !imageUrl) return null;

    const handleZoomIn = (e) => {
        e.stopPropagation();
        setScale(prev => Math.min(prev + 0.25, 4));
    };

    const handleZoomOut = (e) => {
        e.stopPropagation();
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setScale(1);
    };

    const toggleFullscreen = (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            imageContainerRef.current?.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            // Fetch the image as a blob to force download instead of open in new tab
            const response = await fetch(imageUrl, { mode: 'cors' });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            // Create a safe filename
            const filename = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : 'download.jpg';
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download fetch failed, falling back to direct link:', error);
            // Fallback
            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank';
            link.download = title || 'image';
            link.click();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn transition-all duration-300"
            onClick={onClose}
        >
            {/* Top Toolbar (Floating) */}
            <div
                className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-2 bg-gray-900/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl z-50 transition-transform hover:scale-105"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Zoom Out (Ctrl -)"
                    disabled={scale <= 0.5}
                >
                    <FaSearchMinus size={14} />
                </button>

                <span className="text-xs text-gray-300 font-mono w-12 text-center select-none">
                    {Math.round(scale * 100)}%
                </span>

                <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Zoom In (Ctrl +)"
                    disabled={scale >= 4}
                >
                    <FaSearchPlus size={14} />
                </button>

                <div className="w-px h-4 bg-white/20 mx-2"></div>

                <button
                    onClick={handleReset}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Reset View"
                >
                    <FaRedo size={14} />
                </button>

                <button
                    onClick={toggleFullscreen}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                </button>

                <div className="w-px h-4 bg-white/20 mx-2"></div>

                <button
                    onClick={handleDownload}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-full transition-colors"
                    title="Download Image"
                >
                    <FaDownload size={14} />
                </button>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-3 bg-white/5 rounded-full hover:bg-white/20 backdrop-blur-sm z-50 group"
                title="Close (Esc)"
            >
                <FaTimes size={20} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>

            {/* Image Container */}
            <div
                ref={imageContainerRef}
                className="relative w-full h-full flex items-center justify-center overflow-auto p-4"
                onClick={onClose}
            >
                <div
                    className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-w-full min-h-full"
                    style={{
                        transform: `scale(${scale})`,
                        cursor: scale > 1 ? 'grab' : 'default'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={imageUrl}
                        alt={title || "Preview"}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none animate-zoomIn"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Title Footer */}
            {title && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 max-w-[90vw] z-50 pointer-events-none">
                    <div className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl overflow-hidden">
                        <h3 className="text-white font-medium text-lg text-center tracking-wide truncate">{title}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePreviewModal;
