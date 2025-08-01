import { useState, useEffect } from 'react';
import { post } from '../utils/api';
import '../styles/AddTicketPage.css';
import { useNavigate } from 'react-router-dom';

const AddTicketPage: React.FC = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [lessonCount, setLessonCount] = useState(0);
    const [validDays, setValidDays] = useState(30);
    const [price, setPrice] = useState(0);
    const [pricePerLesson, setPricePerLesson] = useState(0);

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

        try {
            const ticketData = {
                name,
                lesson_count: lessonCount,
                valid_days: validDays,
                price,
                facility_id: '00000000-0000-0000-0000-0000000000fa', // 테스트용, 나중에 자동화
            };
            await post('/api/tickets', ticketData);
            alert('수강권이 추가되었습니다!');
            navigate('/tickets');
        } catch (error) {
            console.error('등록 실패:', error);
            alert('등록에 실패했습니다.');
        }
    };

    return (
        <div className="add-ticket-container">
            <form className="ticket-form" onSubmit={handleSubmit}>
                <h2>수강권 추가</h2>

                <label>
                    수강권 이름
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>

                <label>
                    횟수
                    <input type="number" value={lessonCount} onChange={(e) => setLessonCount(parseInt(e.target.value))} required />
                </label>

                <label>
                    유효 기간 (일)
                    <input type="number" value={validDays} onChange={(e) => setValidDays(parseInt(e.target.value))} required />
                </label>

                <label>
                    가격 (원)
                    <input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value))} required />
                </label>

                <label>
                    회당 가격 (자동 계산)
                    <input type="text" value={`${pricePerLesson.toLocaleString()}원`} readOnly />
                </label>

                <button type="submit" className="submit-button">수강권 등록</button>
            </form>
        </div>
    );
};

export default AddTicketPage;
