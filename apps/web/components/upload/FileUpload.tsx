'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '../ui';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = ['.xlsx', '.xls'],
  maxSizeMB = 10,
  label = 'Upload File',
  description = 'Drag and drop your Excel file here, or click to browse',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Invalid file type. Please upload ${acceptedTypes.join(' or ')} files only.`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  }, [acceptedTypes, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
        <p className="text-sm text-white/60 mb-4">{description}</p>
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200
          ${isDragging
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-white/20 bg-white/5'
          }
          ${error ? 'border-red-400 bg-red-500/10' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <p className="text-white/80 mb-2">
              Drop your file here
            </p>
            <p className="text-sm text-white/40 mb-4">
              or
            </p>
            <GlassButton onClick={handleBrowseClick} variant="secondary">
              Browse Files
            </GlassButton>
            <p className="text-xs text-white/40 mt-4">
              Accepts {acceptedTypes.join(', ')} files up to {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-white/60">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
