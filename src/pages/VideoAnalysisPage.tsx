import React, { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import AnalysisResult from '../components/AnalysisResult';
import '../styles/VideoAnalysisPage.css';
import type { AnalysisData } from '../types/AnalysisData';
import { post } from '../utils/api';

const VideoAnalysisPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleDummyUpload = () => {
    setAnalysisData({
      average_angle: 42.5,
      average_speed: 85.3,
      max_speed: 112.8,
      frame_count: 1250
    });
  };

  const handleUploadAndAnalyze = async (publicUrl: string, videoId: string) => {
    try {
      const result = await post('/api/analyze', {
        video_url: publicUrl,
        video_id: videoId,
      });
  
      const jsonUrl = result.urls["result.json"];
      const resJson = await fetch(jsonUrl);
      const parsed = await resJson.json();
  
      setAnalysisData({
        average_angle: parsed.average_angle,
        average_speed: parsed.average_speed,
        max_speed: parsed.max_speed,
        frame_count: parsed.frame_count,
      });
    } catch (err) {
      console.error('[🔥] 분석 요청 실패:', err);
      alert('분석 요청에 실패했습니다.');
    }
  };
  
  return (
    <div className="page-container">
      <VideoUpload onUploadComplete={handleUploadAndAnalyze} />
      <button onClick={handleDummyUpload} className="analyze-button">
        분석 결과 불러오기 (더미)
      </button>
      {analysisData && <AnalysisResult data={analysisData} />}
    </div>
  );
};

export default VideoAnalysisPage;
