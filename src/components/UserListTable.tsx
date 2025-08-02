import '../styles/UserListTable.css';
import type { User } from '../types/User';

interface Props {
  users: User[];
}

const UserListTable = ({ users }: Props) => {
  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>역할</th>
          <th>성별</th>
          <th>전화번호</th>
          <th>활성</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className={!u.is_active ? 'inactive-row' : ''}>
            <td>{u.name}</td>
            <td>
              <span className={`badge ${u.user_type}`}>{roleLabel(u.user_type)}</span>
            </td>
            <td>{genderLabel(u.gender)}</td>
            <td>{u.phone ?? '-'}</td>
            <td>{u.is_active ? '✅' : '❌'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserListTable;

const roleLabel = (role: string) =>
  role === 'student' ? '수강생' :
  role === 'coach' ? '코치' :
  role === 'facility_admin' ? '시설 관리자' :
  '총 관리자';

const genderLabel = (g: string | null) =>
  g === 'male' ? '남' : g === 'female' ? '여' : '-';
