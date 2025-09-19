import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import '../styles/UserForm.css';

const UserCreatePage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        user_type: '',
        gender: '',
        phone: '',
        memo: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }
        if (!form.gender) {
            setError('성별을 선택해주세요.');
            return;
        }

        try {
            await post('/api/users', { ...form, is_active: true });
            setSuccess('회원이 성공적으로 등록되었습니다.');
            setTimeout(() => navigate('/users'), 1000);
        } catch (err) {
            setError('등록에 실패했습니다.');
        }
    };

    return (
        <div className="user-form-container">
            <form className="user-form" onSubmit={handleSubmit}>
                <h2>회원 등록</h2>

                <div className="user-form-group">
                    <label>이름 *</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        maxLength={10}
                    />
                </div>

                <div className="user-form-group">
                    <label>역할 *</label>
                    <select name="user_type" value={form.user_type} onChange={handleChange}>
                        <option value="student">수강생</option>
                        <option value="coach">코치</option>
                        <option value="facility_admin">시설 관리자</option>
                        <option value="super_admin">총 관리자</option>
                    </select>
                </div>

                <div className="user-form-group">
                    <label>성별 *</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required>
                        <option value="">선택</option>
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                        <option value="other">기타</option>
                    </select>
                </div>

                <div className="user-form-group">
                    <label>전화번호</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                </div>

                <div className="user-form-group">
                    <label>메모</label>
                    <textarea name="memo" value={form.memo} onChange={handleChange} rows={3} />
                </div>

                {error && <p className="user-form-error">{error}</p>}
                {success && <p className="user-form-success">{success}</p>}

                <button type="submit" className="submit-button">등록</button>
            </form>
        </div>
    );
};

export default UserCreatePage;
