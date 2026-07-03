import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import './LocationPage.css';

const ADDRESS = '경기 성남시 분당구 운중로138번길 7 1층';
const ADDRESS_ENC = encodeURIComponent(ADDRESS);

const LocationPage = () => {
  const openKakaoMap = () => {
    window.open(`https://map.kakao.com/?q=${ADDRESS_ENC}`, '_blank');
  };

  return (
    <div className="location-page">
      <header className="page-header">
        <h1>오시는 길</h1>
      </header>

      <div className="location-content">
        <div className="map-container">
          <iframe
            title="HACA CrossFit 위치"
            src={`https://maps.google.com/maps?q=${ADDRESS_ENC}&output=embed&hl=ko&z=17`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="map-actions">
          <button className="nav-btn kakao" onClick={openKakaoMap}>
            <Navigation size={18} /> 카카오맵으로 길찾기
          </button>
          <a
            className="nav-btn google"
            href={`https://maps.google.com/?q=${ADDRESS_ENC}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={18} /> 구글맵으로 길찾기
          </a>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-icon">
              <MapPin size={20} className="text-lime" />
            </div>
            <div className="info-text">
              <h3>주소</h3>
              <p>{ADDRESS}</p>
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
              <p>월–금: 06:30 ~ 21:30</p>
              <p>토요일: 10:00 ~ 14:00</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>일요일 정기휴무 (매주)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
