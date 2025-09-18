import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddTicketPage.css';
import { TicketsApi } from '../api/ticket';

const AddTicketPage: React.FC = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [lessonCount, setLessonCount] = useState(0);
    const [validDays, setValidDays] = useState(30);
    const [price, setPrice] = useState(0);
    const [pricePerLesson, setPricePerLesson] = useState(0);

    const [submitting, setSubmitting] = useState(false);

    // 회당 가격 자동 계산
    useEffect(() => {
        if (lessonCount > 0 && price > 0) {
            setPricePerLesson(Math.floor(price / lessonCount));
        } else {
            setPricePerLesson(0);
        }
    }, [lessonCount, price]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 간단 검증
        if (!name.trim()) return alert('수강권 이름을 입력하세요.');
        if (lessonCount <= 0) return alert('횟수는 1 이상이어야 합니다.');
        if (validDays <= 0) return alert('유효 기간은 1일 이상이어야 합니다.');
        if (price <= 0) return alert('가격은 1원 이상이어야 합니다.');

        setSubmitting(true);
        try {
            // auth 토큰 자동첨부 / 권한 체크는 서버에서
            await TicketsApi.create({
                name,
                lesson_count: lessonCount,
                valid_days: validDays,
                price,
                // facility_id는 백엔드에서 프로필/시설 정책으로 매핑 권장 → 프론트 전송 X
            });

            alert('수강권이 추가되었습니다!');
            navigate('/tickets');
        } catch (error: any) {
            console.error('등록 실패:', error);
            const msg = String(error?.message || '');
            if (msg.includes('forbidden') || msg.includes('403')) {
                alert('권한이 없습니다. 코치/시설관리자/관리자만 등록할 수 있습니다.');
            } else if (msg.includes('인증이 필요합니다')) {
                alert('로그인이 필요합니다. 다시 로그인해 주세요.');
            } else {
                alert('등록에 실패했습니다.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-ticket-container">
            <form className="ticket-form" onSubmit={handleSubmit}>
                <h2>수강권 추가</h2>

                <label>
                    수강권 이름
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>

                <label>
                    횟수
                    <input
                        type="number"
                        value={lessonCount}
                        onChange={(e) => setLessonCount(parseInt(e.target.value || '0', 10))}
                        min={1}
                        required
                    />
                </label>

                <label>
                    유효 기간 (일)
                    <input
                        type="number"
                        value={validDays}
                        onChange={(e) => setValidDays(parseInt(e.target.value || '0', 10))}
                        min={1}
                        required
                    />
                </label>

                <label>
                    가격 (원)
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))}
                        min={1}
                        required
                    />
                </label>

                <label>
                    회당 가격 (자동 계산)
                    <input
                        type="text"
                        value={`${pricePerLesson.toLocaleString()}원`}
                        readOnly
                    />
                </label>

                <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? '등록 중...' : '수강권 등록'}
                </button>
            </form>
        </div>
    );
};

export default AddTicketPage;
