import '../styles/TicketCard.css';

const TicketSkeletonCard = () => {
  return (
    <div className="ticket-card skeleton">
      <div className="skeleton-title shimmer" />
      <div className="ticket-info">
        <div className="info-row">
          <span className="skeleton-line shimmer" style={{ width: '40%' }} />
          <span className="skeleton-line shimmer" style={{ width: '30%' }} />
        </div>
        <div className="info-row">
          <span className="skeleton-line shimmer" style={{ width: '40%' }} />
          <span className="skeleton-line shimmer" style={{ width: '30%' }} />
        </div>
        <div className="info-row">
          <span className="skeleton-line shimmer" style={{ width: '40%' }} />
          <span className="skeleton-line shimmer" style={{ width: '50%' }} />
        </div>
        <div className="info-row border-top">
          <span className="skeleton-line shimmer" style={{ width: '40%' }} />
          <span className="skeleton-line shimmer" style={{ width: '50%' }} />
        </div>
      </div>
    </div>
  );
};

export default TicketSkeletonCard;
