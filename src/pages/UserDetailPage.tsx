import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../utils/api';
import type { User } from '../types/User';
import type { UserTicket } from '../types/UserTicket';
import '../styles/UserDetailPage.css';
import UserTicketCard from '../components/UserTicketCard';

const UserDetailPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<UserTicket[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await get<User>(`/api/users/${userId}`);
                const userTickets = await get<UserTicket[]>(`/api/users/${userId}/tickets`);
                setUser(user);
                setTickets(userTickets);
            } catch (err) {
                console.error('회원 정보 조회 실패', err);
            }
        };
        fetchData();
    }, [userId]);

    if (!user) return <div className="page-container">로딩 중...</div>;

    const now = new Date();
    const activeTickets = tickets.filter(t => t.remaining_count > 0 && new Date(t.expires_at) >= now);
    const expiredTickets = tickets.filter(t => t.remaining_count <= 0 || new Date(t.expires_at) < now);

    return (
        <div className="page-container">
            <div className="user-header">
                <div>
                    <h2>{user.name}</h2>
                    <p className="role-badge">{roleLabel(user.user_type)}</p>
                </div>
                <button className="add-button">+ 수강권 배정</button>
            </div>

            <div className="user-info-grid">
                <div><strong>성별:</strong> {genderLabel(user.gender)}</div>
                <div><strong>전화번호:</strong> {user.phone ?? '-'}</div>
                <div><strong>활성 여부:</strong> {user.is_active ? '✅' : '❌'}</div>
                <div><strong>가입일:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
            </div>

            <div className="ticket-section">
                <h3>현재 수강권</h3>
                {activeTickets.length === 0 ? (
                    <p>사용 중인 수강권이 없습니다.</p>
                ) : (
                    <div className="ticket-grid">
                        {activeTickets.map((t, i) => (
                            <UserTicketCard key={i} ticket={t} />
                        ))}
                    </div>
                )}
            </div>

            <div className="ticket-section">
                <h3>지난 수강권</h3>
                {expiredTickets.length === 0 ? (
                    <p>지난 수강권 내역이 없습니다.</p>
                ) : (
                    <div className="ticket-grid">
                        {expiredTickets.map((t, i) => (
                            <UserTicketCard key={i} ticket={t} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailPage;

const roleLabel = (r: string) =>
    r === 'student' ? '수강생' : r === 'coach' ? '코치' : r === 'facility_admin' ? '시설 관리자' : '총 관리자';

const genderLabel = (g: string | null) =>
    g === 'male' ? '남' : g === 'female' ? '여' : '-';
