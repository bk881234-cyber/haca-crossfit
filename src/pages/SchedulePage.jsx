import './SchedulePage.css';

const SchedulePage = () => {
  return (
    <div className="schedule-page fade-in">
      <div className="schedule-page-header">
        <h1>Weekly Schedule</h1>
        <p className="sub-text">HACA CrossFit & HYROX 주간 시간표</p>
      </div>

      {/* ── 주간 시간표 테이블 ── */}
      <div className="schedule-table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="time-header"></th>
              <th>MON</th>
              <th>TUE</th>
              <th>WED</th>
              <th>THU</th>
              <th>FRI</th>
              <th>SAT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="time-col">6:30</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell empty"></td>
            </tr>

            <tr>
              <td className="time-col small">7:30<br />~10:00</td>
              <td colSpan={5} className="cell open-gym">OPEN GYM</td>
              <td className="cell empty"></td>
            </tr>

            <tr>
              <td className="time-col">10:00</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hybrid">HYBRID<br />TRAINING</td>
            </tr>

            <tr>
              <td className="time-col">11:30</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell hybrid">HYBRID<br />TRAINING</td>
            </tr>

            <tr>
              <td className="time-col small">12:30<br />~18:30</td>
              <td colSpan={5} className="cell open-gym">OPEN GYM <span className="wc-label">(W.C)</span></td>
              <td className="cell open-gym sat-open">~14:00<br />OPEN GYM<br /><span className="wc-label">(W.C)</span></td>
            </tr>

            <tr>
              <td className="time-col">18:30</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell empty"></td>
            </tr>

            <tr>
              <td className="time-col">19:30</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell empty"></td>
            </tr>

            <tr>
              <td className="time-col">20:30</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell hyrox">HYROX</td>
              <td className="cell crossfit">CrossFit</td>
              <td className="cell empty"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 범례 ── */}
      <div className="legend-row">
        <div className="legend-item">
          <span className="legend-dot crossfit-dot"></span>
          <span>CrossFit</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot hyrox-dot"></span>
          <span>HYROX</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot hybrid-dot"></span>
          <span>Hybrid Training</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot opengym-dot"></span>
          <span>Open Gym</span>
        </div>
      </div>

      {/* ── 오픈짐 안내 ── */}
      <div className="open-gym-section">
        <h2 className="section-title">오픈짐 안내</h2>
        <p className="section-sub">오픈짐 시간을 확인해주세요.</p>

        <div className="open-gym-cards">
          <div className="open-gym-card">
            <div className="gym-time-label">
              <span className="period">AM</span>
              <span className="gym-name">OPEN GYM</span>
              <span className="gym-hours">07:30 – 10:00</span>
            </div>
            <div className="gym-info">
              <p>프리 개방</p>
              <p>개인 운동 가능</p>
            </div>
          </div>

          <div className="open-gym-card">
            <div className="gym-time-label">
              <span className="period">PM</span>
              <span className="gym-name">OPEN GYM</span>
              <span className="gym-hours">14:00 – 18:30</span>
            </div>
            <div className="gym-info">
              <p>프리 개방</p>
              <p>개인 운동 가능</p>
              <p className="coach-note">코치와 함께 운동 <strong>(14:00 – 17:00)</strong></p>
            </div>
          </div>

          <div className="open-gym-card sat-card">
            <div className="gym-time-label">
              <span className="period">SAT</span>
              <span className="gym-name">OPEN GYM</span>
              <span className="gym-hours">11:30 – 14:00</span>
            </div>
            <div className="gym-info">
              <p>프리 개방</p>
              <p>개인 운동 가능</p>
              <p className="coach-note">코치와 함께 운동</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
