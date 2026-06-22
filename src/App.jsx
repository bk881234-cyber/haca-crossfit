import React, { useState, useEffect } from 'react';
import { Shield, User, Dumbbell } from 'lucide-react';
import Navbar from './components/Navbar';
import UserHome from './pages/UserHome';
import ReservationPage from './pages/ReservationPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import LocationPage from './pages/LocationPage';
import './App.css';

// Initial WODs Data
const initialWods = [
  {
    id: 'wod-1',
    date: '2026-06-22',
    title: 'DT (Benchmark WOD)',
    type: 'For Time',
    timeLimit: '20 Min',
    rxd: '5 Rounds for time of:\n12 Deadlifts (155/105 lb)\n9 Hang Power Cleans (155/105 lb)\n6 Push Jerks (155/105 lb)',
    scaled: '5 Rounds for time of:\n12 Deadlifts (95/65 lb)\n9 Hang Power Cleans (95/65 lb)\n6 Push Jerks (95/65 lb)',
    description: '그립 강도와 어깨 근지구력을 테스트하는 유명한 벤치마크 와드입니다. 자신의 한계에 도전해보세요!'
  }
];

// Initial Classes Data for Booking
const initialClasses = [
  { id: 'class-0700', time: '07:00', coach: 'David Coach', maxCapacity: 15, attendees: ['김철수', '이영희'] },
  { id: 'class-0930', time: '09:30', coach: 'Sarah Coach', maxCapacity: 15, attendees: ['박민준', '최수지', '정우성'] },
  { id: 'class-1200', time: '12:00', coach: 'David Coach', maxCapacity: 12, attendees: [] },
  { id: 'class-1830', time: '18:30', coach: 'Alex Coach', maxCapacity: 20, attendees: ['황정민', '한효주', '류준열'] },
  { id: 'class-2000', time: '20:00', coach: 'Alex Coach', maxCapacity: 20, attendees: ['공유', '이동욱', '김고은'] }
];

// Initial Members list (이용 가능 횟수 필드 'remainingSessions' 추가)
const initialMembers = [
  { id: 'm-1', name: '홍길동', phone: '010-1234-5678', attendanceCount: 24, remainingSessions: 12, status: 'Active' },
  { id: 'm-2', name: '김철수', phone: '010-2345-6789', attendanceCount: 8, remainingSessions: 4, status: 'Active' },
  { id: 'm-3', name: '이영희', phone: '010-3456-7890', attendanceCount: 6, remainingSessions: 0, status: 'Inactive' },
  { id: 'm-4', name: '박민준', phone: '010-4567-8901', attendanceCount: 42, remainingSessions: 20, status: 'Active' }
];

// Initial Leaderboard Data
const initialLeaderboard = [
  { id: 'lb-1', rank: 1, name: '박민준', type: 'rxd', record: '12:35' },
  { id: 'lb-2', rank: 2, name: '황정민', type: 'rxd', record: '13:12' },
  { id: 'lb-3', rank: 3, name: '김철수', type: 'scaled', record: '16:48' }
];

// Initial Feed Data
const initialFeed = [
  {
    id: 'feed-1',
    author: '홍길동',
    avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
    content: '오늘 벤치마크 와드 완료!! 오운완 하세요!',
    image: null,
    likes: 12,
    hasLiked: false,
    comments: [],
    timestamp: '3시간 전'
  }
];

// Initial Notices
const initialNotices = [
  {
    id: 'notice-1',
    title: '🔥 이번 주 금요일 오픈짐 안내',
    content: '회원 여러분! 이번 주 금요일 저녁 8시부터는 코치 없는 자율 오픈짐으로 운영됩니다. 이용에 참고 부탁드립니다.',
    isPopup: true,
    isActive: true,
    timestamp: '2026-06-22'
  }
];

function App() {
  const [role, setRole] = useState(() => localStorage.getItem('haca_role') || 'user');
  const [currentPage, setCurrentPage] = useState(() => localStorage.getItem('haca_page') || 'wod');
  
  const [wods, setWods] = useState(() => {
    const saved = localStorage.getItem('haca_wods');
    return saved ? JSON.parse(saved) : initialWods;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('haca_classes');
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('haca_members');
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('haca_leaderboard');
    return saved ? JSON.parse(saved) : initialLeaderboard;
  });

  const [feed, setFeed] = useState(() => {
    const saved = localStorage.getItem('haca_feed');
    return saved ? JSON.parse(saved) : initialFeed;
  });

  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('haca_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [myReservations, setMyReservations] = useState(() => {
    const saved = localStorage.getItem('haca_my_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('haca_role', role); }, [role]);
  useEffect(() => { localStorage.setItem('haca_page', currentPage); }, [currentPage]);
  useEffect(() => { localStorage.setItem('haca_wods', JSON.stringify(wods)); }, [wods]);
  useEffect(() => { localStorage.setItem('haca_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('haca_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('haca_leaderboard', JSON.stringify(leaderboard)); }, [leaderboard]);
  useEffect(() => { localStorage.setItem('haca_feed', JSON.stringify(feed)); }, [feed]);
  useEffect(() => { localStorage.setItem('haca_notices', JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem('haca_my_reservations', JSON.stringify(myReservations)); }, [myReservations]);

  const handleRoleToggle = () => {
    const newRole = role === 'user' ? 'coach' : 'user';
    setRole(newRole);
    setCurrentPage(newRole === 'coach' ? 'admin' : 'wod');
  };

  const toggleBooking = (classId) => {
    // 권한 및 횟수 로직 간소화 (UI 시뮬레이션용)
    const myProfile = members.find(m => m.name === '홍길동') || members[0];
    
    setClasses(prevClasses => prevClasses.map(cls => {
      if (cls.id === classId) {
        const isBooked = myReservations.includes(classId);
        let newAttendees = [...cls.attendees];
        if (isBooked) {
          newAttendees = newAttendees.filter(name => name !== '홍길동');
          setMyReservations(prev => prev.filter(id => id !== classId));
          // 예약 취소 시 횟수 복구
          setMembers(prevMembers => prevMembers.map(m => m.name === '홍길동' ? { ...m, remainingSessions: m.remainingSessions + 1 } : m));
        } else {
          if (myProfile.remainingSessions <= 0) {
            alert('이용 가능 횟수가 부족합니다. 관리자에게 문의하세요.');
            return cls;
          }
          if (newAttendees.length < cls.maxCapacity) {
            newAttendees.push('홍길동');
            setMyReservations(prev => [...prev, classId]);
            // 예약 시 횟수 차감
            setMembers(prevMembers => prevMembers.map(m => m.name === '홍길동' ? { ...m, remainingSessions: m.remainingSessions - 1 } : m));
          } else {
            alert('정원이 초과되었습니다.');
          }
        }
        return { ...cls, attendees: newAttendees };
      }
      return cls;
    }));
  };

  const addWod = (newWod) => {
    setWods(prev => [{ id: `wod-${Date.now()}`, ...newWod }, ...prev]);
  };

  const addLeaderboardRecord = (type, recordStr) => {
    setLeaderboard(prev => {
      const newRecord = { id: `lb-${Date.now()}`, rank: 0, name: '홍길동 (나)', type: type, record: recordStr };
      const newList = [...prev, newRecord].sort((a, b) => a.record.localeCompare(b.record));
      return newList.map((item, index) => ({ ...item, rank: index + 1 }));
    });
  };

  const addFeedPost = (content, imageUrl) => {
    setFeed(prev => [{
      id: `feed-${Date.now()}`,
      author: '홍길동',
      avatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
      content,
      image: imageUrl || null,
      likes: 0,
      hasLiked: false,
      comments: [],
      timestamp: '방금 전'
    }, ...prev]);
  };

  const toggleLikeFeed = (feedId) => {
    setFeed(prev => prev.map(post => post.id === feedId ? { ...post, likes: post.hasLiked ? post.likes - 1 : post.likes + 1, hasLiked: !post.hasLiked } : post));
  };

  const addCommentToFeed = (feedId, commentText) => {
    setFeed(prev => prev.map(post => post.id === feedId ? {
      ...post, comments: [...post.comments, { id: `c-${Date.now()}`, author: role === 'coach' ? 'Alex Coach' : '홍길동', content: commentText }]
    } : post));
  };

  const renderPage = () => {
    if (role === 'coach') {
      return (
        <AdminDashboard 
          wods={wods} 
          addWod={addWod}
          classes={classes} 
          setClasses={setClasses}
          members={members} 
          setMembers={setMembers} 
          feed={feed}
          setFeed={setFeed}
          notices={notices}
          setNotices={setNotices}
        />
      );
    }

    switch (currentPage) {
      case 'wod':
        return <UserHome 
                 wods={wods} 
                 classes={classes} 
                 myReservations={myReservations} 
                 members={members} 
                 setCurrentPage={setCurrentPage}
                 leaderboard={leaderboard}
                 addLeaderboardRecord={addLeaderboardRecord}
                 notices={notices}
               />;
      case 'reservation':
        return <ReservationPage classes={classes} myReservations={myReservations} toggleBooking={toggleBooking} />;
      case 'feed':
        return <CommunityPage feed={feed} addFeedPost={addFeedPost} toggleLikeFeed={toggleLikeFeed} addCommentToFeed={addCommentToFeed} />;
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
          <Dumbbell className="logo-icon text-lime" />
          <span className="brand-name">HACA <span className="text-lime">CROSSFIT</span></span>
        </div>
        <button className={`role-btn ${role}`} onClick={handleRoleToggle}>
          {role === 'coach' ? (<><Shield className="icon" size={16} /><span>관리자 모드</span></>) : (<><User className="icon" size={16} /><span>회원 모드</span></>)}
        </button>
      </div>
      <div className="main-content">
        {renderPage()}
      </div>
      {role === 'user' && (
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
