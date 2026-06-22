import { useState } from 'react';
import { Users, Calendar, TrendingUp, Plus, Search, Activity, FileText, Bell, Trash2, MessageSquare } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = ({
  addWod,
  classes, addClassSlot, deleteClassSlot,
  members, setMemberExpiry, setMemberExpiryDate, toggleMemberStatus,
  feed, deleteFeedPost,
  notices, addNotice, toggleNoticeActive, deleteNotice,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const [newWod, setNewWod] = useState({
    date: new Date().toISOString().split('T')[0], title: '', type: 'For Time',
    timeLimit: '', rxd: '', scaled: '', description: '',
  });
  const [newNotice, setNewNotice] = useState({ title: '', content: '', isPopup: false });
  const [newClass, setNewClass] = useState({ time: '07:00', coach: 'David Coach', maxCapacity: 15 });

  const handleWodSubmit = (e) => {
    e.preventDefault();
    addWod(newWod);
    alert('WOD가 등록되었습니다.');
    setNewWod({ ...newWod, title: '', rxd: '', scaled: '', description: '' });
  };

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    addNotice({ title: newNotice.title, content: newNotice.content, isPopup: newNotice.isPopup });
    alert('공지사항이 등록되었습니다.');
    setNewNotice({ title: '', content: '', isPopup: false });
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    addClassSlot({ time: newClass.time, coach: newClass.coach, maxCapacity: Number(newClass.maxCapacity) });
    alert('클래스 스케줄이 등록되었습니다.');
  };

  const renderOverview = () => (
    <div className="admin-panel">
      <div className="stat-cards-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper users"><Users /></div>
          <div className="stat-info">
            <span className="stat-label">총 회원수</span>
            <span className="stat-value">{members.length}명</span>
            <span className="stat-sub">활성: {members.filter(m => m.status === 'Active').length}명</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper calendar"><Calendar /></div>
          <div className="stat-info">
            <span className="stat-label">오늘 예약 현황</span>
            <span className="stat-value">{classes.reduce((sum, cls) => sum + cls.attendees.length, 0)}명</span>
            <span className="stat-sub">총 {classes.length}개 클래스 운영</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper activity"><Activity /></div>
          <div className="stat-info">
            <span className="stat-label">커뮤니티 새 글</span>
            <span className="stat-value">{feed.length}개</span>
            <span className="stat-sub">최근 게시물 기준</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWodManager = () => (
    <div className="admin-panel">
      <div className="panel-header"><h2>WOD 등록</h2></div>
      <form className="admin-form" onSubmit={handleWodSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>날짜</label>
            <input type="date" value={newWod.date} onChange={e => setNewWod({ ...newWod, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>와드 이름</label>
            <input type="text" value={newWod.title} onChange={e => setNewWod({ ...newWod, title: e.target.value })} placeholder="예: DT, Cindy" required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>타입</label>
            <select value={newWod.type} onChange={e => setNewWod({ ...newWod, type: e.target.value })}>
              <option value="For Time">For Time</option>
              <option value="AMRAP">AMRAP</option>
              <option value="EMOM">EMOM</option>
              <option value="Tabata">Tabata</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Cap (제한시간)</label>
            <input type="text" value={newWod.timeLimit} onChange={e => setNewWod({ ...newWod, timeLimit: e.target.value })} placeholder="예: 20 Min" required />
          </div>
        </div>
        <div className="form-group">
          <label>간단 설명</label>
          <input type="text" value={newWod.description} onChange={e => setNewWod({ ...newWod, description: e.target.value })} placeholder="와드에 대한 간략한 설명" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rx'd 내용</label>
            <textarea value={newWod.rxd} onChange={e => setNewWod({ ...newWod, rxd: e.target.value })} placeholder="Rx'd 기준 운동 내용" rows={4} required />
          </div>
          <div className="form-group">
            <label>Scaled 내용</label>
            <textarea value={newWod.scaled} onChange={e => setNewWod({ ...newWod, scaled: e.target.value })} placeholder="Scaled 기준 운동 내용" rows={4} required />
          </div>
        </div>
        <button type="submit" className="admin-submit-btn"><Plus size={18} /> 새 WOD 등록</button>
      </form>
    </div>
  );

  const renderClassManager = () => (
    <div className="admin-panel">
      <div className="panel-header"><h2>클래스 스케줄 등록</h2></div>
      <form className="admin-form mb-4" onSubmit={handleClassSubmit}>
        <div className="form-row align-end">
          <div className="form-group">
            <label>시간 (HH:MM)</label>
            <input type="time" value={newClass.time} onChange={e => setNewClass({ ...newClass, time: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>담당 코치</label>
            <input type="text" value={newClass.coach} onChange={e => setNewClass({ ...newClass, coach: e.target.value })} placeholder="코치 이름 입력" required />
          </div>
          <div className="form-group">
            <label>최대 정원</label>
            <input type="number" min="1" max="50" value={newClass.maxCapacity} onChange={e => setNewClass({ ...newClass, maxCapacity: e.target.value })} required />
          </div>
          <button type="submit" className="admin-submit-btn inline"><Plus size={18} /> 추가</button>
        </div>
      </form>

      <div className="panel-header mt-4"><h2>현재 등록된 스케줄 (오늘)</h2></div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>시간</th><th>코치</th><th>정원/예약</th><th>관리</th></tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id}>
                <td className="highlight-text">{cls.time}</td>
                <td>{cls.coach}</td>
                <td>{cls.attendees.length} / {cls.maxCapacity}</td>
                <td>
                  <button className="action-btn text-red" onClick={() => deleteClassSlot(cls.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMemberManager = () => (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>회원 및 수강권 관리</h2>
        <div className="search-bar"><Search size={18} /><input type="text" placeholder="이름 검색..." /></div>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>이름</th><th>연락처</th><th>누적 출석</th><th>회원권 만료일</th><th>상태</th></tr>
          </thead>
          <tbody>
            {members.map(m => {
              const expiry = m.membershipExpiry ? new Date(m.membershipExpiry) : null;
              const today = new Date();
              today.setHours(0,0,0,0);
              const daysLeft = expiry ? Math.ceil((expiry - today) / 86400000) : null;
              const isExpired = daysLeft !== null && daysLeft < 0;
              const isSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;
              return (
              <tr key={m.id}>
                <td className="font-bold">{m.name}</td>
                <td>{m.phone}</td>
                <td>{m.attendanceCount}회</td>
                <td>
                  <div className="expiry-cell">
                    <span className={`expiry-date ${isExpired ? 'expired' : isSoon ? 'soon' : ''}`}>
                      {expiry ? (isExpired ? '만료됨' : m.membershipExpiry) : '미등록'}
                      {isSoon && ` (D-${daysLeft})`}
                    </span>
                    <div className="expiry-btns">
                      {[1,3,6,12].map(mo => (
                        <button key={mo} className="expiry-btn" onClick={() => setMemberExpiry(m.id, mo)}>
                          +{mo < 12 ? `${mo}개월` : '1년'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="date"
                      className="expiry-date-input"
                      value={m.membershipExpiry || ''}
                      onChange={e => setMemberExpiryDate(m.id, e.target.value)}
                    />
                  </div>
                </td>
                <td>
                  <button className={`status-toggle ${m.status.toLowerCase()}`} onClick={() => toggleMemberStatus(m.id)}>
                    {m.status}
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommunityManager = () => (
    <div className="admin-panel">
      <div className="panel-header"><h2>새 공지사항 작성</h2></div>
      <form className="admin-form mb-4" onSubmit={handleNoticeSubmit}>
        <div className="form-group">
          <label>제목</label>
          <input type="text" value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="공지 제목" required />
        </div>
        <div className="form-group">
          <label>내용</label>
          <textarea value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} placeholder="공지 내용 입력" rows={3} required />
        </div>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={newNotice.isPopup} onChange={e => setNewNotice({ ...newNotice, isPopup: e.target.checked })} />
            <span>메인 페이지 접속 시 팝업으로 띄우기 (최신 활성 공지 1건만 노출)</span>
          </label>
        </div>
        <button type="submit" className="admin-submit-btn"><Bell size={18} /> 공지 등록</button>
      </form>

      <div className="panel-header mt-4"><h2>등록된 공지사항</h2></div>
      <div className="data-table-wrap mb-4">
        <table className="data-table">
          <thead>
            <tr><th>작성일</th><th>제목</th><th>팝업</th><th>상태</th><th>관리</th></tr>
          </thead>
          <tbody>
            {notices.map(n => (
              <tr key={n.id}>
                <td>{n.timestamp}</td>
                <td>{n.title}</td>
                <td>{n.isPopup ? '설정됨' : '-'}</td>
                <td>
                  <button className={`status-toggle ${n.isActive ? 'active' : 'inactive'}`} onClick={() => toggleNoticeActive(n.id)}>
                    {n.isActive ? '노출중' : '숨김'}
                  </button>
                </td>
                <td><button className="action-btn text-red" onClick={() => deleteNotice(n.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-header mt-4"><h2>회원 커뮤니티 피드 관리</h2></div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>작성자</th><th>내용 (미리보기)</th><th>작성시간</th><th>강제 삭제</th></tr>
          </thead>
          <tbody>
            {feed.map(f => (
              <tr key={f.id}>
                <td className="font-bold">{f.author}</td>
                <td className="text-ellipsis">{f.content.substring(0, 30)}...</td>
                <td>{f.timestamp}</td>
                <td><button className="action-btn text-red" onClick={() => deleteFeedPost(f.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>HACA 크로스핏 운영 관리 시스템</p>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><TrendingUp size={18} /> 요약</button>
        <button className={`admin-tab ${activeTab === 'wods' ? 'active' : ''}`} onClick={() => setActiveTab('wods')}><FileText size={18} /> WOD 관리</button>
        <button className={`admin-tab ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}><Calendar size={18} /> 클래스 스케줄</button>
        <button className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}><Users size={18} /> 회원 관리</button>
        <button className={`admin-tab ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}><MessageSquare size={18} /> 공지/커뮤니티</button>
      </div>

      <div className="admin-content-area">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'wods' && renderWodManager()}
        {activeTab === 'classes' && renderClassManager()}
        {activeTab === 'members' && renderMemberManager()}
        {activeTab === 'community' && renderCommunityManager()}
      </div>
    </div>
  );
};

export default AdminDashboard;
