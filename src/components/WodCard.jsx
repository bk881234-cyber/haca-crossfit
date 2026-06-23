import './WodCard.css';

const WodCard = ({ wod }) => (
  <div className="wod-card-container">
    {wod.workout1Title && (
      <div className="wod-block workout1-block">
        <div className="wod-block-header">
          <span className="wod-block-num">01</span>
          <div>
            <div className="wod-block-type">WORKOUT 1</div>
            <div className="wod-block-sub">Strength &amp; Accessory</div>
          </div>
        </div>
        <h3 className="wod-title">{wod.workout1Title}</h3>
        {wod.workout1Description && (
          <pre className="wod-pre">{wod.workout1Description}</pre>
        )}
      </div>
    )}

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

export default WodCard;
