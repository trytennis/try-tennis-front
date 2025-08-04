import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/TicketDetailPage.css';
import { get } from '../utils/api';
import type { Ticket } from '../types/Ticket';

type AssignedUser = {
  user_id: string;
  name: string;
  user_type: string;
  remaining_count: number;
  assigned_at: string;
  expires_at: string;
};

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const ticketData = await get<Ticket>(`/api/tickets/${ticketId}`);
        setTicket(ticketData);

        const userList = await get<AssignedUser[]>(`/api/tickets/${ticketId}/users`);
        setUsers(userList);
      } catch (err) {
        console.error('수강권 상세 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchDetails();
  }, [ticketId]);

  if (loading) return <div className="ticket-detail-page">불러오는 중...</div>;
  if (!ticket) return <div className="ticket-detail-page">수강권 정보를 찾을 수 없습니다.</div>;

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
                <th>유형</th>
                <th>남은 횟수</th>
                <th>배정일</th>
                <th>만료일</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  <td>{u.user_type}</td>
                  <td>{u.remaining_count}</td>
                  <td>{new Date(u.assigned_at).toLocaleDateString()}</td>
                  <td>{new Date(u.expires_at).toLocaleDateString()}</td>
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
