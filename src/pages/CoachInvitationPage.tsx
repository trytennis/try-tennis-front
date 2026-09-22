import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authPost } from '../utils/authApi';

export default function CoachInvitationPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await authPost<{ token: string }>('/api/coach-invitations', { name, email });
      setLink(`${window.location.origin}/signup?coach_invite=${encodeURIComponent(result.token)}`);
    } catch (err) { setError(err instanceof Error ? err.message : '초대 링크를 만들지 못했습니다.'); }
    finally { setBusy(false); }
  }
  return <main className="user-form-container"><form className="user-form" onSubmit={submit}>
    <h2>코치 초대</h2><p>초대 링크는 3일 후 만료되며 한 번만 사용할 수 있습니다.</p>
    <div className="user-form-group"><label>코치 이름 *</label><input required value={name} onChange={e => setName(e.target.value)} /></div>
    <div className="user-form-group"><label>코치 이메일 *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
    {error && <p className="user-form-error">{error}</p>}
    {link && <div className="user-form-group"><label>초대 링크</label><input readOnly value={link} onFocus={e => e.currentTarget.select()} /><button type="button" className="submit-button" onClick={() => navigator.clipboard?.writeText(link)}>링크 복사</button></div>}
    {!link && <button className="submit-button" disabled={busy}>{busy ? '생성 중...' : '초대 링크 생성'}</button>}
    <button type="button" className="cancel-button" onClick={() => navigate('/users')}>회원관리로 돌아가기</button>
  </form></main>;
}
