import { useState } from 'react';
import { Timer, Flame } from 'lucide-react';
import './WodCard.css';

const WodCard = ({ wod }) => {
  const [level, setLevel] = useState('rxd');

  return (
    <div className="wod-card-container">
      <div className="wod-card">
        <div className="wod-header">
          <div className="wod-date">{wod.date}</div>
          <h3 className="wod-title">{wod.title}</h3>
        </div>

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
          <div className="wod-meta-info">
            <div className="meta-item">
              <Flame size={14} className="text-lime" />
              <span className="meta-value">{wod.type}</span>
            </div>
            <div className="meta-item time-cap-item">
              <Timer size={14} className="text-lime" />
              <span className="meta-label">Time Cap</span>
              <span className="meta-value highlight-cap">{wod.timeLimit}</span>
            </div>
          </div>
          <pre>{level === 'rxd' ? wod.rxd : wod.scaled}</pre>
        </div>
      </div>
    </div>
  );
};

export default WodCard;
