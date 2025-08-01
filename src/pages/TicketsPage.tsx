import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import '../styles/TicketsPage.css';
import { get } from '../utils/api';
import type { Ticket } from '../types/Ticket';
import TicketCardSkeleton from '../components/TIcketCardSkeleton';

const TicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await get<Ticket[]>('/api/tickets');
                setTickets(data);
            } catch (error) {
                console.error('수강권 불러오기 실패:', error);
            } finally {
                setIsLoading(false); // ← 로딩 끝났을 때만 false
            }
        };

        fetchTickets();
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
                        ? Array.from({ length: 3 }).map((_, i) => <TicketCardSkeleton key={i} />)
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
