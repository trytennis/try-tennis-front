import { useEffect, useState } from 'react';
import type { Ticket } from '../types/Ticket';
import '../styles/AssignTicketModal.css';
import { authGet, authPost } from '../utils/authApi';

interface Props {
    userId: string;
    onClose: () => void;
    onAssigned: () => void; // 수강권 배정 후 실행할 콜백 (예: 목록 갱신)
}

const AssignTicketModal = ({ userId, onClose, onAssigned }: Props) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [remainingCount, setRemainingCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        authGet<Ticket[]>('/api/tickets').then(setTickets).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedTicket && startDate) {
            const start = new Date(startDate);
            const expires = new Date(start);
            expires.setDate(start.getDate() + selectedTicket.valid_days);
            setEndDate(expires.toISOString().split('T')[0]);
            setRemainingCount(selectedTicket.lesson_count);
        }
    }, [selectedTicket, startDate]);

    const handleSubmit = async () => {
        if (!selectedTicket || !startDate || !endDate) return;
        setLoading(true);
        try {
            await authPost(`/api/users/${userId}/tickets`, {
                ticket_id: selectedTicket.id,
                assigned_at: startDate,
                expires_at: endDate,
                remaining_count: remainingCount,
            });
            onAssigned();
            onClose();
        } catch (err) {
            console.error('배정 실패:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="assign-modal-overlay">
            <div className="assign-modal">
                <h3>수강권 배정</h3>

                <label>수강권 선택</label>
                <select
                    value={selectedTicket?.id || ''}
                    onChange={(e) => {
                        const t = tickets.find((t) => t.id === e.target.value) || null;
                        setSelectedTicket(t);
                    }}
                >
                    <option value="">-- 수강권 선택 --</option>
                    {tickets.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                <label>이용 시작일</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <label>이용 종료일</label>
                <input type="date" value={endDate} readOnly />

                <label>전체 횟수</label>
                <input type="number" value={selectedTicket?.lesson_count || 0} readOnly />

                <label>잔여 횟수</label>
                <input
                    type="number"
                    value={remainingCount}
                    onChange={(e) => setRemainingCount(Number(e.target.value))}
                    min={0}
                    max={selectedTicket?.lesson_count || 0}
                />

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-button">취소</button>
                    <button onClick={handleSubmit} disabled={loading || !selectedTicket || !startDate} className="confirm-button">
                        {loading ? '배정 중...' : '배정하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTicketModal;
