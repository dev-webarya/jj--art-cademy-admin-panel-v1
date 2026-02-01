import { useState } from 'react';
import { FaCloudUploadAlt, FaTrash, FaSpinner, FaLink, FaImage } from 'react-icons/fa';
import { useToast } from './Toast';

const ImageUpload = ({ value, onChange, label = "Image", className = "" }) => {
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState('upload'); // 'upload' or 'url'
    const toast = useToast();

    // Environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!cloudName || !uploadPreset || cloudName === 'your_cloud_name_here') {
            toast.error('Cloudinary configuration missing in .env');
            console.error('Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            onChange(data.secure_url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setMode('upload')}
                        className={`px-3 py-1 rounded-md transition-all ${mode === 'upload'
                                ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <span className="flex items-center gap-1"><FaCloudUploadAlt /> Upload</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('url')}
                        className={`px-3 py-1 rounded-md transition-all ${mode === 'url'
                                ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <span className="flex items-center gap-1"><FaLink /> URL</span>
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center group">
                    {value ? (
                        <>
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                    title="Remove Image"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </>
                    ) : (
                        <FaImage className="text-4xl text-gray-300 dark:text-gray-600" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
                            <FaSpinner className="animate-spin text-purple-600 text-2xl" />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-1">
                    {mode === 'upload' ? (
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                                id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            />
                            <label
                                htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                                    ${uploading
                                        ? 'border-gray-300 bg-gray-50'
                                        : 'border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 dark:border-gray-600 dark:hover:border-purple-500 dark:bg-gray-700/30'
                                    }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
                                    <FaCloudUploadAlt className="w-8 h-8 mb-2" />
                                    <p className="mb-1 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs">SVG, PNG, JPG (MAX. 5MB)</p>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col justify-center">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLink className="text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                    placeholder="Enter image URL (https://...)"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Paste a direct link to an image hosted elsewhere.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;
