// 비디오 분석 결과
export interface AnalysisData {
    average_angle: number;
    average_speed: number;
    max_speed: number;
    frame_count: number;
    chart_url: string;
    gif_url: string;
    video_url: string
};

export interface AnalysisHistory extends AnalysisData {
    id: string;        
    user_id: string | null;
    created_at: string;
}
