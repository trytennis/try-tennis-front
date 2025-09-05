import { useEffect, useState } from 'react';
import { get } from '../utils/api';
import type { User } from '../types/User';
import UserListTable from '../components/UserListTable';
import '../styles/UsersPage.css';
import { useNavigate } from 'react-router-dom';

const UsersPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await get<User[]>('/api/users');
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
                <button className="add-button" onClick={() => navigate('/users/new')}>
                    관리자용 회원 수동 등록
                </button>
            </div>
            <UserListTable users={users} />
        </div>
    );
};

export default UsersPage;
