import React from 'react';
import { Calendar, Clock, DollarSign, Building2 } from 'lucide-react';
import type { Ticket } from '../types/Ticket';
import '../styles/TicketCard.css';

type Props = {
  ticket: Ticket;
  onClick?: () => void;
};

// 숫자 안전 변환 (numeric 문자열/undefined/null 대비)
function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const TicketCard: React.FC<Props> = ({ ticket, onClick }) => {
  const count = toNumber(ticket.lesson_count);
  const price = toNumber(ticket.price);
  const pplRaw =
    ticket.price_per_lesson != null
      ? toNumber(ticket.price_per_lesson)
      : (count > 0 ? Math.floor(price / count) : 0);

  return (
    <div className="ticket-card clickable" onClick={onClick}>
      <div className="ticket-card-header">
        {!!ticket.facility_name && (
          <div className="facility-badge">
            <Building2 className="facility-icon" />
            {ticket.facility_name}
          </div>
        )}
        <h3 className="ticket-name">{ticket.name}</h3>
      </div>

      <div className="ticket-info">
        <div className="info-row">
          <span className="info-label">
            <Calendar className="info-icon" />
            횟수
          </span>
          <span className="info-value">{count}회</span>
        </div>

        <div className="info-row">
          <span className="info-label">
            <Clock className="info-icon" />
            기간
          </span>
          <span className="info-value">{ticket.valid_days}일</span>
        </div>

        <div className="info-row">
          <span className="info-label">
            <DollarSign className="info-icon" />
            판매 금액
          </span>
          <span className="price">{price.toLocaleString()}원</span>
        </div>

        <div className="info-row border-top">
          <span className="info-label">회당 가격</span>
          <span className="price-per">{pplRaw.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
