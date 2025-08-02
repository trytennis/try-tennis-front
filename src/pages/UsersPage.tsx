import { useEffect, useState } from 'react';
import { get } from '../utils/api';
import type { User } from '../types/User';
import UserListTable from '../components/UserListTable';
import '../styles/UsersPage.css';

const UsersPage: React.FC = () => {
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
        <button className="add-button">회원 추가</button>
      </div>
      <UserListTable users={users} />
    </div>
  );
};

export default UsersPage;
