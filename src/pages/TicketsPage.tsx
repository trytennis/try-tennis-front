import { useEffect, useState } from 'react';
import TicketCard from '../components/TicketCard';
import '../styles/TicketsPage.css';
import { get } from '../utils/api';
import type { Ticket } from '../types/Ticket';

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await get<Ticket[]>('/api/tickets');
        setTickets(data);
      } catch (error) {
        console.error('수강권 불러오기 실패:', error);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className='page-container'>
      <div className="ticket-wrapper">
        <div className="header">
          <h2>수강권 관리</h2>
          <button className="add-button">수강권 추가</button>
        </div>
        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              name={ticket.name}
              count={ticket.lesson_count}
              duration={`${ticket.valid_days}일`}
              price={`${ticket.price.toLocaleString()}원`}
              pricePer={`${ticket.price_per_lesson.toLocaleString()}원`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
