import type { AnalysisData, AnalysisHistory } from "../types/AnalysisData";
import { get, post } from "../utils/api";

/**
 * 분석 기록 조회 (created_at DESC 정렬은 서버에서 처리)
 * @param userId - 필수
 * @param limit  - 기본 50
 * @param offset - 기본 0
 */
export const fetchAnalysisHistory = async (
    userId: string,
    limit = 50,
    offset = 0
): Promise<AnalysisHistory[]> => {
    const qs = new URLSearchParams({
        user_id: userId,
        limit: String(limit),
        offset: String(offset),
    }).toString();

    return await get<AnalysisHistory[]>(`/api/analyzed-videos?${qs}`);
};


/**
 * 분석 실행
 * 서버는 결과 파일들의 public URL을 반환해야 함:
 *  - res.urls["result.json"], res.urls["chart.png"], res.urls["swing.gif"]
 * 이후 result.json을 다시 GET 해 파싱한다.
 *
 * @returns AnalysisData (chart_url/gif_url/video_url 포함)
 */
export const analyzeVideo = async (payload: {
    video_url: string;
    video_id: string;
    uploader_user_id?: string; // 로그인 붙기 전 임시
}): Promise<AnalysisHistory> => {
    const res = await post(`/api/analyze`, payload);

    const jsonUrl: string = res?.urls?.["result.json"];
    if (!jsonUrl) throw new Error("분석 결과 JSON URL이 없습니다.");

    const parsed = await fetch(jsonUrl).then((r) => r.json());

    // 서버 DB 스키마 컬럼(snake_case)에 맞춤
    return {
        id: res.id ?? "", // 서버가 응답에 포함시킨다면
        user_id: payload.uploader_user_id ?? null,
        video_url: payload.video_url,
        average_angle: parsed.average_angle,
        average_speed: parsed.average_speed,
        max_speed: parsed.max_speed,
        frame_count: parsed.frame_count,
        gif_url: res.urls["swing.gif"] ?? null,
        chart_url: res.urls["chart.png"] ?? null,
        created_at: new Date().toISOString(), // 서버 응답에 없으면 클라이언트에서 채워줌
    };
};