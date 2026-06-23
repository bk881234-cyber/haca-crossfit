import { useState } from 'react';
import { User, Save, ArrowLeft, Check, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

export default function ProfilePage({ setCurrentPage }) {
  const { profile, displayName, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!nickname.trim()) { setError('닉네임을 입력해주세요.'); return; }
    setSaving(true);
    setError('');
    const { error } = await updateProfile({ nickname: nickname.trim() });
    setSaving(false);
    if (error) { setError('저장 실패: ' + error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initials = (profile?.name || displayName || '?').slice(0, 2);

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => setCurrentPage('wod')}>
          <ArrowLeft size={20} />
          <span>홈으로</span>
        </button>
        <h1 className="profile-title">내 정보</h1>
      </div>

      <div className="profile-avatar-section">
        <div className="profile-avatar-circle">
          <span>{initials}</span>
        </div>
        <div className="profile-display-name">{displayName}</div>
        <div className="profile-role-badge">{profile?.role === 'admin' ? '관리자' : '회원'}</div>
      </div>

      <div className="profile-card glass-card">
        <h2 className="profile-section-title">기본 정보</h2>

        <div className="profile-info-row">
          <Phone size={16} className="profile-info-icon" />
          <div>
            <div className="profile-info-label">전화번호</div>
            <div className="profile-info-value">{profile?.phone ? profile.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '-'}</div>
          </div>
        </div>

        <div className="profile-info-row">
          <User size={16} className="profile-info-icon" />
          <div>
            <div className="profile-info-label">실명</div>
            <div className="profile-info-value">{profile?.name || '-'}</div>
          </div>
        </div>

        {profile?.birthdate && (
          <div className="profile-info-row">
            <Calendar size={16} className="profile-info-icon" />
            <div>
              <div className="profile-info-label">생년월일</div>
              <div className="profile-info-value">{profile.birthdate}</div>
            </div>
          </div>
        )}
      </div>

      <div className="profile-card glass-card">
        <h2 className="profile-section-title">닉네임 변경</h2>
        <p className="profile-section-desc">앱에 표시되는 이름입니다. 리더보드, 예약자 명단 등에서 사용됩니다.</p>

        <div className="profile-field">
          <label>닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setSaved(false); setError(''); }}
            placeholder="표시될 닉네임 입력"
            maxLength={20}
          />
        </div>

        {error && <p className="profile-error">{error}</p>}

        <button
          className={`profile-save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved
            ? <><Check size={18} /> 저장 완료!</>
            : saving
            ? '저장 중...'
            : <><Save size={18} /> 닉네임 저장</>}
        </button>
      </div>

      <p className="profile-footer-note">이름·전화번호 변경이 필요하면 관리자에게 문의하세요.</p>
    </div>
  );
}
