import { useState } from 'react';
import { FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';
import { useToast } from './Toast';

const ImageUpload = ({ value, onChange, label = "Image", className = "" }) => {
    const [uploading, setUploading] = useState(false);
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
            // Reset input value to allow selecting same file again if needed
            e.target.value = '';
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                    {value ? (
                        <>
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors shadow-sm"
                                title="Remove Image"
                            >
                                <FaTrash />
                            </button>
                        </>
                    ) : (
                        <FaCloudUploadAlt className="text-4xl text-gray-400 dark:text-gray-500" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
                            <FaSpinner className="animate-spin text-purple-600 text-2xl" />
                        </div>
                    )}
                </div>

                {/* Upload Control */}
                <div className="flex-1">
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
                                <p className="text-xs">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            {/* Fallback Input for manual URL if needed */}
            <div className="text-xs text-right">
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('Enter Image URL manually:', value);
                        if (url !== null) onChange(url);
                    }}
                    className="text-purple-600 hover:underline dark:text-purple-400"
                >
                    Enter URL manually
                </button>
            </div>
        </div>
    );
};

export default ImageUpload;
