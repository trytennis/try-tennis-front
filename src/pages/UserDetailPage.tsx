import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get } from '../utils/api';
import type { User } from '../types/User';
import type { UserTicket } from '../types/UserTicket';
import '../styles/UserDetailPage.css';
import UserTicketCard from '../components/UserTicketCard';
import { formatDate, formatPrice } from '../utils/format';

const UserDetailPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<UserTicket[]>([]);

    const navigate = useNavigate();

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
        <main className="user-detail-main">
            <div className="user-detail-header">
                <div className="header-left">
                    <button className="back-button" onClick={() => navigate('/users')}>← 뒤로</button>
                    <h2>회원 상세</h2>
                </div>
                <div className="header-right">
                    <button className="edit-button">수정</button>
                </div>
            </div>

            <section className="card-section">
                <h3>기본 정보</h3>
                <div className="info-grid">
                    <div><label>이름</label><div>{user.name}</div></div>
                    <div><label>연락처</label><div>{user.phone || '-'}</div></div>
                    <div><label>등록일</label><div>{formatDate(user.created_at)}</div></div>
                    <div>
                        <label>회원 상태</label>
                        <div><input type="checkbox" checked={user.is_active} disabled /> 활성화</div>
                    </div>
                </div>
            </section>

            <section className="card-section">
                <div className="section-header">
                    <h3>현재 수강권</h3>
                    {/* <button className="assign-button">수강권 배정</button> */}
                </div>
                <div className='ticket-list-row'>
                    {/* 배정 카드 */}
                    <button className="assign-card-button" onClick={() => console.log('수강권 배정')}>
                        <span className="plus-icon">＋</span>
                    </button>
                    <div className="ticket-list-grid">
                        {activeTickets.map((ticket, i) => (
                            <div key={i} className="current-ticket-card">
                                <div className="ticket-header">
                                    <h4>{ticket.tickets.name}</h4>
                                    <span className="price">{formatPrice(ticket.tickets.price)}</span>
                                </div>
                                <div className="ticket-grid">
                                    <div><span>총 횟수</span><div>{ticket.tickets.lesson_count}회</div></div>
                                    <div><span>잔여 횟수</span><div>{ticket.remaining_count}회</div></div>
                                    <div><span>시작일</span><div>{formatDate(ticket.assigned_at)}</div></div>
                                    <div><span>만료일</span><div>{formatDate(ticket.expires_at)}</div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="card-section">
                <h3>지난 수강권</h3>
                <div className="ticket-list-grid">
                    {expiredTickets.map((ticket, i) => (
                        <div key={i} className="past-ticket-card">
                            <div className="ticket-header">
                                <h4>{ticket.tickets.name}</h4>
                                <span className="badge">완료</span>
                            </div>
                            <div className="ticket-info">
                                <div><span>횟수</span><span>{ticket.tickets.lesson_count}회</span></div>
                                <div><span>기간</span><span>{formatDate(ticket.assigned_at)} ~ {formatDate(ticket.expires_at)}</span></div>
                                <div><span>금액</span><span>{formatPrice(ticket.tickets.price)}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default UserDetailPage;

const roleLabel = (r: string) =>
    r === 'student' ? '수강생' : r === 'coach' ? '코치' : r === 'facility_admin' ? '시설 관리자' : '총 관리자';

const genderLabel = (g: string | null) =>
    g === 'male' ? '남' : g === 'female' ? '여' : '-';
