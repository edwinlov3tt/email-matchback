'use client';

import { useState } from 'react';
import { FileUpload } from '../upload';
import { GlassCard, GlassButton } from '../ui';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface CampaignFileUploadProps {
  campaignId: string;
  type: 'client-data' | 'vendor-response';
  onUploadComplete?: () => void;
}

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export function CampaignFileUpload({
  campaignId,
  type,
  onUploadComplete,
}: CampaignFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint =
        type === 'client-data'
          ? `http://localhost:3001/campaigns/${campaignId}/uploads/client-data`
          : `http://localhost:3001/campaigns/${campaignId}/uploads/vendor-response`;

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            progress: percentComplete,
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          setUploadProgress({
            isUploading: false,
            progress: 100,
            error: null,
            success: true,
          });
          onUploadComplete?.();
        } else {
          const error = JSON.parse(xhr.responseText);
          setUploadProgress({
            isUploading: false,
            progress: 0,
            error: error.message || 'Upload failed',
            success: false,
          });
        }
      });

      xhr.addEventListener('error', () => {
        setUploadProgress({
          isUploading: false,
          progress: 0,
          error: 'Network error occurred during upload',
          success: false,
        });
      });

      xhr.open('POST', endpoint);
      xhr.send(formData);
    } catch (error) {
      setUploadProgress({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false,
      });
    }
  };

  const getTitle = () => {
    return type === 'client-data'
      ? 'Upload Client Data'
      : 'Upload Vendor Response';
  };

  const getDescription = () => {
    return type === 'client-data'
      ? 'Upload the client sales/visit data Excel file'
      : 'Upload the vendor match response Excel file';
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold text-white mb-4">{getTitle()}</h2>

      <FileUpload
        onFileSelect={handleFileSelect}
        label=""
        description={getDescription()}
      />

      {selectedFile && !uploadProgress.success && (
        <div className="mt-6">
          <GlassButton
            onClick={handleUpload}
            disabled={uploadProgress.isUploading}
            className="w-full"
          >
            {uploadProgress.isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading... {Math.round(uploadProgress.progress)}%
              </>
            ) : (
              'Upload File'
            )}
          </GlassButton>
        </div>
      )}

      {uploadProgress.isUploading && (
        <div className="mt-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          <p className="text-sm text-white/60 mt-2 text-center">
            {Math.round(uploadProgress.progress)}% complete
          </p>
        </div>
      )}

      {uploadProgress.success && (
        <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-400">
              Upload Successful
            </p>
            <p className="text-sm text-white/60 mt-1">
              Your file has been uploaded and is ready for processing
            </p>
          </div>
        </div>
      )}

      {uploadProgress.error && (
        <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Upload Failed</p>
            <p className="text-sm text-white/60 mt-1">{uploadProgress.error}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
