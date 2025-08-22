import React from 'react';
import '../styles/LoadingOverlay.css';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">분석 중입니다... 잠시만 기다려주세요 ⏳</p>
    </div>
  );
};

export default LoadingOverlay;