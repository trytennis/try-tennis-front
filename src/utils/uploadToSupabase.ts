import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * 영상 파일을 Supabase Storage에 업로드하고 public URL을 반환
 * @param file - 업로드할 영상 파일
 * @param videoId - 업로드 경로에 사용할 고유 식별자
 * @returns public URL
 */
export async function uploadToSupabase(file: File, videoId?: string): Promise<string> {
  try {
    const id = videoId || uuidv4();  // 없으면 uuid 생성
    const fileExt = file.name.split('.').pop();
    const filePath = `${id}/input.${fileExt}`;

    console.log(`[📤] 영상 업로드 시작: ${file.name} → ${filePath}`);

    const { error } = await supabase
      .storage
      .from('analysis-raw-videos') // 버킷 이름
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error('[❌] Supabase 업로드 실패:', error.message);
      throw error;
    }

    const { data } = supabase
      .storage
      .from('analysis-raw-videos')
      .getPublicUrl(filePath);

    console.log(`[✅] 업로드 완료! URL: ${data.publicUrl}`);
    return data.publicUrl;

  } catch (err) {
    console.error('[🔥] uploadToSupabase 오류:', err);
    throw err;
  }
}
