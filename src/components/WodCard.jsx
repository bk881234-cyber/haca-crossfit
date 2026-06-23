import './WodCard.css';

const WodCard = ({ wod, large = false }) => {
  return (
  <div className={`wod-card-container ${large ? 'large' : ''}`}>
    {wod?.date && <div className="wod-date-top">WORKOUT ({wod.date})</div>}

    {wod?.workout1Title && (
    <div className="wod-block workout1-block">
      <div className="wod-block-header">
        <div>
          <div className="wod-block-num">01</div>
          <div className="wod-block-sub">Strength &amp; Accessory</div>
        </div>
      </div>
      <h3 className="wod-title">{wod.workout1Title}</h3>
      {wod.workout1Description && <pre className="wod-pre">{wod.workout1Description}</pre>}
    </div>
    )}

    <div className="wod-block workout2-block">
      <div className="wod-block-header">
        <div>
          <div className="wod-block-num">02</div>
          <div className="wod-block-sub">WOD</div>
        </div>
      </div>
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
