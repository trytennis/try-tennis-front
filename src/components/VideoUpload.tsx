import React, { useRef, useState, useCallback } from 'react';
import { ulid } from 'ulid';
import { uploadToSupabase } from '../utils/uploadToSupabase';
import '../styles/VideoUpload.css';

interface VideoUploadProps {
  onUploadComplete: (publicUrl: string, videoId: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  const MAX_BYTES = 500 * 1024 * 1024;
  const MIN_SECONDS = 3;
  const MAX_SECONDS = 5 * 60;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFiles = useCallback(async (files?: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (file.size > MAX_BYTES) {
      alert('영상은 최대 500MB까지 업로드할 수 있습니다.');
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert('영상 파일만 업로드할 수 있습니다.');
      return;
    }

    const videoId = `vid-${ulid()}`;
    try {
      setIsUploading(true);
      const duration = await new Promise<number>((resolve, reject) => {
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => { URL.revokeObjectURL(probe.src); resolve(probe.duration); };
        probe.onerror = () => reject(new Error('영상 정보를 읽을 수 없습니다.'));
        probe.src = URL.createObjectURL(file);
      });
      if (duration < MIN_SECONDS || duration > MAX_SECONDS) {
        throw new Error('영상 길이는 3초 이상 5분 이하여야 합니다.');
      }
      const publicUrl = await uploadToSupabase(file, videoId);
      onUploadComplete(publicUrl, videoId);
    } catch (err) {
      alert(err instanceof Error ? err.message : '업로드에 실패했습니다.');
      // console.error(err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [onUploadComplete]);

  // 클릭 업로드
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  // 드래그앤드롭
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 드롭 영역 밖으로 완전히 벗어났을 때만 해제
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  return (
    <div className="card">
      <h3 className="card-title">📤 영상 업로드</h3>

      <div
        className={`upload-box ${isDragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
        onClick={pickFile}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pickFile()}
        aria-busy={isUploading}
        aria-label="영상 파일을 드래그앤드롭하거나 클릭해서 업로드"
      >
        <input
          ref={inputRef}
          type="file"
          id="video-upload"
          accept="video/*"
          className="hidden"
          onChange={handleChange}
        />
        <div className="upload-label">
          <div className="upload-emoji">🎞️</div>
          <div className="upload-title">{isUploading ? '업로드 중...' : '영상 파일을 선택하거나 여기로 드롭'}</div>
          <div className="upload-note">MP4 권장 · AVI, MOV 지원</div>
          <div className="upload-hint">3초~5분 · 최대 500MB</div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
