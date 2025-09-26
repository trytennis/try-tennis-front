import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import '../styles/TicketsPage.css';
import type { Ticket } from '../types/Ticket';
import TicketSkeletonCard from '../components/TicketSkeletonCard';
import { TicketsApi } from '../api/ticket';

const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await TicketsApi.list({ limit: 100, offset: 0 }); // 토큰 자동첨부
                setTickets(data);
            } catch (error) {
                console.error('수강권 불러오기 실패:', error);
                // 401/403은 utils/api.ts에서 에러 throw됨 → 필요하면 여기서 안내 토스트/리다이렉트 처리
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return (
        <div className='page-container'>
            <div className="ticket-wrapper">
                <div className="ticket-header">
                    <h2>수강권 관리</h2>
                    <button className="add-button" onClick={() => navigate('/tickets/add')}>
                        수강권 추가
                    </button>
                </div>

                <div className="ticket-grid">
                    {isLoading
                        ? Array.from({ length: 3 }).map((_, i) => <TicketSkeletonCard key={i} />)
                        : tickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                name={ticket.name}
                                count={ticket.lesson_count}
                                duration={`${ticket.valid_days}일`}
                                price={`${ticket.price.toLocaleString()}원`}
                                pricePer={`${ticket.price_per_lesson.toLocaleString()}원`}
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default TicketsPage;
