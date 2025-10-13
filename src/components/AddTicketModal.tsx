// src/components/AddTicketModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import '../styles/AddTicketModal.css';
import { useMyRole } from '../utils/useMyRole';
import { FacilitiesApi } from '../api/facility';
import type { Facility } from '../types/FacilityData';

export type NewTicketPayload = {
    name: string;
    lesson_count: number;
    valid_days: number;
    price: number;
    /** super_admin은 반드시 지정 */
    facility_id?: string;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: NewTicketPayload) => Promise<void> | void;
};

const AddTicketModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
    const { role } = useMyRole();
    const isSuperAdmin = role === 'super_admin';

    const [name, setName] = useState('');
    const [lessonCount, setLessonCount] = useState('');
    const [validDays, setValidDays] = useState('30');
    const [price, setPrice] = useState('');
    const [pricePerLesson, setPricePerLesson] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // 시설 선택(슈퍼어드민 전용)
    const [facilityId, setFacilityId] = useState<string>(''); // 반드시 선택
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facLoading, setFacLoading] = useState(false);
    const [facError, setFacError] = useState<string>('');

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

    // 슈퍼어드민일 때만 시설 목록 로드 (+ 첫 번째 자동 선택)
    useEffect(() => {
        if (!isOpen || !isSuperAdmin) return;
        (async () => {
            try {
                setFacLoading(true);
                setFacError('');
                const list = await FacilitiesApi.list();
                setFacilities(list || []);
                if ((list?.length ?? 0) > 0) {
                    setFacilityId(list![0].id); // 무조건 하나 선택: 첫 항목 자동 선택
                } else {
                    setFacilityId('');
                    setFacError('등록 가능한 시설이 없습니다. 먼저 시설을 생성하세요.');
                }
            } catch (e) {
                console.error('시설 목록 로드 실패:', e);
                setFacError('시설 목록을 불러오지 못했습니다.');
            } finally {
                setFacLoading(false);
            }
        })();
    }, [isOpen, isSuperAdmin]);

    const resetForm = () => {
        setName('');
        setLessonCount('');
        setValidDays('30');
        setPrice('');
        setPricePerLesson(0);
        setFacilityId(facilities[0]?.id ?? '');
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!name.trim()) return alert('수강권 이름을 입력하세요.');
        if (parseInt(lessonCount) <= 0) return alert('횟수는 1 이상이어야 합니다.');
        if (parseInt(validDays) <= 0) return alert('유효 기간은 1일 이상이어야 합니다.');
        if (parseInt(price) <= 0) return alert('가격은 1원 이상이어야 합니다.');
        if (isSuperAdmin) {
            if (!facilityId) return alert('시설을 선택하세요.');
            if (facError) return alert(facError);
        }

        setSubmitting(true);
        try {
            const payload: NewTicketPayload = {
                name,
                lesson_count: parseInt(lessonCount),
                valid_days: parseInt(validDays),
                price: parseInt(price),
            };

            // super_admin은 반드시 facility_id 지정 (글로벌 금지)
            if (isSuperAdmin) {
                payload.facility_id = facilityId; // 빈 값 불가
            }

            await onSubmit(payload);
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

    const submitDisabled =
        submitting ||
        (isSuperAdmin && (!!facError || facLoading || !facilityId));

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
                    {/* 슈퍼어드민 전용: 시설 선택 (글로벌 옵션 제거, 반드시 하나 선택) */}
                    {isSuperAdmin && (
                        <div className="atm-field">
                            <label className="atm-label">
                                시설 선택 <span className="atm-required">*</span>
                            </label>
                            <select
                                className="atm-input"
                                value={facilityId}
                                onChange={(e) => setFacilityId(e.target.value)}
                                disabled={facLoading || submitting || !!facError}
                                required
                            >
                                {facilities.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                            {facLoading && <small className="atm-hint">시설 목록을 불러오는 중…</small>}
                            {facError && <small className="atm-error">{facError}</small>}
                        </div>
                    )}

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
                        <button type="submit" className="atm-btn-primary" disabled={submitDisabled}>
                            {submitting ? (
                                '등록 중…'
                            ) : (
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
