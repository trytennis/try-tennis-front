import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/TicketDetailPage.css';
import type { Ticket } from '../types/Ticket';
import { TicketsApi } from '../api/ticket';
import type { AssignedUser } from '../types/AssignedUser';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    (async () => {
      try {
        const [ticketData, userList] = await Promise.all([
          TicketsApi.getById(ticketId),
          TicketsApi.listUsers(ticketId),
        ]);
        setTicket(ticketData);
        setUsers(userList);
      } catch (err) {
        console.error('수강권 상세 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [ticketId]);

  if (loading) return <div className="ticket-detail-page">불러오는 중...</div>;
  if (!ticket) return <div className="ticket-detail-page">수강권 정보를 찾을 수 없습니다.</div>;

  const fmtDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : '-';

  return (
    <div className="ticket-detail-page">
      <div className="ticket-info-summary">
        <h2>{ticket.name}</h2>
        <div className="summary-grid">
          <div><strong>횟수:</strong> {ticket.lesson_count}회</div>
          <div><strong>기간:</strong> {ticket.valid_days}일</div>
          <div><strong>가격:</strong> {ticket.price.toLocaleString()}원</div>
          <div><strong>회당:</strong> {ticket.price_per_lesson.toLocaleString()}원</div>
        </div>
      </div>

      <div className="user-list-section">
        <h3>발급된 수강권</h3>
        {users.length === 0 ? (
          <p>아직 이 수강권을 배정받은 유저가 없습니다.</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>이름</th>
                {/* <th>유형</th> */}
                <th>남은 횟수</th>
                <th>배정일</th>
                <th>만료일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  {/* <td>{u.user_type}</td> */}
                  <td>{u.remaining_count}</td>
                  <td>{fmtDate(u.assigned_at)}</td>
                  <td>{fmtDate(u.expires_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage;
