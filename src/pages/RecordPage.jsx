import { useState } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WodCard from '../components/WodCard';
import './RecordPage.css';

const LEVELS = ['Black', 'Red', 'Yellow', 'White', 'Rainbow', 'Beginner'];

const LEVEL_STYLE = {
  Black:    { color: '#ffffff', bg: 'rgba(255,255,255,0.07)', border: '#555' },
  Red:      { color: '#ff4444', bg: 'rgba(255,68,68,0.10)',   border: '#ff4444' },
  Yellow:   { color: '#ffc800', bg: 'rgba(255,200,0,0.10)',   border: '#ffc800' },
  White:    { color: '#eeeeee', bg: 'rgba(240,240,240,0.07)', border: '#aaa' },
  Rainbow:  { color: '#00e5ff', bg: 'rgba(0,229,255,0.08)',   border: '#00e5ff' },
  Beginner: { color: '#9999ff', bg: 'rgba(150,150,255,0.10)', border: '#9999ff' },
};

const RECORD_TYPES = [
  { id: 'for_time',  label: 'FOR TIME',    ex: '예) 10:37' },
  { id: 'amrap',     label: 'AMRAP',        ex: '예) 5R + 37' },
  { id: 'fail_done', label: 'FAIL / DONE',  ex: '' },
  { id: 'weight',    label: 'WEIGHT',       ex: '예) 105 LB' },
];

const parseSeconds = (v) => {
  const m = v?.match(/^(\d+):(\d+)$/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : Infinity;
};
const parseAmrap = (v) => {
  const round = v?.match(/(\d+)\s*R\s*\+\s*(\d+)/i);
  if (round) return parseInt(round[1]) * 10000 + parseInt(round[2]);
  return parseFloat(v) || 0;
};
const parseWeight = (v) => parseFloat(v) || 0;

const sortRecords = (records) =>
  [...records].sort((a, b) => {
    if (a.record_type !== b.record_type) return 0;
    if (a.record_type === 'for_time') return parseSeconds(a.record_value) - parseSeconds(b.record_value);
    if (a.record_type === 'amrap')    return parseAmrap(b.record_value) - parseAmrap(a.record_value);
    if (a.record_type === 'weight')   return parseWeight(b.record_value) - parseWeight(a.record_value);
    return 0;
  });

export default function RecordPage({ workoutRecords, recordFeedback, addWorkoutRecord, addRecordFeedback, isAdmin, wods }) {
  const { displayName, profile } = useAuth();
  const myLevel = profile?.level || 'Beginner';
  const today = new Date().toISOString().split('T')[0];
  const todayWod = wods?.find(w => w.date === today) || wods?.[0];

  /* ── Form state ── */
  const [workoutTab, setWorkoutTab] = useState('workout2');
  const [recordType, setRecordType]  = useState('for_time');
  const [timeMin, setTimeMin]   = useState('');
  const [timeSec, setTimeSec]   = useState('');
  const [amrapVal, setAmrapVal] = useState('');
  const [failDone, setFailDone] = useState('DONE');
  const [weightVal, setWeightVal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved]   = useState(false);

  /* ── Leaderboard state ── */
  const [lbWorkout, setLbWorkout] = useState('workout2');
  const [lbLevel, setLbLevel]     = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const [fbText, setFbText]       = useState('');

  const getRecordValue = () => {
    if (recordType === 'for_time')  return `${timeMin || '0'}:${(timeSec || '0').padStart(2, '0')}`;
    if (recordType === 'amrap')     return amrapVal.trim();
    if (recordType === 'fail_done') return failDone;
    if (recordType === 'weight')    return `${weightVal} LB`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = getRecordValue();
    if (!value) return;
    setSubmitting(true);
    await addWorkoutRecord({
      member_name: displayName,
      member_level: myLevel,
      workout_type: workoutTab,
      wod_date: today,
      record_type: recordType,
      record_value: value,
    });
    setSubmitting(false);
    setJustSaved(true);
    setTimeMin(''); setTimeSec(''); setAmrapVal(''); setWeightVal('');
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleFeedback = async (recordId) => {
    if (!fbText.trim()) return;
    await addRecordFeedback(recordId, fbText.trim());
    setFbText('');
  };

  /* ── Leaderboard filtering ── */
  const todayRecords = (workoutRecords || []).filter(
    r => r.wod_date === today
  );
  const filtered = lbLevel === 'all' ? todayRecords : todayRecords.filter(r => r.member_level === lbLevel);
  
  const w1Records = sortRecords(filtered.filter(r => r.workout_type === 'workout1'));
  const w2Records = sortRecords(filtered.filter(r => r.workout_type === 'workout2'));

  const ls = LEVEL_STYLE[myLevel] || LEVEL_STYLE.Beginner;

  return (
    <div className="record-page fade-in">

      {/* ══ RECORD UPLOAD ══ */}
      <section className="rp-section">

        {/* 오늘의 WOD 표시 */}
        {todayWod && (
          <div style={{ marginBottom: '2rem' }}>
            <WodCard wod={todayWod} large={true} />
          </div>
        )}

        <form className="rp-form glass-card" onSubmit={handleSubmit}>
          {/* Workout tabs */}
          <div className="rp-workout-tabs">
            {[
              { id: 'workout1', label: 'WORKOUT 1', sub: 'Strength' },
              { id: 'workout2', label: 'WORKOUT 2', sub: 'WOD' },
            ].map(t => (
              <button
                type="button"
                key={t.id}
                className={`rp-workout-tab ${workoutTab === t.id ? 'active' : ''}`}
                onClick={() => setWorkoutTab(t.id)}
              >
                <span className="rp-tab-main">{t.label}</span>
                <span className="rp-tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>

          {/* Name + Level row */}
          <div className="rp-meta-row">
            <div className="rp-meta-item">
              <span className="rp-meta-label">이름</span>
              <span className="rp-meta-value">{displayName}</span>
            </div>
            <div className="rp-meta-item">
              <span className="rp-meta-label">레벨</span>
              <span
                className="rp-level-badge"
                style={{ color: ls.color, background: ls.bg, border: `1px solid ${ls.border}` }}
              >
                {myLevel}
              </span>
            </div>
          </div>

          {/* Record type grid */}
          <div className="rp-type-grid">
            {RECORD_TYPES.map(rt => (
              <button
                key={rt.id}
                type="button"
                className={`rp-type-btn ${recordType === rt.id ? 'active' : ''}`}
                onClick={() => setRecordType(rt.id)}
              >
                <span className="rp-type-label">{rt.label}</span>
                {rt.ex && <span className="rp-type-ex">{rt.ex}</span>}
              </button>
            ))}
          </div>

          {/* Dynamic input */}
          <div className="rp-input-area">
            {recordType === 'for_time' && (
              <div className="rp-time-row">
                <input
                  type="number" min="0" max="99" placeholder="분"
                  value={timeMin} onChange={e => setTimeMin(e.target.value)}
                  className="rp-time-input" required
                />
                <span className="rp-colon">:</span>
                <input
                  type="number" min="0" max="59" placeholder="초"
                  value={timeSec} onChange={e => setTimeSec(e.target.value)}
                  className="rp-time-input" required
                />
              </div>
            )}
            {recordType === 'amrap' && (
              <input
                type="text" placeholder="예) 137 REPS 또는 5R + 37"
                value={amrapVal} onChange={e => setAmrapVal(e.target.value)}
                className="rp-text-input" required
              />
            )}
            {recordType === 'fail_done' && (
              <div className="rp-fd-row">
                <button type="button" className={`rp-fd-btn done ${failDone === 'DONE' ? 'active' : ''}`} onClick={() => setFailDone('DONE')}>DONE</button>
                <button type="button" className={`rp-fd-btn fail ${failDone === 'FAIL' ? 'active' : ''}`} onClick={() => setFailDone('FAIL')}>FAIL</button>
              </div>
            )}
            {recordType === 'weight' && (
              <div className="rp-weight-row">
                <input
                  type="number" min="0" step="0.5" placeholder="무게"
                  value={weightVal} onChange={e => setWeightVal(e.target.value)}
                  className="rp-weight-input" required
                />
                <span className="rp-unit">LB</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary rp-submit ${justSaved ? 'saved' : ''}`}
            disabled={submitting}
          >
            {justSaved ? '✓ 등록 완료!' : submitting ? '저장 중...' : <><Send size={15} /> 기록 등록</>}
          </button>
        </form>
      </section>

      {/* ══ LEADERBOARD ══ */}
      <section className="rp-section">
        <h2 className="rp-title">오늘의 리더보드</h2>

        {/* Level filter pills */}
        <div className="rp-level-pills">
          <button className={`rp-level-pill ${lbLevel === 'all' ? 'active' : ''}`} onClick={() => setLbLevel('all')}>전체</button>
          {LEVELS.map(l => {
            const s = LEVEL_STYLE[l];
            return (
              <button
                key={l}
                className={`rp-level-pill ${lbLevel === l ? 'active' : ''}`}
                style={lbLevel === l ? { color: s.color, background: s.bg, borderColor: s.border } : {}}
                onClick={() => setLbLevel(l)}
              >
                {l}
              </button>
            );
          })}
        </div>

        {/* Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>WORKOUT 1 (Strength)</h3>
            {w1Records.length === 0 ? (
              <div className="rp-empty glass-card">기록이 없습니다.</div>
            ) : (
              <div className="rp-lb-list">
                {w1Records.map((r, idx) => {
                  const s  = LEVEL_STYLE[r.member_level] || LEVEL_STYLE.Beginner;
                  const fbs = (recordFeedback || []).filter(f => f.record_id === r.id);
                  const isExp = expanded === r.id;
                  return (
                    <div key={r.id} className="rp-lb-card glass-card">
                      <div className="rp-lb-main">
                        <div className="rp-lb-rank">#{idx + 1}</div>
                        <div className="rp-lb-info">
                          <div className="rp-lb-name-row">
                            <span className="rp-lb-name">{r.member_name}</span>
                            <span className="rp-lb-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                              {r.member_level}
                            </span>
                          </div>
                          <span className="rp-lb-type">{r.record_type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="rp-lb-value">{r.record_value}</div>
                        <button className="rp-fb-trigger" onClick={() => setExpanded(isExp ? null : r.id)}>
                          <MessageSquare size={15} />
                          {fbs.length > 0 && <span className="rp-fb-count">{fbs.length}</span>}
                          {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {isExp && (
                        <div className="rp-fb-panel">
                          {fbs.length === 0 && !isAdmin && <p className="rp-fb-empty">코치 피드백이 없습니다.</p>}
                          {fbs.map(f => (
                            <div key={f.id} className="rp-fb-item">
                              <span className="rp-fb-author">{f.author}</span>
                              <span className="rp-fb-content">{f.content}</span>
                            </div>
                          ))}
                          {isAdmin && (
                            <div className="rp-fb-input-row">
                              <input
                                type="text" placeholder="코치 피드백 작성..."
                                value={fbText} onChange={e => setFbText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFeedback(r.id)}
                                className="rp-fb-input"
                              />
                              <button type="button" className="rp-fb-send" onClick={() => handleFeedback(r.id)}>전송</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>WORKOUT 2 (WOD)</h3>
            {w2Records.length === 0 ? (
              <div className="rp-empty glass-card">기록이 없습니다.</div>
            ) : (
              <div className="rp-lb-list">
                {w2Records.map((r, idx) => {
                  const s  = LEVEL_STYLE[r.member_level] || LEVEL_STYLE.Beginner;
                  const fbs = (recordFeedback || []).filter(f => f.record_id === r.id);
                  const isExp = expanded === r.id;
                  return (
                    <div key={r.id} className="rp-lb-card glass-card">
                      <div className="rp-lb-main">
                        <div className="rp-lb-rank">#{idx + 1}</div>
                        <div className="rp-lb-info">
                          <div className="rp-lb-name-row">
                            <span className="rp-lb-name">{r.member_name}</span>
                            <span className="rp-lb-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                              {r.member_level}
                            </span>
                          </div>
                          <span className="rp-lb-type">{r.record_type.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="rp-lb-value">{r.record_value}</div>
                        <button className="rp-fb-trigger" onClick={() => setExpanded(isExp ? null : r.id)}>
                          <MessageSquare size={15} />
                          {fbs.length > 0 && <span className="rp-fb-count">{fbs.length}</span>}
                          {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>

                      {isExp && (
                        <div className="rp-fb-panel">
                          {fbs.length === 0 && !isAdmin && <p className="rp-fb-empty">코치 피드백이 없습니다.</p>}
                          {fbs.map(f => (
                            <div key={f.id} className="rp-fb-item">
                              <span className="rp-fb-author">{f.author}</span>
                              <span className="rp-fb-content">{f.content}</span>
                            </div>
                          ))}
                          {isAdmin && (
                            <div className="rp-fb-input-row">
                              <input
                                type="text" placeholder="코치 피드백 작성..."
                                value={fbText} onChange={e => setFbText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFeedback(r.id)}
                                className="rp-fb-input"
                              />
                              <button type="button" className="rp-fb-send" onClick={() => handleFeedback(r.id)}>전송</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
