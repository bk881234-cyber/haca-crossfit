import React, { useState, useEffect } from 'react';
import { Calendar, User, Trophy, Activity, Medal, Plus, X, Bell } from 'lucide-react';
import WodCard from '../components/WodCard';
import { useAuth } from '../contexts/AuthContext';
import './UserHome.css';

const UserHome = ({ wods, classes, myReservations, members, setCurrentPage, leaderboard, addLeaderboardRecord, notices, monthlyAttendance }) => {
  const [popupNotice, setPopupNotice] = useState(null);

  useEffect(() => {
    // 활성화 & 팝업인 공지사항 찾기
    const activePopup = notices?.find(n => n.isActive && n.isPopup);
    if (activePopup) {
      // 오늘 하루 보지 않기 등 체크
      const hideDate = localStorage.getItem(`haca_hide_popup_${activePopup.id}`);
      const today = new Date().toISOString().split('T')[0];
      if (hideDate !== today) {
        setPopupNotice(activePopup);
      }
    }
  }, [notices]);

  const handleClosePopup = (id, hideToday = false) => {
    if (hideToday) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`haca_hide_popup_${id}`, today);
    }
    setPopupNotice(null);
  };

  const [wodTab, setWodTab] = useState('today');

  const { displayName, profile } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const todayWod = wods.find(w => w.date === todayStr) || wods[0];
  const tomorrowWod = wods.find(w => w.date === tomorrowStr);

  const normalizePhone = (p) => p?.replace(/\D/g, '') || '';
  const me = members.find(m => normalizePhone(m.phone) === normalizePhone(profile?.phone))
          || members.find(m => m.name === profile?.name)
          || {};
  const myBookedClasses = classes.filter(cls => myReservations.some(r => r.classId === cls.id && r.date === todayStr));

  const myBookedClasses = classes.filter(cls => myReservations.some(r => r.classId === cls.id && r.date === todayStr));

  return (
    <div className="user-home">
      {/* 팝업 공지사항 모달 */}
      {popupNotice && (
        <div className="notice-popup-overlay">
          <div className="notice-popup">
            <div className="notice-popup-header">
              <div className="notice-icon"><Bell size={20} className="text-lime" /></div>
              <h2>공지사항</h2>
            </div>
            <div className="notice-popup-body">
              <h3>{popupNotice.title}</h3>
              <p>{popupNotice.content}</p>
            </div>
            <div className="notice-popup-footer">
              <button className="btn-hide-today" onClick={() => handleClosePopup(popupNotice.id, true)}>오늘 하루 보지 않기</button>
              <button className="btn-close-notice" onClick={() => handleClosePopup(popupNotice.id, false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <header className="home-header">
        <div className="user-greeting">
          <img src="/logo.png" alt="HACA" className="greeting-logo" />
          <div className="greeting-text">
            <h1>Hello, {displayName}님! <span className="wave">👋</span></h1>
            <p>오늘도 화이팅하세요!</p>
          </div>
        </div>
      </header>

      {/* 나의 활동 요약 (이용 가능 횟수 추가) */}
      <section className="stats-section">
        <div className="stat-cards-row">
          <div className="stat-card">
            <div className="stat-icon"><Activity size={20} className="text-lime" /></div>
            <div className="stat-info">
              <span className="stat-label">이번 달 출석</span>
              <span className="stat-value">{monthlyAttendance}회</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><Trophy size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">회원권 만료일</span>
              <span className="stat-value" style={{
                fontSize: '0.95rem',
                color: (() => {
                  if (!me?.membershipExpiry) return 'var(--text-secondary)';
                  const days = Math.ceil((new Date(me.membershipExpiry) - new Date()) / 86400000);
                  return days < 0 ? '#ff3366' : days <= 14 ? '#ff6b6b' : 'var(--text-primary)';
                })()
              }}>
                {me?.membershipExpiry
                  ? (() => {
                      const days = Math.ceil((new Date(me.membershipExpiry) - new Date()) / 86400000);
                      if (days < 0) return '만료됨';
                      if (days <= 14) return `${me.membershipExpiry} (D-${days})`;
                      return me.membershipExpiry;
                    })()
                  : '미등록'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 예약 현황 퀵뷰 */}
      <section className="booking-quickview">
        <div className="section-header">
          <h2>오늘의 예약</h2>
          <button className="view-all-btn" onClick={() => setCurrentPage('reservation')}>전체보기</button>
        </div>
        {myBookedClasses.length > 0 ? (
          myBookedClasses.map(cls => (
            <div key={cls.id} className="quick-booking-card">
              <div className="booking-time-chip">{cls.time}</div>
              <div className="class-info">
                <h3>크로스핏 클래스</h3>
                <p>with {cls.coach}</p>
              </div>
              <div className="status-badge confirmed">예약완료</div>
            </div>
          ))
        ) : (
          <div className="empty-booking-card">
            <p>오늘 예약된 클래스가 없습니다.</p>
            <button className="go-reservation-btn" onClick={() => setCurrentPage('reservation')}>
              <Calendar size={18} /> 예약하러 가기
            </button>
          </div>
        )}
      </section>

      {/* 오늘/내일 와드 */}
      <section className="wod-section">
        <div className="section-header">
          <h2>WOD</h2>
        </div>
        <div className="wod-tabs">
          <button
            className={`wod-tab-btn ${wodTab === 'today' ? 'active' : ''}`}
            onClick={() => setWodTab('today')}
          >
            오늘
          </button>
          <button
            className={`wod-tab-btn ${wodTab === 'tomorrow' ? 'active' : ''}`}
            onClick={() => setWodTab('tomorrow')}
          >
            내일
          </button>
        </div>
        {wodTab === 'today' ? (
          todayWod
            ? <WodCard wod={todayWod} />
            : <div className="empty-state">오늘 등록된 WOD가 없습니다.</div>
        ) : (
          tomorrowWod
            ? <WodCard wod={tomorrowWod} />
            : <div className="empty-state">내일 WOD가 아직 등록되지 않았습니다.</div>
        )}
      </section>

      {/* 실시간 리더보드 안내 */}
      <section className="leaderboard-section">
        <div className="section-header">
          <h2>오늘의 리더보드</h2>
        </div>
        <div className="empty-state" style={{marginTop: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
          <Trophy size={40} className="text-lime" />
          <p style={{margin: 0, fontWeight: 700}}>새로워진 기록 페이지에서 오늘의 성적을 확인하세요!</p>
          <button className="add-record-btn" onClick={() => setCurrentPage('record')} style={{width: 'auto', padding: '0.75rem 1.5rem', marginTop: '0.5rem'}}>
            기록 보기 및 입력
          </button>
        </div>
      </section>

    </div>
  );
};

export default UserHome;
