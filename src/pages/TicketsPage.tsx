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
        if (typeof (created as any).price_per_lesson !== 'number') {
            (created as any).price_per_lesson = Math.floor(
                created.price / created.lesson_count
            );
        }
        // 빠르게 반영하려면 낙관적 추가
        setTickets((prev) => [created, ...prev]);
        alert('수강권이 추가되었습니다!');
        // 혹시 서버 정렬/계산 필드 차이가 있으면 아래 재조회로 동기화
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
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <TicketSkeletonCard key={i} />
                        ))
                        : tickets.map((ticket) => {
                            const ppl =
                                (ticket as any).price_per_lesson ??
                                Math.floor(ticket.price / ticket.lesson_count);
                            return (
                                <TicketCard
                                    key={ticket.id}
                                    name={ticket.name}
                                    count={ticket.lesson_count}
                                    duration={`${ticket.valid_days}일`}
                                    price={`${ticket.price.toLocaleString()}원`}
                                    pricePer={`${ppl.toLocaleString()}원`}
                                    onClick={() => handleTicketClick(ticket.id)}
                                />
                            );
                        })}
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
            />
        </div>
    );
};

export default TicketsPage;