import './WodCard.css';

const WodCard = ({ wod, large = false }) => {
  const w1Title = wod?.workout1Title || 'Deadlift 5-5-5-5-5';
  const w1Desc = wod?.workout1Description || 'Build to a heavy 5 rep Deadlift for the day.\nRest 2-3 mins between sets.';
  
  return (
  <div className={`wod-card-container ${large ? 'large' : ''}`}>
    <div className="wod-block workout1-block">
      <div className="wod-block-header">
        <span className="wod-block-num">01</span>
        <div>
          <div className="wod-block-type">WORKOUT 1</div>
          <div className="wod-block-sub">Strength &amp; Accessory</div>
        </div>
      </div>
      <h3 className="wod-title">{w1Title}</h3>
      <pre className="wod-pre">{w1Desc}</pre>
    </div>

    <div className="wod-block workout2-block">
      <div className="wod-block-header">
        <span className="wod-block-num">02</span>
        <div>
          <div className="wod-block-type">WORKOUT 2</div>
          <div className="wod-block-sub">WOD</div>
        </div>
      </div>
      <div className="wod-date">{wod.date}</div>
      <h3 className="wod-title">{wod.title}</h3>
      <div className="wod-meta-row">
        <span className="wod-type-tag">{wod.type}</span>
        {wod.timeLimit && (
          <span className="wod-timecap">⏱ Time Cap · {wod.timeLimit}</span>
        )}
      </div>
      {wod.rxd && <pre className="wod-pre">{wod.rxd}</pre>}
    </div>
  </div>
  );
};

export default WodCard;
