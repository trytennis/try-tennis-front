import React, { useState } from 'react';
import VideoUpload from '../components/VideoUpload';
import AnalysisResult from '../components/AnalysisResult';
import type { AnalysisData } from '../types/AnalysisData';
import { post } from '../utils/api';
import AnalysisMedia from '../components/AnalysisMedia';
import LoadingOverlay from '../components/LoadingOverlay';

const VideoAnalysisPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadAndAnalyze = async (publicUrl: string, videoId: string) => {
    setIsLoading(true);
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
        chartUrl: result.urls["chart.png"],
        gifUrl: result.urls["swing.gif"],
        videoUrl: publicUrl,
      });
    } catch (err) {
      console.error('[🔥] 분석 요청 실패:', err);
      alert('분석 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {isLoading && <LoadingOverlay />}
      <VideoUpload onUploadComplete={handleUploadAndAnalyze} />
      {analysisData && (
        <>
          <AnalysisMedia gifUrl={analysisData.gifUrl} videoUrl={analysisData.videoUrl} />
          <AnalysisResult data={analysisData} />
        </>
      )}
    </div>
  );
};

export default VideoAnalysisPage;
