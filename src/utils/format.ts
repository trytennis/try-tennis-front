/**
 * YYYY.MM.DD 형식으로 날짜를 포맷팅
 */
export const formatDate = (input: string | Date): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

/**
 * YYYY.MM.DD HH:MM 형식 (선택)
 */
export const formatDateTime = (input: string | Date): string => {
    const date = typeof input === 'string' ? new Date(input) : input;
    return `${formatDate(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/**
 * 숫자 가격을 "100,000원" 형식으로 포맷
 */
export const formatPrice = (value: number | string): string => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return `${num.toLocaleString('ko-KR')}원`;
  };
  