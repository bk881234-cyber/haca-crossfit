import React, { useState, useEffect } from 'react';
import { Calendar, User, Trophy, Activity, Medal, Plus, X, Bell } from 'lucide-react';
import WodCard from '../components/WodCard';
import './UserHome.css';

const UserHome = ({ wods, classes, myReservations, members, setCurrentPage, leaderboard, addLeaderboardRecord, notices }) => {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordType, setRecordType] = useState('rxd');
  const [recordTime, setRecordTime] = useState('');
  
  // 팝업 공지 상태
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

  const todayWod = wods[0];
  const me = members.find(m => m.name === '홍길동') || members[0];

  const myBookedClasses = classes.filter(cls => myReservations.includes(cls.id));

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    if (!recordTime.trim()) return;
    addLeaderboardRecord(recordType, recordTime);
    setRecordTime('');
    setShowRecordModal(false);
  };

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
          <h1>Hello, {me.name}님! <span className="wave">👋</span></h1>
          <p>오늘도 화이팅하세요!</p>
        </div>
      </header>

      {/* 나의 활동 요약 (이용 가능 횟수 추가) */}
      <section className="stats-section">
        <div className="stat-cards-row">
          <div className="stat-card">
            <div className="stat-icon"><Activity size={20} className="text-lime" /></div>
            <div className="stat-info">
              <span className="stat-label">이번 달 출석</span>
              <span className="stat-value">{me.attendanceCount}회</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><Trophy size={20} /></div>
            <div className="stat-info">
              <span className="stat-label">남은 수강 횟수</span>
              <span className="stat-value">{me.remainingSessions}회</span>
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

      {/* 오늘의 와드 */}
      <section className="wod-section">
        <div className="section-header">
          <h2>오늘의 WOD</h2>
        </div>
        {todayWod ? <WodCard wod={todayWod} /> : <div className="empty-state">등록된 WOD가 없습니다.</div>}
      </section>

      {/* 실시간 리더보드 */}
      <section className="leaderboard-section">
        <div className="section-header">
          <h2>실시간 리더보드</h2>
          <button className="add-record-btn" onClick={() => setShowRecordModal(true)}>
            <Plus size={16} /> 내 기록 입력
          </button>
        </div>
        <div className="leaderboard-list">
          {leaderboard.slice(0, 5).map((lb, idx) => (
            <div key={lb.id} className="leaderboard-item">
              <div className="rank">
                {idx === 0 ? <Medal size={20} className="gold" /> : 
                 idx === 1 ? <Medal size={20} className="silver" /> : 
                 idx === 2 ? <Medal size={20} className="bronze" /> : 
                 lb.rank}
              </div>
              <div className="user-info">
                <span className="name">{lb.name}</span>
                <span className={`type-badge ${lb.type}`}>{lb.type === 'rxd' ? "Rx'd" : "Scaled"}</span>
              </div>
              <div className="record">{lb.record}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 내 기록 입력 모달 */}
      {showRecordModal && (
        <div className="modal-overlay">
          <div className="modal-content record-modal">
            <button className="close-modal" onClick={() => setShowRecordModal(false)}><X size={24} /></button>
            <h2>내 기록 입력</h2>
            <form onSubmit={handleRecordSubmit} className="record-form">
              <div className="form-group">
                <label>타입 선택</label>
                <div className="type-toggle">
                  <button type="button" className={recordType === 'rxd' ? 'active' : ''} onClick={() => setRecordType('rxd')}>Rx'd</button>
                  <button type="button" className={recordType === 'scaled' ? 'active' : ''} onClick={() => setRecordType('scaled')}>Scaled</button>
                </div>
              </div>
              <div className="form-group">
                <label>기록 (예: 12:35 또는 5R 12Reps)</label>
                <input 
                  type="text" 
                  value={recordTime} 
                  onChange={(e) => setRecordTime(e.target.value)}
                  placeholder="자신의 기록을 입력하세요"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">기록 등록</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserHome;
