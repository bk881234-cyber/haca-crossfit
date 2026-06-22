import React from 'react';
import { Home, Calendar, Users, MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'wod', label: '오늘의 WOD', icon: Home },
    { id: 'reservation', label: '예약', icon: Calendar },
    { id: 'feed', label: '커뮤니티', icon: Users },
    { id: 'location', label: '오시는길', icon: MapPin }
  ];

  return (
    <nav className="bottom-navbar">
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
    </nav>
  );
};

export default Navbar;
