'use client';

import { useEffect, useState } from 'react';
import { api, UploadedFile } from '@/lib/api';
import { GlassCard } from '../ui';
import { File, FileCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface UploadedFilesListProps {
  campaignId: string;
}

export function UploadedFilesList({ campaignId }: UploadedFilesListProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUploadedFiles(campaignId);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [campaignId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type === 'client') {
      return <File className="w-5 h-5 text-blue-400" />;
    } else if (type === 'vendor') {
      return <FileCheck className="w-5 h-5 text-green-400" />;
    }
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const getFileLabel = (type: string) => {
    if (type === 'client') return 'Client Data';
    if (type === 'vendor') return 'Vendor Response';
    return 'Unknown';
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Error Loading Files</p>
            <p className="text-sm text-white/60 mt-1">{error}</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Uploaded Files</h2>
        <span className="text-sm text-white/60">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8">
          <File className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No files uploaded yet</p>
          <p className="text-sm text-white/40 mt-1">
            Upload client data and vendor response files to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {file.filename}
                    </p>
                    <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70 flex-shrink-0">
                      {getFileLabel(file.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-white/60">
                      {formatFileSize(file.size)}
                    </p>
                    <span className="text-white/40">•</span>
                    <p className="text-xs text-white/60">
                      {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
