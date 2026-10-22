import { Users, MapPin, Trophy, CalendarDays, CalendarCheck } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'reservation', label: '예약',       icon: CalendarCheck },
    { id: 'record',      label: '대시보드',   icon: Trophy },
    { id: 'feed',        label: '커뮤니티',   icon: Users },
    { id: 'schedule',    label: '스케줄',     icon: CalendarDays },
    { id: 'location',    label: '오시는길',   icon: MapPin }
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <div className="icon-wrapper">
                <Icon size={24} />
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
