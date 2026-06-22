import { useState, useEffect } from 'react';
import { Shield, User } from 'lucide-react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserHome from './pages/UserHome';
import ReservationPage from './pages/ReservationPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import LocationPage from './pages/LocationPage';
import SchedulePage from './pages/SchedulePage';
import './App.css';

const ME = '홍길동';

const formatTimestamp = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

function App() {
  const [role, setRole] = useState(() => localStorage.getItem('haca_role') || 'user');
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('haca_page') || 'wod');
  const [loading, setLoading] = useState(true);

  const [wods, setWods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [notices, setNotices] = useState([]);
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => { localStorage.setItem('haca_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('haca_page', currentPage); }, [currentPage]);

  useEffect(() => { loadAllData(); }, []);

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
      ] = await Promise.all([
        supabase.from('wods').select('*').order('date', { ascending: false }),
        supabase.from('classes').select('*').order('time'),
        supabase.from('reservations').select('*'),
        supabase.from('members').select('*'),
        supabase.from('leaderboard').select('*').order('rank'),
        supabase.from('feed_posts').select('*, feed_comments(*), feed_likes(*)').order('created_at', { ascending: false }),
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
      ]);

      setWods((wodsData || []).map(w => ({
        id: w.id, date: w.date, title: w.title, type: w.type,
        timeLimit: w.time_limit, rxd: w.rxd, scaled: w.scaled, description: w.description,
      })));

      setClasses((classesData || []).map(c => ({
        id: c.id, time: c.time, coach: c.coach, maxCapacity: c.max_capacity,
        attendees: (reservationsData || []).filter(r => r.class_id === c.id).map(r => r.member_name),
      })));

      setMembers((membersData || []).map(m => ({
        id: m.id, name: m.name, phone: m.phone,
        attendanceCount: m.attendance_count, remainingSessions: m.remaining_sessions, status: m.status,
      })));

      setLeaderboard((leaderboardData || []).map(l => ({
        id: l.id, rank: l.rank, name: l.name, type: l.type, record: l.record,
      })));

      setFeed((feedData || []).map(p => ({
        id: p.id, author: p.author, avatar: p.avatar, content: p.content, image: p.image,
        likes: p.feed_likes?.length || 0,
        hasLiked: p.feed_likes?.some(l => l.member_name === ME) || false,
        comments: (p.feed_comments || []).map(c => ({ id: c.id, author: c.author, content: c.content })),
        timestamp: formatTimestamp(p.created_at),
      })));

      setNotices((noticesData || []).map(n => ({
        id: n.id, title: n.title, content: n.content,
        isPopup: n.is_popup, isActive: n.is_active, timestamp: n.created_at?.split('T')[0],
      })));

      setMyReservations(
        (reservationsData || []).filter(r => r.member_name === ME).map(r => r.class_id)
      );
    } catch (err) {
      console.error('Supabase load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = () => {
    const newRole = role === 'user' ? 'coach' : 'user';
    setRole(newRole);
    setCurrentPage(newRole === 'coach' ? 'admin' : 'wod');
  };

  // ── 예약 토글 ──
  const toggleBooking = async (classId) => {
    const myProfile = members.find(m => m.name === ME) || members[0];
    const isBooked = myReservations.includes(classId);
    const cls = classes.find(c => c.id === classId);

    if (isBooked) {
      const { error } = await supabase.from('reservations')
        .delete().match({ class_id: classId, member_name: ME });
      if (error) { console.error(error); return; }
      await supabase.from('members')
        .update({ remaining_sessions: myProfile.remainingSessions + 1 }).eq('name', ME);

      setClasses(prev => prev.map(c => c.id === classId
        ? { ...c, attendees: c.attendees.filter(n => n !== ME) } : c));
      setMyReservations(prev => prev.filter(id => id !== classId));
      setMembers(prev => prev.map(m => m.name === ME
        ? { ...m, remainingSessions: m.remainingSessions + 1 } : m));
    } else {
      if (myProfile.remainingSessions <= 0) {
        alert('이용 가능 횟수가 부족합니다. 관리자에게 문의하세요.');
        return;
      }
      if (cls.attendees.length >= cls.maxCapacity) {
        alert('정원이 초과되었습니다.');
        return;
      }
      const { error } = await supabase.from('reservations')
        .insert({ class_id: classId, member_name: ME });
      if (error) { console.error(error); return; }
      await supabase.from('members')
        .update({ remaining_sessions: myProfile.remainingSessions - 1 }).eq('name', ME);

      setClasses(prev => prev.map(c => c.id === classId
        ? { ...c, attendees: [...c.attendees, ME] } : c));
      setMyReservations(prev => [...prev, classId]);
      setMembers(prev => prev.map(m => m.name === ME
        ? { ...m, remainingSessions: m.remainingSessions - 1 } : m));
    }
  };

  // ── WOD ──
  const addWod = async (newWod) => {
    const { data, error } = await supabase.from('wods').insert({
      date: newWod.date, title: newWod.title, type: newWod.type,
      time_limit: newWod.timeLimit, rxd: newWod.rxd, scaled: newWod.scaled,
      description: newWod.description,
    }).select().single();
    if (error) { console.error(error); return; }
    setWods(prev => [{ ...newWod, id: data.id }, ...prev]);
  };

  // ── 리더보드 ──
  const addLeaderboardRecord = async (type, recordStr) => {
    const { data, error } = await supabase.from('leaderboard').insert({
      name: `${ME} (나)`, type, record: recordStr, rank: 0,
    }).select().single();
    if (error) { console.error(error); return; }
    const newList = [...leaderboard, { id: data.id, rank: 0, name: `${ME} (나)`, type, record: recordStr }]
      .sort((a, b) => a.record.localeCompare(b.record))
      .map((item, i) => ({ ...item, rank: i + 1 }));
    setLeaderboard(newList);
  };

  // ── 커뮤니티 피드 ──
  const addFeedPost = async (content, imageUrl) => {
    const avatar = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80';
    const { data, error } = await supabase.from('feed_posts')
      .insert({ author: ME, avatar, content, image: imageUrl || null }).select().single();
    if (error) { console.error(error); return; }
    setFeed(prev => [{
      id: data.id, author: ME, avatar, content, image: imageUrl || null,
      likes: 0, hasLiked: false, comments: [], timestamp: '방금 전',
    }, ...prev]);
  };

  const toggleLikeFeed = async (feedId) => {
    const post = feed.find(p => p.id === feedId);
    if (!post) return;
    if (post.hasLiked) {
      await supabase.from('feed_likes').delete().match({ post_id: feedId, member_name: ME });
    } else {
      await supabase.from('feed_likes').insert({ post_id: feedId, member_name: ME });
    }
    setFeed(prev => prev.map(p => p.id === feedId
      ? { ...p, likes: p.hasLiked ? p.likes - 1 : p.likes + 1, hasLiked: !p.hasLiked } : p));
  };

  const addCommentToFeed = async (feedId, commentText) => {
    const author = role === 'coach' ? 'Alex Coach' : ME;
    const { data, error } = await supabase.from('feed_comments')
      .insert({ post_id: feedId, author, content: commentText }).select().single();
    if (error) { console.error(error); return; }
    setFeed(prev => prev.map(p => p.id === feedId
      ? { ...p, comments: [...p.comments, { id: data.id, author, content: commentText }] } : p));
  };

  // ── 관리자 — 공지사항 ──
  const addNotice = async (noticeData) => {
    const { data, error } = await supabase.from('notices').insert({
      title: noticeData.title, content: noticeData.content,
      is_popup: noticeData.isPopup, is_active: true,
    }).select().single();
    if (error) { console.error(error); return; }
    setNotices(prev => [{
      id: data.id, title: noticeData.title, content: noticeData.content,
      isPopup: noticeData.isPopup, isActive: true, timestamp: data.created_at?.split('T')[0],
    }, ...prev]);
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

  // ── 관리자 — 클래스 ──
  const addClassSlot = async (classData) => {
    const id = `class-${Date.now()}`;
    const { error } = await supabase.from('classes').insert({
      id, time: classData.time, coach: classData.coach, max_capacity: classData.maxCapacity,
    });
    if (error) { console.error(error); return; }
    const newCls = { id, ...classData, attendees: [] };
    setClasses(prev => [...prev, newCls].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteClassSlot = async (id) => {
    if (!window.confirm('이 클래스를 삭제하시겠습니까?')) return;
    await supabase.from('classes').delete().eq('id', id);
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // ── 관리자 — 피드 ──
  const deleteFeedPost = async (id) => {
    if (!window.confirm('이 게시물을 삭제하시겠습니까?')) return;
    await supabase.from('feed_posts').delete().eq('id', id);
    setFeed(prev => prev.filter(f => f.id !== id));
  };

  // ── 관리자 — 회원 ──
  const adjustMemberSessions = async (memberId, delta) => {
    const m = members.find(m => m.id === memberId);
    if (!m) return;
    const newVal = Math.max(0, m.remainingSessions + delta);
    await supabase.from('members').update({ remaining_sessions: newVal }).eq('id', memberId);
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, remainingSessions: newVal } : item));
  };

  const toggleMemberStatus = async (memberId) => {
    const m = members.find(m => m.id === memberId);
    if (!m) return;
    const newStatus = m.status === 'Active' ? 'Inactive' : 'Active';
    await supabase.from('members').update({ status: newStatus }).eq('id', memberId);
    setMembers(prev => prev.map(item => item.id === memberId ? { ...item, status: newStatus } : item));
  };

  const renderPage = () => {
    if (loading) return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border-color)', borderTopColor: 'var(--neon-lime)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span>데이터를 불러오는 중...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (role === 'coach') {
      return (
        <AdminDashboard
          wods={wods}
          addWod={addWod}
          classes={classes}
          addClassSlot={addClassSlot}
          deleteClassSlot={deleteClassSlot}
          members={members}
          adjustMemberSessions={adjustMemberSessions}
          toggleMemberStatus={toggleMemberStatus}
          feed={feed}
          deleteFeedPost={deleteFeedPost}
          notices={notices}
          addNotice={addNotice}
          toggleNoticeActive={toggleNoticeActive}
          deleteNotice={deleteNotice}
        />
      );
    }

    switch (currentPage) {
      case 'wod':
        return <UserHome wods={wods} classes={classes} myReservations={myReservations} members={members} setCurrentPage={setCurrentPage} leaderboard={leaderboard} addLeaderboardRecord={addLeaderboardRecord} notices={notices} />;
      case 'reservation':
        return <ReservationPage classes={classes} myReservations={myReservations} toggleBooking={toggleBooking} />;
      case 'feed':
        return <CommunityPage feed={feed} addFeedPost={addFeedPost} toggleLikeFeed={toggleLikeFeed} addCommentToFeed={addCommentToFeed} notices={notices} />;
      case 'schedule':
        return <SchedulePage />;
      case 'location':
        return <LocationPage />;
      default:
        return <UserHome wods={wods} classes={classes} myReservations={myReservations} members={members} setCurrentPage={setCurrentPage} leaderboard={leaderboard} addLeaderboardRecord={addLeaderboardRecord} notices={notices} />;
    }
  };

  return (
    <div className="app-container">
      <div className="role-switcher-bar">
        <div className="role-info">
          <button className="logo-btn" onClick={() => setCurrentPage('wod')} aria-label="홈으로">
            <img src="/logo.png" alt="HACA Training Club" className="header-logo" />
          </button>
        </div>
        {role === 'user' && (
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}
        <button className={`role-btn ${role}`} onClick={handleRoleToggle}>
          {role === 'coach'
            ? (<><Shield className="icon" size={16} /><span>관리자 모드</span></>)
            : (<><User className="icon" size={16} /><span>회원 모드</span></>)}
        </button>
      </div>
      <div className="main-content">
        {renderPage()}
      </div>
      <div className="brand-watermark-section" aria-hidden="true">
        <img src="/athlete.png" alt="" className="brand-watermark-img" />
      </div>
      <Footer />
    </div>
  );
}

export default App;
