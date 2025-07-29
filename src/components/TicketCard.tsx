import React from 'react';
import '../styles/TicketCard.css';

type Props = {
  name: string;
  count: number;
  duration: string;
  price: string;
  pricePer: string;
};

const TicketCard = ({ name, count, duration, price, pricePer }: Props) => {
  return (
    <div className="ticket-card">
      <h3 className="ticket-name">{name}</h3>
      <div className="ticket-info">
        <div className="info-row">
          <span>횟수</span>
          <span>{count}회</span>
        </div>
        <div className="info-row">
          <span>기간</span>
          <span>{duration}</span>
        </div>
        <div className="info-row">
          <span>판매 금액</span>
          <span className="price">{price}</span>
        </div>
        <div className="info-row border-top">
          <span>회당 가격</span>
          <span className="price-per">{pricePer}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
