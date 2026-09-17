import { useEffect, useState } from 'react';
import type { User } from '../types/User';
import UserListTable from '../components/UserListTable';
import '../styles/UsersPage.css';
import { useNavigate } from 'react-router-dom';
import { authGet } from '../utils/authApi';

const UsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await authGet<User[]>('/api/facilities/members-dashboard');
                setUsers(data);
            } catch (err) {
                console.error('회원 목록 불러오기 실패', err);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="users-page-main">
            <div className="user-header">
                {/* <h2>회원 관리</h2> */}
                {/* <button className="add-button" onClick={() => navigate('/users/new')}>
                    관리자용 회원 수동 등록
                </button> */}
            </div>
            <div className="users-filters">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름·전화번호 검색" />
                {['all', 'coach', 'student'].map((value) => (
                    <button key={value} type="button" className={role === value ? 'active' : ''} onClick={() => setRole(value)}>
                        {value === 'all' ? '전체' : value === 'coach' ? '코치' : '회원'}
                    </button>
                ))}
            </div>
            <UserListTable users={users.filter((u) => {
                const q = query.trim().toLowerCase();
                return (role === 'all' || u.user_type === role) && (!q || u.name.toLowerCase().includes(q) || (u.phone || '').includes(q));
            })} />
        </div>
    );
};

export default UsersPage;
