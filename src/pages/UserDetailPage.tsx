import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, put } from '../utils/api';
import type { User, EditableUserFields } from '../types/User';
import type { UserTicket } from '../types/UserTicket';
import '../styles/UserDetailPage.css';
import AssignTicketModal from '../components/AssignTicketModal';
import { formatDate, formatPrice } from '../utils/format';
import UserInfoCard from '../components/UserInfoCard';

const UserDetailPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<UserTicket[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<EditableUserFields>({
        name: '',
        gender: null,
        phone: '',
        birthdate: null
    });
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        if (!userId) return;
        try {
            const user = await get<User>(`/api/users/${userId}`);
            const userTickets = await get<UserTicket[]>(`/api/users/${userId}/tickets`);
            setUser(user);
            setTickets(userTickets);
            // 사용자 정보를 form에도 설정
            setForm({
                name: user.name,
                gender: user.gender,
                phone: user.phone || '',
                birthdate: user.birthdate
            });
        } catch (err) {
            console.error('회원 정보 조회 실패', err);
        }
    };

    const handleSave = async () => {
        if (!userId || !user) return;
        
        setSaving(true);
        try {
            const updatedUser = await put<User>(`/api/users/${userId}`, form);
            setUser(updatedUser);
            setEditing(false);
            console.log('회원 정보 수정 성공');
        } catch (err) {
            console.error('회원 정보 수정 실패', err);
            alert('수정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!user) return;
        // 원래 값으로 복원
        setForm({
            name: user.name,
            gender: user.gender,
            phone: user.phone || '',
            birthdate: user.birthdate
        });
        setEditing(false);
    };

    useEffect(() => {
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
                    {editing ? (
                        <>
                            <button 
                                className="save-button" 
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? '저장 중...' : '저장'}
                            </button>
                            <button className="cancel-button" onClick={handleCancel}>취소</button>
                        </>
                    ) : (
                        <button className="edit-button" onClick={() => setEditing(true)}>수정</button>
                    )}
                </div>
            </div>

            <section className="card-section">
                <UserInfoCard 
                    user={user}
                    editing={editing}
                    form={form}
                    setForm={setForm}
                />
            </section>

            <section className="card-section">
                <div className="section-header">
                    <h3>현재 수강권</h3>
                </div>
                <div className='ticket-list-row'>
                    {/* 배정 카드 */}
                    <button className="assign-card-button" onClick={() => setShowModal(true)}>
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

            {showModal && (
                <AssignTicketModal
                    userId={user.id}
                    onClose={() => setShowModal(false)}
                    onAssigned={fetchData}
                />
            )}
        </main>
    );
};

export default UserDetailPage;