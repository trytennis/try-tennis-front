import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import '../styles/AddTicketModal.css';

export type NewTicketPayload = {
    name: string;
    lesson_count: number;
    valid_days: number;
    price: number;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: NewTicketPayload) => Promise<void> | void;
};

const AddTicketModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [lessonCount, setLessonCount] = useState('');
    const [validDays, setValidDays] = useState('30');
    const [price, setPrice] = useState('');
    const [pricePerLesson, setPricePerLesson] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // ESC로 닫기
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // 회당 가격 자동 계산
    useEffect(() => {
        const lessons = parseInt(lessonCount) || 0;
        const totalPrice = parseInt(price) || 0;
        if (lessons > 0 && totalPrice > 0) {
            setPricePerLesson(Math.floor(totalPrice / lessons));
        } else {
            setPricePerLesson(0);
        }
    }, [lessonCount, price]);

    const resetForm = () => {
        setName('');
        setLessonCount('');
        setValidDays('30');
        setPrice('');
        setPricePerLesson(0);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!name.trim()) return alert('수강권 이름을 입력하세요.');
        if (parseInt(lessonCount) <= 0) return alert('횟수는 1 이상이어야 합니다.');
        if (parseInt(validDays) <= 0) return alert('유효 기간은 1일 이상이어야 합니다.');
        if (parseInt(price) <= 0) return alert('가격은 1원 이상이어야 합니다.');

        setSubmitting(true);
        try {
            await onSubmit({
                name,
                lesson_count: parseInt(lessonCount),
                valid_days: parseInt(validDays),
                price: parseInt(price),
            });
            resetForm();
            onClose();
        } catch (error) {
            console.error('등록 실패:', error);
            alert('수강권 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // 바깥 클릭 닫기
    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="atm-backdrop" onClick={onBackdropClick}>
            <div className="atm-modal" role="dialog" aria-modal="true" aria-labelledby="atm-title">
                {/* 헤더 */}
                <div className="atm-header">
                    <h2 id="atm-title">수강권 추가</h2>
                    <button className="atm-icon-btn" onClick={onClose} aria-label="닫기">
                        <X size={18} color="#6b7280" />
                    </button>
                </div>

                {/* 바디 */}
                <form className="atm-body" onSubmit={handleSubmit}>
                    {/* 수강권 이름 */}
                    <div className="atm-field">
                        <label className="atm-label">
                            수강권 이름 <span className="atm-required">*</span>
                        </label>
                        <input
                            className="atm-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 10회 수강권"
                            required
                        />
                    </div>

                    {/* 횟수 & 유효기간 */}
                    <div className="atm-grid2">
                        <div className="atm-field">
                            <label className="atm-label">
                                횟수 <span className="atm-required">*</span>
                            </label>
                            <input
                                className="atm-input"
                                type="number"
                                value={lessonCount}
                                onChange={(e) => setLessonCount(e.target.value)}
                                placeholder="10"
                                min={1}
                                required
                            />
                        </div>

                        <div className="atm-field">
                            <label className="atm-label">
                                유효 기간 (일) <span className="atm-required">*</span>
                            </label>
                            <input
                                className="atm-input"
                                type="number"
                                value={validDays}
                                onChange={(e) => setValidDays(e.target.value)}
                                placeholder="30"
                                min={1}
                                required
                            />
                        </div>
                    </div>

                    {/* 가격 */}
                    <div className="atm-field">
                        <label className="atm-label">
                            가격 (원) <span className="atm-required">*</span>
                        </label>
                        <input
                            className="atm-input"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="300000"
                            min={1}
                            required
                        />
                    </div>

                    {/* 회당 가격 (자동 계산) */}
                    <div className="atm-calculated">
                        <div className="atm-calculated-row">
                            <span className="atm-calculated-title">회당 가격</span>
                            <span className="atm-calculated-value">
                                {pricePerLesson > 0 ? `${pricePerLesson.toLocaleString()}원` : '-'}
                            </span>
                        </div>
                    </div>

                    {/* 푸터 */}
                    <div className="atm-footer">
                        <button type="button" className="atm-btn-outlined" onClick={onClose}>
                            취소
                        </button>
                        <button type="submit" className="atm-btn-primary" disabled={submitting}>
                            {submitting ? '등록 중…' : (
                                <>
                                    <Check size={16} />
                                    <span>수강권 등록</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTicketModal;