import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Shield, UserCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import UserHome from './pages/UserHome';
import ReservationPage from './pages/ReservationPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import LocationPage from './pages/LocationPage';
import SchedulePage from './pages/SchedulePage';
import ProfilePage from './pages/ProfilePage';
import RecordPage from './pages/RecordPage';
import './App.css';

const formatTimestamp = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

// ── Protected route ──
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--neon-lime)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main app shell (member + admin shared) ──
function AppShell() {
  const { user, displayName, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  const [currentPage, setCurrentPage] = useState('wod');
  const [loading, setLoading] = useState(true);

  const [wods, setWods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [notices, setNotices] = useState([]);
  const [myReservations, setMyReservations] = useState([]); // [{classId, date}]
  const [allReservations, setAllReservations] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState(0);

  const [workoutRecords, setWorkoutRecords] = useState([]);
  const [recordFeedback, setRecordFeedback] = useState([]);

  useEffect(() => { loadAllData(); }, [displayName]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: wodsData },
        { data: classesData },
        { data: reservationsData },
        { data: membersData },
        { data: leaderboardData },
        { data: feedData },
        { data: noticesData },
        { data: workoutRecordsData },
        { data: recordFeedbackData },
      ] = await Promise.all([
        supabase.from('wods').select('*').order('date', { ascending: false }),
        supabase.from('classes').select('*').order('time'),
        supabase.from('reservations').select('*'),
        supabase.from('members').select('*'),
        supabase.from('leaderboard').select('*').order('rank'),
        supabase.from('feed_posts').select('*, feed_comments(*), feed_likes(*)').order('created_at', { ascending: false }),
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
        supabase.from('workout_records').select('*').order('created_at', { ascending: false }),
        supabase.from('record_feedback').select('*').order('created_at', { ascending: true }),
      ]);

      setWods((wodsData || []).map(w => ({
        id: w.id, date: w.date, title: w.title, type: w.type,
        workout1Title: w.workout1_title, workout1Description: w.workout1_description,
        timeLimit: w.time_limit, rxd: w.rxd, scaled: w.scaled, description: w.description,
      })));

      const todayStr = new Date().toISOString().split('T')[0];
      setAllReservations(reservationsData || []);
      setClasses((classesData || []).map(c => ({
        id: c.id, time: c.time, coach: c.coach, maxCapacity: c.max_capacity,
        className: c.class_name || 'CrossFit',
        dayOfWeek: c.day_of_week,
        attendees: (reservationsData || [])
          .filter(r => r.class_id === c.id && (r.reservation_date === todayStr || !r.reservation_date))
          .map(r => r.member_name),
      })));

      setMembers((membersData || []).map(m => ({
        id: m.id, name: m.name, phone: m.phone, level: m.level,
        attendanceCount: m.attendance_count, membershipExpiry: m.membership_expiry, status: m.status,
      })));

      setLeaderboard((leaderboardData || []).map(l => ({
        id: l.id, rank: l.rank, name: l.name, type: l.type, record: l.record,
      })));

      setFeed((feedData || []).map(p => ({
        id: p.id, author: p.author, avatar: p.avatar, content: p.content, image: p.image,
        likes: p.feed_likes?.length || 0,
        hasLiked: p.feed_likes?.some(l => l.member_name === displayName) || false,
        comments: (p.feed_comments || []).map(c => ({ id: c.id, author: c.author, content: c.content })),
        timestamp: formatTimestamp(p.created_at),
      })));

      setNotices((noticesData || []).map(n => ({
        id: n.id, title: n.title, content: n.content,
        isPopup: n.is_popup, isActive: n.is_active, timestamp: n.created_at?.split('T')[0],
      })));

      setWorkoutRecords(workoutRecordsData || []);
      setRecordFeedback(recordFeedbackData || []);

      setMyReservations(
        (reservationsData || [])
          .filter(r => r.member_name === displayName)
          .map(r => ({ classId: r.class_id, date: r.reservation_date || new Date().toISOString().split('T')[0] }))
      );

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('member_name', displayName)
        .gte('created_at', startOfMonth);
      setMonthlyAttendance(count || 0);
    } catch (err) {
      console.error('Supabase load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── 예약 ──
  const toggleBooking = async (classId, date) => {
    const bookDate = date || new Date().toISOString().split('T')[0];
    const isBooked = myReservations.some(r => r.classId === classId && r.date === bookDate);

    if (!isBooked) {
      // 같은 날 중복 예약 차단
      const hasSameDayBooking = myReservations.some(r => r.date === bookDate);
      if (hasSameDayBooking) {
        alert('이미 해당 날짜에 예약이 있습니다. 기존 예약을 취소한 후 다시 예약해주세요.');
        return;
      }
      // 회원권 만료 확인
      const normalizePhone = (p) => p?.replace(/\D/g, '') || '';
      const myProfile = members.find(m => normalizePhone(m.phone) === normalizePhone(profile?.phone))
                     || members.find(m => m.name === (profile?.name || displayName));
      if (myProfile?.membershipExpiry) {
        const expiry = new Date(myProfile.membershipExpiry);
        expiry.setHours(23, 59, 59, 999);
        if (expiry < new Date()) { alert('회원권이 만료되었습니다. 관리자에게 문의하세요.'); return; }
      }
      // 정원 확인
      const dateAttendees = allReservations.filter(r => r.class_id === classId && r.reservation_date === bookDate);
      const cls = classes.find(c => c.id === classId);
      if (cls && dateAttendees.length >= cls.maxCapacity) { alert('정원이 초과되었습니다.'); return; }
    }

    if (isBooked) {
      await supabase.from('reservations').delete()
        .match({ class_id: classId, member_name: displayName, reservation_date: bookDate });
      setMyReservations(prev => prev.filter(r => !(r.classId === classId && r.date === bookDate)));
      setAllReservations(prev => prev.filter(r => !(r.class_id === classId && r.member_name === displayName && r.reservation_date === bookDate)));
      if (bookDate === new Date().toISOString().split('T')[0]) {
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, attendees: c.attendees.filter(n => n !== displayName) } : c));
      }
      setMonthlyAttendance(prev => Math.max(0, prev - 1));
    } else {
      await supabase.from('reservations').insert({ class_id: classId, member_name: displayName, reservation_date: bookDate });
      setMyReservations(prev => [...prev, { classId, date: bookDate }]);
      setAllReservations(prev => [...prev, { class_id: classId, member_name: displayName, reservation_date: bookDate }]);
      if (bookDate === new Date().toISOString().split('T')[0]) {
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, attendees: [...c.attendees, displayName] } : c));
      }
      setMonthlyAttendance(prev => prev + 1);
    }
  };

  // ── WOD ──
  const addWod = async (newWod) => {
    const { data, error } = await supabase.from('wods').insert({
      date: newWod.date, title: newWod.title, type: newWod.type,
      workout1_title: newWod.workout1Title, workout1_description: newWod.workout1Description,
      time_limit: newWod.timeLimit, rxd: newWod.rxd, scaled: newWod.scaled, description: newWod.description
    }).select().single();
    if (error) { console.error(error); return; }
    setWods(prev => [{ ...newWod, id: data.id }, ...prev]);
  };

  // ── 리더보드 ──
  const addLeaderboardRecord = async (type, recordStr) => {
    const { data, error } = await supabase.from('leaderboard').insert({ name: displayName, type, record: recordStr, rank: 0 }).select().single();
    if (error) { console.error(error); return; }
    const parseRecord = (r) => { const m = r.match(/^(\d+):(\d+)$/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : Infinity; };
    const newList = [...leaderboard, { id: data.id, rank: 0, name: displayName, type, record: recordStr }]
      .sort((a, b) => parseRecord(a.record) - parseRecord(b.record)).map((item, i) => ({ ...item, rank: i + 1 }));
    setLeaderboard(newList);
  };

  // ── 피드 ──
  const addFeedPost = async (content, imageUrl) => {
    const avatar = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80';
    const { data, error } = await supabase.from('feed_posts').insert({ author: displayName, avatar, content, image: imageUrl || null }).select().single();
    if (error) { console.error(error); return; }
    setFeed(prev => [{ id: data.id, author: displayName, avatar, content, image: imageUrl || null, likes: 0, hasLiked: false, comments: [], timestamp: '방금 전' }, ...prev]);
  };

  const toggleLikeFeed = async (feedId) => {
    const post = feed.find(p => p.id === feedId);
    if (!post) return;
    if (post.hasLiked) await supabase.from('feed_likes').delete().match({ post_id: feedId, member_name: displayName });
    else await supabase.from('feed_likes').insert({ post_id: feedId, member_name: displayName });
    setFeed(prev => prev.map(p => p.id === feedId ? { ...p, likes: p.hasLiked ? p.likes - 1 : p.likes + 1, hasLiked: !p.hasLiked } : p));
  };

  const addCommentToFeed = async (feedId, commentText) => {
    const { data, error } = await supabase.from('feed_comments').insert({ post_id: feedId, author: displayName, content: commentText }).select().single();
    if (error) { console.error(error); return; }
    setFeed(prev => prev.map(p => p.id === feedId ? { ...p, comments: [...p.comments, { id: data.id, author: displayName, content: commentText }] } : p));
  };

  // ── 기록 업로드 & 피드백 ──
  const addWorkoutRecord = async (record) => {
    const { data, error } = await supabase.from('workout_records').insert(record).select().single();
    if (error) { console.error(error); return; }
    setWorkoutRecords(prev => [data, ...prev]);
  };

  const deleteWorkoutRecord = async (id) => {
    if (!window.confirm('기록을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('workout_records').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setWorkoutRecords(prev => prev.filter(r => r.id !== id));
  };

  const addRecordFeedback = async (recordId, content) => {
    const { data, error } = await supabase.from('record_feedback').insert({ record_id: recordId, author: displayName, content }).select().single();
    if (error) { console.error(error); return; }
    setRecordFeedback(prev => [...prev, data]);
  };

  // ── 관리자 ──
  const addNotice = async (n) => {
    const { data, error } = await supabase.from('notices').insert({ title: n.title, content: n.content, is_popup: n.isPopup, is_active: true }).select().single();
    if (error) { console.error(error); return; }
    setNotices(prev => [{ id: data.id, title: n.title, content: n.content, isPopup: n.isPopup, isActive: true, timestamp: data.created_at?.split('T')[0] }, ...prev]);
  };
  const toggleNoticeActive = async (id) => {
    const n = notices.find(n => n.id === id);
    if (!n) return;
    await supabase.from('notices').update({ is_active: !n.isActive }).eq('id', id);
    setNotices(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };
  const deleteNotice = async (id) => {
    if (!window.confirm('공지를 삭제하시겠습니까?')) return;
    await supabase.from('notices').delete().eq('id', id);
    setNotices(prev => prev.filter(n => n.id !== id));
  };
  const addClassSlot = async (cls) => {
    const { data, error } = await supabase.from('classes').insert({
      time: cls.time, coach: cls.coach, max_capacity: cls.maxCapacity,
      class_name: cls.className || 'CrossFit',
      day_of_week: cls.dayOfWeek !== '' && cls.dayOfWeek != null ? Number(cls.dayOfWeek) : null,
    }).select().single();
    if (error) { console.error(error); return; }
    setClasses(prev => [...prev, {
      id: data.id, time: cls.time, coach: cls.coach, maxCapacity: cls.maxCapacity,
      className: cls.className || 'CrossFit', dayOfWeek: cls.dayOfWeek,
      attendees: []
    }].sort((a, b) => a.time.localeCompare(b.time)));
  };
  const deleteClassSlot = async (id) => {
    if (!window.confirm('이 클래스를 삭제하시겠습니까?')) return;
    await supabase.from('classes').delete().eq('id', id);
    setClasses(prev => prev.filter(c => c.id !== id));
  };
  const deleteFeedPost = async (id) => {
    if (!window.confirm('이 게시물을 삭제하시겠습니까?')) return;
    await supabase.from('feed_posts').delete().eq('id', id);
    setFeed(prev => prev.filter(f => f.id !== id));
  };
  const setMemberExpiry = async (memberId, months) => {
    const m = members.find(m => m.id === memberId);
    if (!m) return;
    const base = m.membershipExpiry && new Date(m.membershipExpiry) > new Date()
      ? new Date(m.membershipExpiry)
      : new Date();
    base.setMonth(base.getMonth() + months);
    const newExpiry = base.toISOString().split('T')[0];
    const { error } = await supabase.from('members').update({ membership_expiry: newExpiry }).eq('id', memberId);
    if (error) { console.error('만료일 업데이트 실패:', error.message); alert('저장 실패: ' + error.message); return; }
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, membershipExpiry: newExpiry } : item));
  };

  const setMemberLevel = async (memberId, level) => {
    const { error } = await supabase.from('members').update({ level }).eq('id', memberId);
    if (error) { console.error('레벨 업데이트 실패:', error.message); alert('저장 실패: ' + error.message); return; }
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, level } : item));
  };

  const setMemberExpiryDate = async (memberId, dateStr) => {
    if (!dateStr) return;
    const { error } = await supabase.from('members').update({ membership_expiry: dateStr }).eq('id', memberId);
    if (error) { console.error('만료일 업데이트 실패:', error.message); alert('저장 실패: ' + error.message); return; }
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, membershipExpiry: dateStr } : item));
  };
  const toggleMemberStatus = async (memberId) => {
    const m = members.find(m => m.id === memberId);
    if (!m) return;
    const newStatus = m.status === 'Active' ? 'Inactive' : 'Active';
    await supabase.from('members').update({ status: newStatus }).eq('id', memberId);
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, status: newStatus } : item));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderMemberPage = () => {
    if (loading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--neon-lime)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
    switch (currentPage) {
      case 'wod': return <UserHome wods={wods} classes={classes} myReservations={myReservations} members={members} setCurrentPage={setCurrentPage} leaderboard={leaderboard} addLeaderboardRecord={addLeaderboardRecord} notices={notices} monthlyAttendance={monthlyAttendance} workoutRecords={workoutRecords} />;
      case 'reservation': return <ReservationPage classes={classes} myReservations={myReservations} toggleBooking={toggleBooking} allReservations={allReservations} />;
      case 'feed': return <CommunityPage feed={feed} addFeedPost={addFeedPost} toggleLikeFeed={toggleLikeFeed} addCommentToFeed={addCommentToFeed} notices={notices} />;
      case 'record': {
        const normalize = (p) => p?.replace(/\D/g, '') || '';
        // email형식이 '01087288635@haca.local'이므로 전화번호 추출 가능
        const myPhone = normalize(profile?.phone || user?.email?.split('@')[0]);
        const myMember = members.find(m => normalize(m.phone) === myPhone);
        const myMemberLevel = myMember?.level || 'Beginner';
        return <RecordPage workoutRecords={workoutRecords} recordFeedback={recordFeedback} addWorkoutRecord={addWorkoutRecord} deleteWorkoutRecord={deleteWorkoutRecord} addRecordFeedback={addRecordFeedback} isAdmin={isAdmin} wods={wods} memberLevel={myMemberLevel} />;
      }
      case 'schedule': return <SchedulePage />;
      case 'location': return <LocationPage />;
      case 'profile': return <ProfilePage setCurrentPage={setCurrentPage} />;
      default: return <UserHome wods={wods} classes={classes} myReservations={myReservations} members={members} setCurrentPage={setCurrentPage} leaderboard={leaderboard} addLeaderboardRecord={addLeaderboardRecord} notices={notices} monthlyAttendance={monthlyAttendance} />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="role-switcher-bar">
        <div className="role-info">
          <button className="logo-btn" onClick={() => { navigate('/'); setCurrentPage('wod'); }} aria-label="홈으로">
            <img src="/logo.png" alt="HACA Training Club" className="header-logo" />
          </button>
        </div>

        {!isAdminRoute && (
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAdmin && (
            <button
              className={`role-btn ${isAdminRoute ? 'user' : 'coach'}`}
              onClick={() => navigate(isAdminRoute ? '/' : '/admin')}
            >
              <Shield size={16} />
              <span>{isAdminRoute ? '회원 보기' : '관리자'}</span>
            </button>
          )}
          {!isAdminRoute && (
            <button className="role-btn user" onClick={() => setCurrentPage('profile')} title="내 정보">
              <UserCircle size={16} />
              <span className="logout-name-hide">{displayName}</span>
            </button>
          )}
          <button className="role-btn" onClick={handleSignOut} title="로그아웃" style={{ padding: '8px 10px' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Page content */}
      {isAdminRoute ? (
        <div className="main-content">
          <AdminDashboard
            addWod={addWod}
            classes={classes} addClassSlot={addClassSlot} deleteClassSlot={deleteClassSlot}
            members={members} setMemberExpiry={setMemberExpiry} setMemberExpiryDate={setMemberExpiryDate} toggleMemberStatus={toggleMemberStatus} setMemberLevel={setMemberLevel}
            feed={feed} deleteFeedPost={deleteFeedPost}
            notices={notices} addNotice={addNotice} toggleNoticeActive={toggleNoticeActive} deleteNotice={deleteNotice}
          />
        </div>
      ) : (
        <>
          <div className="main-content">{renderMemberPage()}</div>
          <div className="brand-watermark-section" aria-hidden="true">
            <img src="/athlete.png" alt="" className="brand-watermark-img" />
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AppShell />
        </ProtectedRoute>
      } />
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
