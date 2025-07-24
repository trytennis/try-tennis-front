// 비디오 업로드 박스 컴포넌트

import React from 'react';
import '../styles/VideoUpload.css';

const VideoUpload: React.FC = () => {
  return (
    <div className="card">
      <h3 className="card-title">
        📤 영상 업로드
      </h3>
      <div className="upload-box">
        <input type="file" id="video-upload" accept="video/*" className="hidden" />
        <label htmlFor="video-upload" className="upload-label">
          🎞️ 영상 파일을 선택하세요
          <div className="upload-note">MP4, AVI, MOV 파일 지원</div>
        </label>
      </div>
    </div>
  );
};

export default VideoUpload;
