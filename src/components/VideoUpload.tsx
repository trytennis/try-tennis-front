import React from 'react';
import { uploadToSupabase } from '../utils/uploadToSupabase';
import '../styles/VideoUpload.css';

interface VideoUploadProps {
  onUploadComplete: (publicUrl: string, videoId: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const videoId = `vid-${Date.now()}`;
    try {
      const publicUrl = await uploadToSupabase(file, videoId);
      onUploadComplete(publicUrl, videoId);
    } catch (err) {
      alert('업로드에 실패했습니다.');
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">📤 영상 업로드</h3>
      <div className="upload-box">
        <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={handleChange} />
        <label htmlFor="video-upload" className="upload-label">
          🎞️ 영상 파일을 선택하세요
          <div className="upload-note">MP4, AVI, MOV 파일 지원</div>
        </label>
      </div>
    </div>
  );
};

export default VideoUpload;
