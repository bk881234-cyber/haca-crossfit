import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const formatPhone = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => setPhone(formatPhone(e.target.value));

  const reset = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reset();

    const digits = phone.replace(/\D/g, '');

    if (mode === 'signup') {
      if (!name.trim()) return setError('이름을 입력해주세요.');
      if (!nickname.trim()) return setError('닉네임을 입력해주세요.');
      if (digits.length < 10) return setError('올바른 전화번호를 입력해주세요.');
      if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.');
      if (password !== confirm) return setError('비밀번호가 일치하지 않습니다.');
      if (!birthdate) return setError('생년월일을 입력해주세요.');
      if (!gender) return setError('성별을 선택해주세요.');
    } else {
      if (digits.length < 10) return setError('올바른 전화번호를 입력해주세요.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(phone, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signUp(phone, password, { name, nickname, birthdate, gender });
        if (error) throw error;
        setSuccess('가입이 완료되었습니다! 로그인해주세요.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) setError('전화번호 또는 비밀번호가 올바르지 않습니다.');
      else if (msg.includes('User already registered')) setError('이미 가입된 전화번호입니다.');
      else setError(msg || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="HACA Training Club" className="login-logo" />
          <h1 className="login-brand">HACA TRAINING</h1>
          <p className="login-sub">CrossFit & HYROX</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); reset(); }}>
            로그인
          </button>
          <button className={`login-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); reset(); }}>
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {mode === 'signup' && (
            <>
              <div className="login-row">
                <div className="login-field">
                  <label>이름 *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" />
                </div>
                <div className="login-field">
                  <label>닉네임 *</label>
                  <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="길동이" />
                </div>
              </div>

              <div className="login-row">
                <div className="login-field">
                  <label>생년월일 *</label>
                  <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="login-field">
                  <label>성별 *</label>
                  <div className="gender-toggle">
                    <button type="button" className={gender === 'male' ? 'active' : ''} onClick={() => setGender('male')}>남성</button>
                    <button type="button" className={gender === 'female' ? 'active' : ''} onClick={() => setGender('female')}>여성</button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="login-field">
            <label>전화번호 *</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              inputMode="numeric"
            />
          </div>

          <div className="login-field">
            <label>비밀번호 *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '6자 이상 입력' : '비밀번호 입력'}
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div className="login-field">
              <label>비밀번호 확인 *</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
              />
            </div>
          )}

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-message">{success}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="login-footer-note" style={{ marginTop: '0.75rem' }}>
            비밀번호를 잊으셨나요? <strong>관리자에게 문의</strong>하시면 재설정해 드립니다.
          </p>
        )}
        <p className="login-footer-note">
          © {new Date().getFullYear()} HACA TRAINING. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
