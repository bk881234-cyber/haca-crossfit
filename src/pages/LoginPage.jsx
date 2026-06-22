import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        if (!name.trim()) { setError('이름을 입력해주세요.'); setLoading(false); return; }
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setMessage('가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요!');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      else if (msg.includes('Email not confirmed')) setError('이메일 인증을 완료해주세요.');
      else if (msg.includes('User already registered')) setError('이미 가입된 이메일입니다.');
      else setError(msg || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true" />

      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="HACA Training Club" className="login-logo" />
          <h1 className="login-brand">HACA TRAINING</h1>
          <p className="login-sub">CrossFit & HYROX</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setMessage(''); }}
          >
            로그인
          </button>
          <button
            className={`login-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <div className="login-field">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="홍길동"
                required
              />
            </div>
          )}
          <div className="login-field">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="login-field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '6자 이상 입력' : '비밀번호 입력'}
              minLength={6}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}
          {message && <p className="login-message">{message}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <p className="login-footer-note">
          © {new Date().getFullYear()} HACA TRAINING. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
