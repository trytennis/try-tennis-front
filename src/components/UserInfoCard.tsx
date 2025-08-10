import { formatDate } from '../utils/format';
import type { EditableUserFields, User } from '../types/User';
import "../styles/UserInfo.css"

interface Props {
  user: User;
  editing: boolean;
  form: EditableUserFields;
  setForm: React.Dispatch<React.SetStateAction<EditableUserFields>>;
}

const UserInfoCard = ({ user, editing, form, setForm }: Props) => {
    const genderLabel = (g: string | null) => g === 'female' ? '여' : g === 'male' ? '남' : '-';

    const handleInputChange = (field: keyof EditableUserFields, value: string) => {
        setForm(prev => ({ ...prev, [field]: value || null }));
    };

    if (editing) {
        return (
            <div className="info-grid">
                <div>
                    <label>이름</label>
                    <input 
                        type="text" 
                        value={form.name} 
                        onChange={(e) => handleInputChange('name', e.target.value)} 
                        placeholder="이름을 입력하세요"
                    />
                </div>
                <div>
                    <label>성별</label>
                    <select 
                        value={form.gender || ''} 
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                        <option value="">선택</option>
                        <option value="male">남</option>
                        <option value="female">여</option>
                    </select>
                </div>
                <div>
                    <label>연락처</label>
                    <input 
                        type="tel" 
                        value={form.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)} 
                        placeholder="연락처를 입력하세요"
                    />
                </div>
                <div>
                    <label>생년월일</label>
                    <input 
                        type="date" 
                        value={form.birthdate || ''} 
                        onChange={(e) => handleInputChange('birthdate', e.target.value)} 
                    />
                </div>
                <div>
                    <label>등록일</label>
                    <div className="readonly-field">{formatDate(user.created_at)}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="info-grid">
            <div className="large-name">
                <div className="label">이름</div>
                <div className="value">{user.name}</div>
            </div>
            <div className="large-gender">
                <div className="label">성별</div>
                <div className="value">{genderLabel(user.gender)}</div>
            </div>
            <div><label>연락처</label><div>{user.phone || '-'}</div></div>
            <div><label>생년월일</label><div>{user.birthdate ? formatDate(user.birthdate) : '-'}</div></div>
            <div><label>등록일</label><div>{formatDate(user.created_at)}</div></div>
        </div>
    );
};

export default UserInfoCard;