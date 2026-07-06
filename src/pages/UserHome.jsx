import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import WodCard from '../components/WodCard';
import { useAuth } from '../contexts/AuthContext';
import './UserHome.css';

const UserHome = ({ wods, notices }) => {
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

  const { displayName } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const todayWod = wods.find(w => w.date === todayStr) || wods[0];
  const tomorrowWod = wods.find(w => w.date === tomorrowStr);




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

    </div>
  );
};

export default UserHome;
