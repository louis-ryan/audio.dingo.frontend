import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploader = ({ handleFileInput }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        handleFileInput({ target: { files: acceptedFiles } });
    }, [handleFileInput]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'video/*',
        multiple: false,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false)
    });

    return (
        <div className="file-uploader">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <h3>Drag & drop a video file here, or click to select to get started</h3>
            </div>
        </div>
    );
};

export default FileUploader;