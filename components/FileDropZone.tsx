import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons';

interface FileDropZoneProps {
  onFileSelect: (text: string) => void;
  disabled?: boolean;
}

/**
 * FileDropZone Component
 * Allows users to drag and drop files or click to select files for upload.
 * Supports .txt and .md files.
 */
const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!disabled) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = async (file: File) => {
    if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert('Please select a .txt or .md file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      onFileSelect(text);
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('Failed to read file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
        disabled
          ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-700'
          : isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drag and drop file here or click to select"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isLoading}
        aria-label="File input"
      />

      <div className="flex flex-col items-center gap-2">
        <UploadIcon className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''} ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <div>
          <p className={`font-medium ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {isLoading ? 'Loading...' : 'Drag and drop your file'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse (.txt, .md)</p>
        </div>
      </div>
    </div>
  );
};

export default FileDropZone;
