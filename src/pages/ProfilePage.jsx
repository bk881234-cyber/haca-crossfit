import { useState } from 'react';
import { User, Save, ArrowLeft, Check, Phone, Calendar, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import './ProfilePage.css';

export default function ProfilePage({ setCurrentPage }) {
  const { user, profile, displayName, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('이미지 파일만 업로드 가능합니다.'); return; }
    if (file.size > 3 * 1024 * 1024) { setError('3MB 이하 이미지만 업로드 가능합니다.'); return; }

    setUploading(true);
    setError('');

    const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) { setError('업로드 실패: ' + upErr.message); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: profileErr } = await updateProfile({ avatar_url: avatarUrl });
    if (profileErr) setError('프로필 저장 실패: ' + profileErr.message);

    setUploading(false);
    e.target.value = '';
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
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="profile-avatar-img" alt="프로필" />
          ) : (
            <span>{initials}</span>
          )}
          <label className="profile-avatar-overlay" title="사진 변경">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            {uploading
              ? <Loader2 size={16} className="profile-avatar-spin" />
              : <Camera size={16} />}
          </label>
        </div>
        <div className="profile-display-name">{displayName}</div>
        <div className="profile-role-badge">{profile?.role === 'admin' ? '관리자' : '회원'}</div>
      </div>

      {error && <p className="profile-error" style={{ marginBottom: '1rem' }}>{error}</p>}

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
