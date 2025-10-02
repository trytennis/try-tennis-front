import { useEffect, useState } from 'react';
import type { User } from '../types/User';
import UserListTable from '../components/UserListTable';
import '../styles/UsersPage.css';
import { useNavigate } from 'react-router-dom';
import { authGet } from '../utils/authApi';

const UsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);

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
        <div className="page-container">
            <div className="user-header">
                <h2>회원 관리</h2>
                {/* <button className="add-button" onClick={() => navigate('/users/new')}>
                    관리자용 회원 수동 등록
                </button> */}
            </div>
            <UserListTable users={users} />
        </div>
    );
};

export default UsersPage;
