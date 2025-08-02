import '../styles/TicketCard.css';
import type { UserTicket } from '../types/UserTicket';

interface Props {
    ticket: UserTicket;
}

const UserTicketCard = ({ ticket }: Props) => {
    return (
        <div className="ticket-card">
            <h3 className="ticket-name">{ticket.tickets.name}</h3>
            <div className="ticket-info">
                <div className="info-row">
                    <span>남은 횟수</span>
                    <span>{ticket.remaining_count}회</span>
                </div>
                <div className="info-row">
                    <span>배정일</span>
                    <span>{new Date(ticket.assigned_at).toLocaleDateString()}</span>
                </div>
                <div className="info-row border-top">
                    <span>만료일</span>
                    <span>{new Date(ticket.expires_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default UserTicketCard;
