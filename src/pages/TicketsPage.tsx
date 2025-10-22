import { useEffect, useState } from 'react';
import TicketCard from '../components/TicketCard';
import '../styles/TicketsPage.css';
import type { Ticket } from '../types/Ticket';
import TicketSkeletonCard from '../components/TicketSkeletonCard';
import { TicketsApi } from '../api/ticket';
import type { NewTicketPayload } from '../components/AddTicketModal';
import AddTicketModal from '../components/AddTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';

const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const fetchTickets = async () => {
        try {
            const data = await TicketsApi.list({ limit: 100, offset: 0 });
            setTickets(data);
        } catch (error) {
            console.error('수강권 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleAddSubmit = async (payload: NewTicketPayload) => {
        const created = await TicketsApi.create(payload);

        const count = Number(created.lesson_count) || 0;
        const price = Number(created.price) || 0;
        const ppl =
            created.price_per_lesson != null
                ? Number(created.price_per_lesson)
                : (count > 0 ? Math.floor(price / count) : 0);

        const normalized: Ticket = {
            ...created,
            price: price,
            lesson_count: count,
            price_per_lesson: Number.isFinite(ppl) ? ppl : 0,
        } as Ticket;

        // 낙관적 반영
        setTickets((prev) => [normalized, ...prev]);
        alert('수강권이 추가되었습니다!');

        // 서버 정렬/계산과 동기화
        await fetchTickets();
    };

    const handleTicketClick = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTicketId(null);
    };

    return (
        <div className="page-container">
            <div className="ticket-wrapper">
                <div className="ticket-header">
                    <h2>수강권 관리</h2>
                    <button
                        className="add-button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        수강권 추가
                    </button>
                </div>

                <div className="ticket-grid">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <TicketSkeletonCard key={i} />)
                        : tickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onClick={() => handleTicketClick(ticket.id)}
                            />
                        ))}
                </div>
            </div>

            {/* 추가 모달 */}
            <AddTicketModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
            />

            {/* 상세 모달 */}
            <TicketDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                ticketId={selectedTicketId}
                onUpdate={fetchTickets} // 수정/삭제 후 리스트 새로고침
            />
        </div>
    );
};

export default TicketsPage;
