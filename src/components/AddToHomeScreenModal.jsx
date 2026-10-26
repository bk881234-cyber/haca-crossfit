import React, { useState, useEffect, useCallback } from 'react';
import { X, MoreVertical, PlusSquare, Download } from 'lucide-react';
import './AddToHomeScreenModal.css';

// iOS Safari 공유 아이콘 (정사각형 위로 나가는 화살표)
function IosShareIcon() {
  return (
    <span className="a2hs-inline-badge">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </span>
  );
}

// Android 점 3개 메뉴 아이콘
function AndroidMoreIcon() {
  return (
    <span className="a2hs-inline-badge">
      <MoreVertical size={14} />
    </span>
  );
}

// 홈 화면에 추가 아이콘 (네모 플러스)
function AddToHomeIcon() {
  return (
    <span className="a2hs-inline-badge">
      <PlusSquare size={14} />
    </span>
  );
}

// 다운로드/설치 아이콘
function InstallIcon() {
  return (
    <span className="a2hs-inline-badge">
      <Download size={14} />
    </span>
  );
}

const STORAGE_KEY = 'haca_a2hs_dismissed_until';

export default function AddToHomeScreenModal({
  appName = 'HACA Training',
  appLogo = '/logo.png',
  autoShowDelay = 1500,
  hideDays = 7,
  iosCustomImage = null,
  androidCustomImage = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ios');

  useEffect(() => {
    // 1. 이미 PWA / Standalone 모드로 실행 중이면 모달 띄우지 않음
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // 2. 디바이스 OS 자동 판별
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isAndroid) {
      setActiveTab('android');
    } else {
      setActiveTab('ios');
    }

    // 3. 로컬 스토리지에 숨김 만료일 체크
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil) {
      const expiry = parseInt(dismissedUntil, 10);
      if (Date.now() < expiry) {
        return;
      }
    }

    // 4. 모바일 화면 로딩 후 자연스러운 딜레이로 노출
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, autoShowDelay);

    // 5. 외부에서 수동으로 모달을 다시 열 수 있는 이벤트 리스너
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-a2hs-modal', handleOpenModal);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-a2hs-modal', handleOpenModal);
    };
  }, [autoShowDelay]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDismiss = useCallback(() => {
    const expiryDate = Date.now() + hideDays * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, expiryDate.toString());
    setIsOpen(false);
  }, [hideDays]);

  if (!isOpen) return null;

  return (
    <div className="a2hs-overlay" onClick={handleClose}>
      <div className="a2hs-modal" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <button className="a2hs-close-btn" onClick={handleClose} aria-label="닫기">
          <X size={20} />
        </button>

        {/* 헤더 */}
        <div className="a2hs-header">
          <div className="a2hs-app-icon">
            <img src={appLogo} alt={appName} />
          </div>
          <div className="a2hs-header-text">
            <h3>홈 화면에 추가하기</h3>
            <p>홈 화면에 추가하면 아이콘을 눌러 앱처럼 빠르게 열 수 있어요.</p>
          </div>
        </div>

        {/* OS 선택 탭 */}
        <div className="a2hs-tabs">
          <button
            type="button"
            className={'a2hs-tab-btn' + (activeTab === 'ios' ? ' active' : '')}
            onClick={() => setActiveTab('ios')}
          >
            아이폰 (Safari)
          </button>
          <button
            type="button"
            className={'a2hs-tab-btn' + (activeTab === 'android' ? ' active' : '')}
            onClick={() => setActiveTab('android')}
          >
            안드로이드 (Chrome)
          </button>
        </div>

        {/* 가이드 콘텐츠 */}
        <div className="a2hs-content">
          {activeTab === 'ios' ? (
            <div className="a2hs-card">
              <div className="a2hs-card-title">아이폰 추가 순서</div>
              <ol className="a2hs-steps">
                <li>
                  <span className="step-num">1</span>
                  <div className="step-desc">
                    Safari에서 이 사이트를 열고 하단의 <strong>공유 <IosShareIcon /></strong> 버튼을 누르세요.
                  </div>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <div className="step-desc">
                    스크롤하여 <strong>홈 화면에 추가 <AddToHomeIcon /></strong>를 선택한 뒤 우측 상단 <strong>추가</strong>를 누르세요.
                  </div>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <div className="step-desc">
                    홈 화면에 생긴 <span className="app-chip"><img src={appLogo} alt="" /> {appName}</span> 아이콘으로 실행하세요.
                  </div>
                </li>
              </ol>

              {/* 커스텀 가이드 이미지 슬롯 (설정 시 표시) */}
              {iosCustomImage && (
                <div className="a2hs-custom-img-wrap">
                  <img src={iosCustomImage} alt="iOS 홈 화면 추가 가이드" />
                </div>
              )}
            </div>
          ) : (
            <div className="a2hs-card">
              <div className="a2hs-card-title">안드로이드 추가 순서</div>
              <ol className="a2hs-steps">
                <li>
                  <span className="step-num">1</span>
                  <div className="step-desc">
                    Chrome에서 이 사이트를 열고 오른쪽 위 <strong>메뉴 <AndroidMoreIcon /></strong>를 누르세요.
                  </div>
                </li>
                <li>
                  <span className="step-num">2</span>
                  <div className="step-desc">
                    <strong>앱 설치 <InstallIcon /></strong> 또는 <strong>홈 화면에 추가</strong>를 선택하세요.
                  </div>
                </li>
                <li>
                  <span className="step-num">3</span>
                  <div className="step-desc">
                    <strong>설치</strong> 또는 추가를 누른 뒤 홈 화면의 <span className="app-chip"><img src={appLogo} alt="" /> {appName}</span> 아이콘으로 실행하세요.
                  </div>
                </li>
              </ol>

              {/* 커스텀 가이드 이미지 슬롯 (설정 시 표시) */}
              {androidCustomImage && (
                <div className="a2hs-custom-img-wrap">
                  <img src={androidCustomImage} alt="안드로이드 홈 화면 추가 가이드" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="a2hs-actions">
          <button type="button" className="a2hs-btn-primary" onClick={handleClose}>
            확인
          </button>
          <button type="button" className="a2hs-btn-secondary" onClick={handleDismiss}>
            {hideDays}일 동안 다시 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
