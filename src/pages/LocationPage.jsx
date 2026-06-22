import React from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import './LocationPage.css';

const LocationPage = () => {
  return (
    <div className="location-page">
      <header className="page-header">
        <h1>오시는 길</h1>
      </header>
      
      <div className="location-content">
        <div className="map-placeholder">
          <div className="map-mockup">
            <MapPin size={48} className="text-lime" />
            <p>지도 API 연동 영역</p>
          </div>
          <button className="nav-btn">
            <Navigation size={18} /> 길찾기
          </button>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-icon">
              <MapPin size={20} className="text-lime" />
            </div>
            <div className="info-text">
              <h3>주소</h3>
              <p>서울특별시 강남구 테헤란로 123, 지하 1층 HACA 크로스핏</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">
              <Phone size={20} className="text-lime" />
            </div>
            <div className="info-text">
              <h3>연락처</h3>
              <p>02-1234-5678</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">
              <Clock size={20} className="text-lime" />
            </div>
            <div className="info-text">
              <h3>운영시간</h3>
              <p>평일: 07:00 ~ 22:30</p>
              <p>토요일: 10:00 ~ 14:00 (일요일, 공휴일 휴무)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
