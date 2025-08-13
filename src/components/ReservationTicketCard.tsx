import React from "react";
import type { UserTicket } from "../types/UserTicket";
import "../styles/ReservationTicketCard.css";

type Props = {
  ticket: UserTicket;
  isSelected: boolean;
  onClick: () => void;
};

const ReservationTicketCard = ({ ticket, isSelected, onClick }: Props) => {
  return (
    <div
      className={`reservation-ticket-card compact ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="reservation-ticket-name">{ticket.tickets.name}</div>
      <div className="reservation-ticket-count">
        <span className="remaining">{ticket.remaining_count}</span>
        <span className="total">/{ticket.tickets.lesson_count}</span>
        <span className="unit">회</span>
      </div>
      <div className="reservation-ticket-expires">{ticket.expires_at} 만료</div>
    </div>
  );
};

export default ReservationTicketCard;
