import React from 'react';
import '../styles/AnalysisMedia.css';

interface Props {
  gifUrl: string;
  videoUrl: string;
}

const AnalysisMedia: React.FC<Props> = ({ gifUrl, videoUrl }) => {
  return (
    <div className="media-row">
      <div className="media-card">
        <img src={gifUrl} alt="분석 GIF" className="media-img" />
      </div>
      <div className="media-card">
        <video src={videoUrl} controls className="media-video" />
      </div>
    </div>
  );
};

export default AnalysisMedia;