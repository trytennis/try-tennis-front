import React, { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import AnalysisResult from '../components/AnalysisResult';
import '../styles/VideoAnalysisPage.css';

type AnalysisData = {
  average_angle: number;
  average_speed: number;
  max_speed: number;
  frame_count: number;
};

const VideoAnalysisPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  // 추후 API 연동 시 여기에 setAnalysisData 호출
  const handleDummyUpload = () => {
    setAnalysisData({
      average_angle: 42.5,
      average_speed: 85.3,
      max_speed: 112.8,
      frame_count: 1250
    });
  };

  return (
    <div className="page-container">
      <VideoUpload />
      <button onClick={handleDummyUpload} className="analyze-button">분석 결과 불러오기 (더미)</button>
      {analysisData && <AnalysisResult data={analysisData} />}
    </div>
  );
};

export default VideoAnalysisPage;
