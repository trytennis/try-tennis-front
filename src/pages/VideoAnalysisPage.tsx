import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoUpload from "../components/VideoUpload";
import AnalysisMedia from "../components/AnalysisMedia";
import AnalysisResult from "../components/AnalysisResult";
import LoadingOverlay from "../components/LoadingOverlay";
import type { AnalysisData, AnalysisHistory } from "../types/AnalysisData";
import { analyzeVideo, fetchAnalysisHistory } from "../api/analysis";
import AnalysisHistoryItem from "../components/AnalysisHistoryItem";
import { formatDateTime } from "../utils/format";
import "../styles/VideoAnalysisPage.css";

const TEST_USER_ID = import.meta.env.VITE_TEST_USER_ID as string;

const VideoAnalysisPage: React.FC = () => {
  const [view, setView] = useState<"upload" | "history">("upload");
  const [isLoading, setIsLoading] = useState(false);

  // 히스토리 목록 (snake_case)
  const [videoHistory, setVideoHistory] = useState<AnalysisHistory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 업로드 직후 보여줄 최신 분석(히스토리와 동일 구조가 아니라서 별도로 관리 X)
  const selectedVideo = useMemo(
    () => (videoHistory.length > 0 ? videoHistory[selectedIndex] : null),
    [videoHistory, selectedIndex]
  );

  // 업로드 → 분석 실행
  const handleUploadAndAnalyze = async (publicUrl: string, videoId: string) => {
    setIsLoading(true);
    try {
      await analyzeVideo({
        video_url: publicUrl,
        video_id: videoId,
        uploader_user_id: TEST_USER_ID, // 로그인 붙으면 제거
      });

      // 분석 완료 후 최신 히스토리 재조회
      const list = await fetchAnalysisHistory(TEST_USER_ID, 50, 0);
      setVideoHistory(list);
      setSelectedIndex(0);
      setView("history");
    } catch (err) {
      console.error("[🔥] 분석 요청 실패:", err);
      alert("분석 요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 최초 로딩 시 최근 기록 가져오기 (있을 경우 업로드 탭 하단에 '최근 분석 결과'로도 활용)
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchAnalysisHistory(TEST_USER_ID, 10, 0);
        setVideoHistory(list);
        setSelectedIndex(0);
      } catch {
        // 초기엔 기록이 없을 수 있음
      }
    })();
  }, []);

  return (
    <div className="video-analysis-page">
      {isLoading && <LoadingOverlay />}

      {/* 상단 헤더 + 탭 */}
      <div className="page-header">

        <div className="tab-navigation">
          <button
            className={`tab-button ${view === "upload" ? "tab-button--active" : ""}`}
            onClick={() => setView("upload")}
          >
            새 영상 업로드
          </button>
          <button
            className={`tab-button ${view === "history" ? "tab-button--active" : ""}`}
            onClick={() => setView("history")}
          >
            분석 기록 ({videoHistory.length})
          </button>
        </div>
      </div>

      {view === "upload" ? (
        <div className="upload-view">
          {/* 업로드 카드 (VideoUpload.css의 .card/.card-title/.upload-box 스타일 사용) */}
          <VideoUpload onUploadComplete={handleUploadAndAnalyze} />

          {/* 최근 분석 결과 프리뷰 */}
          {selectedVideo && (
            <div className="recent-preview">
              <div className="recent-preview-header">
                <h3 className="recent-preview-title">
                  📊 최근 분석 결과 ({formatDateTime(selectedVideo.created_at)})
                </h3>
                {/* <button
                  className="view-all-link"
                  onClick={() => setView("history")}
                >
                  전체 기록 보기 →
                </button> */}
              </div>
              <AnalysisMedia analyzedUrl={selectedVideo.gif_url ?? ""} videoUrl={selectedVideo.video_url} />
              <AnalysisResult
                data={{
                  average_angle: selectedVideo.average_angle ?? 0,
                  average_speed: selectedVideo.average_speed ?? 0,
                  max_speed: selectedVideo.max_speed ?? 0,
                  frame_count: selectedVideo.frame_count ?? 0,
                  chart_url: selectedVideo.chart_url ?? "",
                  gif_url: selectedVideo.gif_url ?? "",
                  video_url: selectedVideo.video_url,
                }}
              />
            </div>
          )}
        </div>
      ) : (
        // 히스토리 뷰
        <div className="history-view">
          {/* 좌측 리스트 */}
          <div className="history-panel">
            <div className="history-panel-header">
              <h2 className="history-panel-title">
                📚 분석 기록
                <span className="history-count">({videoHistory.length}개)</span>
              </h2>
            </div>

            <div className="history-list">
              {videoHistory.map((v, idx) => (
                <AnalysisHistoryItem
                  key={v.id}
                  video={v}
                  isSelected={idx === selectedIndex}
                  onClick={() => setSelectedIndex(idx)}
                />
              ))}
            </div>
          </div>

          {/* 우측 상세 */}
          <div className="detail-panel">
            {selectedVideo && (
              <>
                <div className="detail-header">
                  <h2 className="detail-title">
                    🎯 영상 #{selectedVideo.id.slice(-6)} 분석 결과
                  </h2>

                  <div className="navigation-controls">
                    <button
                      className="nav-button"
                      onClick={() => setSelectedIndex((p) => Math.max(0, p - 1))}
                      disabled={selectedIndex === 0}
                      aria-label="이전"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="nav-indicator">
                      {selectedIndex + 1} / {videoHistory.length}
                    </span>
                    <button
                      className="nav-button"
                      onClick={() => setSelectedIndex((p) => Math.min(videoHistory.length - 1, p + 1))}
                      disabled={selectedIndex === videoHistory.length - 1}
                      aria-label="다음"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <AnalysisMedia analyzedUrl={selectedVideo.gif_url ?? ""} videoUrl={selectedVideo.video_url} />
                <AnalysisResult
                  data={{
                    average_angle: selectedVideo.average_angle ?? 0,
                    average_speed: selectedVideo.average_speed ?? 0,
                    max_speed: selectedVideo.max_speed ?? 0,
                    frame_count: selectedVideo.frame_count ?? 0,
                    chart_url: selectedVideo.chart_url ?? "",
                    gif_url: selectedVideo.gif_url ?? "",
                    video_url: selectedVideo.video_url,
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoAnalysisPage;