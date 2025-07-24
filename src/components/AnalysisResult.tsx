import React from 'react';
import '../styles/AnalysisResult.css';

type AnalysisData = {
  average_angle: number;
  average_speed: number;
  max_speed: number;
  frame_count: number;
};

const AnalysisResult: React.FC<{ data: AnalysisData }> = ({ data }) => {
  return (
    <div className="result-card">
      <h3 className="result-title">📊 분석 결과</h3>
      <div className="result-list">
        <div className="result-item blue">
          <div className="analysis-label-wrap">
            <span className="analysis-icon">🎯</span>
            <span className="analysis-label">스윙 각도 (평균)</span>
          </div>
          <span className="value">{data.average_angle}°</span>
        </div>

        <div className="result-item green">
          <div className="analysis-label-wrap">
            <span className="analysis-icon">📈</span>
            <span className="analysis-label">스윙 속도 (평균)</span>
          </div>
          <span className="value">{data.average_speed} km/h</span>
        </div>

        <div className="result-item yellow">
          <div className="analysis-label-wrap">
            <span className="analysis-icon">⚡</span>
            <span className="analysis-label">최고 속도</span>
          </div>
          <span className="value">{data.max_speed} km/h</span>
        </div>

        <div className="result-item purple">
          <div className="analysis-label-wrap">
            <span className="analysis-icon">📊</span>
            <span className="analysis-label">프레임 수</span>
          </div>
          <span className="value">{data.frame_count}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
