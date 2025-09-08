import React from 'react';
import '../styles/AnalysisResult.css';

interface Props {
  analyzedUrl: string;
  videoUrl: string;
}

const AnalysisMedia: React.FC<Props> = ({ analyzedUrl, videoUrl }) => {
  return (
    <div className="media-row">
      <div className="media-card">
        <img src={analyzedUrl} alt="분석 GIF" className="media-img" />
        {/* <video src={analyzedUrl} controls className="media-video" /> */}
      </div>
      <div className="media-card">
        <video src={videoUrl} controls className="media-video" />
      </div>
    </div>
  );
};

export default AnalysisMedia;