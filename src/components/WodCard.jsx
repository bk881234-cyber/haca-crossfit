import React, { useState } from 'react';
import { Timer, Trophy, Flame } from 'lucide-react';
import './WodCard.css';

const WodCard = ({ wod }) => {
  const [level, setLevel] = useState('rxd'); // 'rxd' or 'scaled'
  const [timerActive, setTimerActive] = useState(false);
  const [time, setTime] = useState(0);

  // 간단한 타이머 로직
  React.useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!timerActive && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, time]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="wod-card-container">
      <div className="wod-card">
        <div className="wod-header">
          <div className="wod-date">{wod.date}</div>
          <h3 className="wod-title">{wod.title}</h3>
        </div>

        <div className="wod-meta-info">
          <div className="meta-item">
            <Flame size={16} className="text-lime" />
            <span className="meta-label">타입</span>
            <span className="meta-value">{wod.type}</span>
          </div>
          <div className="meta-item time-cap-item">
            <Timer size={16} className="text-lime" />
            <span className="meta-label">Time Cap</span>
            <span className="meta-value highlight-cap">{wod.timeLimit}</span>
          </div>
        </div>

        <p className="wod-desc">{wod.description}</p>

        {/* Level Toggle - moved up */}
        <div className="level-toggle">
          <button 
            className={`toggle-btn ${level === 'rxd' ? 'active' : ''}`}
            onClick={() => setLevel('rxd')}
          >
            Rx'd
          </button>
          <button 
            className={`toggle-btn ${level === 'scaled' ? 'active' : ''}`}
            onClick={() => setLevel('scaled')}
          >
            Scaled
          </button>
        </div>

        <div className="wod-content">
          <pre>{level === 'rxd' ? wod.rxd : wod.scaled}</pre>
        </div>

        <div className="wod-actions">
          <button 
            className={`timer-btn ${timerActive ? 'active' : ''}`}
            onClick={() => setTimerActive(!timerActive)}
          >
            <Timer size={20} />
            {timerActive ? 'Stop' : 'Start Timer'}
          </button>
          {time > 0 && <div className="timer-display">{formatTime(time)}</div>}
        </div>
      </div>
    </div>
  );
};

export default WodCard;
