import { useState, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WodCard from '../components/WodCard';
import './RecordPage.css';

const LEVELS = ['Black', 'Red', 'Yellow', 'White', 'Rainbow', 'Beginner'];

const WOD_TYPE_MAP = {
  'For Time': 'for_time',
  'AMRAP':    'amrap',
  'EMOM':     'reps',
  'Tabata':   'reps',
};

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
  { id: 'reps',      label: 'REPS',         ex: '예) 154 REPS' },
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

export default function RecordPage({ workoutRecords, recordFeedback, addWorkoutRecord, deleteWorkoutRecord, addRecordFeedback, isAdmin, wods }) {
  const { displayName, profile } = useAuth();
  const myLevel = profile?.level || 'Beginner';
  const today = new Date().toISOString().split('T')[0];
  const todayWod = wods?.find(w => w.date === today) || wods?.[0];

  /* ── Form state ── */
  const [workoutTab, setWorkoutTab] = useState('workout2');
  const [recordType, setRecordType]  = useState('for_time');
  const [timeMin, setTimeMin]   = useState('');
  const [timeSec, setTimeSec]   = useState('');
  const [amrapRounds, setAmrapRounds] = useState('');
  const [amrapReps, setAmrapReps] = useState('');
  const [onlyReps, setOnlyReps]   = useState('');
  const [failDone, setFailDone] = useState('DONE');
  const [weightVal, setWeightVal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [justSaved, setJustSaved]   = useState(false);

  /* ── Auto record type detection ── */
  const [manualType, setManualType] = useState(false);

  useEffect(() => {
    setManualType(false);
    if (workoutTab === 'workout1') {
      setRecordType('weight');
    } else {
      setRecordType(todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time');
    }
  }, [workoutTab, todayWod?.type]);

  /* ── Leaderboard state ── */
  const [lbLevel, setLbLevel] = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const [fbText, setFbText]       = useState('');

  const getRecordValue = () => {
    if (recordType === 'for_time')  return `${timeMin || '0'}:${(timeSec || '0').padStart(2, '0')}`;
    if (recordType === 'amrap') {
      const rounds = parseInt(amrapRounds) || 0;
      const reps = parseInt(amrapReps) || 0;
      if (rounds === 0 && reps === 0) return '';
      if (reps > 0) return `${rounds}R + ${reps}`;
      return `${rounds}R`;
    }
    if (recordType === 'reps') {
      const reps = parseInt(onlyReps) || 0;
      if (reps === 0) return '';
      return `${reps} REPS`;
    }
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
    setTimeMin(''); setTimeSec(''); setAmrapRounds(''); setAmrapReps(''); setOnlyReps(''); setWeightVal('');
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleFeedback = async (recordId) => {
    if (!fbText.trim()) return;
    await addRecordFeedback(recordId, fbText.trim());
    setFbText('');
  };

  /* ── Leaderboard filtering ── */
  const todayRecords = (workoutRecords || []).filter(r => r.wod_date === today);
  const filtered = lbLevel === 'all' ? todayRecords : todayRecords.filter(r => r.member_level === lbLevel);
  
  const sorted = sortRecords(filtered);
  const userRecordsMap = {};
  sorted.forEach(r => {
    if (!userRecordsMap[r.member_name]) {
      userRecordsMap[r.member_name] = {
        member_name: r.member_name,
        member_level: r.member_level,
        workout1: null,
        workout2: null,
        feedbacks: []
      };
    }
    if (r.workout_type === 'workout1') userRecordsMap[r.member_name].workout1 = r;
    if (r.workout_type === 'workout2') userRecordsMap[r.member_name].workout2 = r;
    
    const fbs = (recordFeedback || []).filter(f => f.record_id === r.id);
    if (fbs.length > 0) {
      userRecordsMap[r.member_name].feedbacks.push(...fbs);
    }
  });

  const groupedRecords = [];
  const seenUsers = new Set();
  sorted.forEach(r => {
    if (!seenUsers.has(r.member_name)) {
      seenUsers.add(r.member_name);
      groupedRecords.push(userRecordsMap[r.member_name]);
    }
  });

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

          {/* Record type — auto-detected or manual */}
          {manualType ? (
            <div>
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
              <button type="button" className="rp-cancel-manual" onClick={() => {
                setManualType(false);
                if (workoutTab === 'workout1') setRecordType('weight');
                else setRecordType(todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time');
              }}>↩ 자동 감지로 되돌리기</button>
            </div>
          ) : (
            <div className="rp-auto-type-row">
              <div className="rp-auto-badge">
                <span className="rp-auto-icon">⚡</span>
                <div>
                  <span className="rp-auto-label">{RECORD_TYPES.find(r => r.id === recordType)?.label}</span>
                  <span className="rp-auto-source">
                    {workoutTab === 'workout1'
                      ? '스트렝스 — 무게 자동 선택'
                      : todayWod?.type
                        ? `WOD 타입: ${todayWod.type}`
                        : '기본값'}
                  </span>
                </div>
              </div>
              <button type="button" className="rp-override-btn" onClick={() => setManualType(true)}>
                직접 변경
              </button>
            </div>
          )}

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
              <div className="rp-time-row">
                <input
                  type="number" min="0" placeholder="라운드(R)"
                  value={amrapRounds} onChange={e => setAmrapRounds(e.target.value)}
                  className="rp-time-input" style={{ width: '100px' }}
                />
                <span className="rp-colon" style={{ fontSize: '1.2rem' }}>R +</span>
                <input
                  type="number" min="0" placeholder="랩스(Reps)"
                  value={amrapReps} onChange={e => setAmrapReps(e.target.value)}
                  className="rp-time-input" style={{ width: '100px' }}
                />
              </div>
            )}
            {recordType === 'reps' && (
              <div className="rp-weight-row">
                <input
                  type="number" min="0" placeholder="총 랩스"
                  value={onlyReps} onChange={e => setOnlyReps(e.target.value)}
                  className="rp-weight-input" style={{ width: '120px' }}
                />
                <span className="rp-unit">REPS</span>
              </div>
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
        {groupedRecords.length === 0 ? (
          <div className="rp-empty glass-card">아직 등록된 기록이 없습니다.</div>
        ) : (
          <div className="rp-lb-list">
            {groupedRecords.map((user, idx) => {
              const s = LEVEL_STYLE[user.member_level] || LEVEL_STYLE.Beginner;
              const fbs = user.feedbacks;
              const isExp = expanded === user.member_name;
              const primaryRecordId = user.workout2?.id || user.workout1?.id;

              return (
                <div key={user.member_name} className="rp-lb-card glass-card">
                  <div className="rp-lb-main">
                    <div className="rp-lb-rank">#{idx + 1}</div>
                    
                    <div className="rp-lb-info" style={{ minWidth: '100px' }}>
                      <div className="rp-lb-name-row">
                        <span className="rp-lb-name">{user.member_name}</span>
                        <span className="rp-lb-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                          {user.member_level}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, justifyContent: 'flex-end', marginRight: '0.5rem' }}>
                      {user.workout1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 1</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="rp-lb-value" style={{ color: '#ededed' }}>{user.workout1.record_value}</span>
                            {(isAdmin || user.member_name === displayName) && (
                              <button onClick={() => deleteWorkoutRecord(user.workout1.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {user.workout2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 2</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="rp-lb-value">{user.workout2.record_value}</span>
                            {(isAdmin || user.member_name === displayName) && (
                              <button onClick={() => deleteWorkoutRecord(user.workout2.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="rp-fb-trigger" onClick={() => setExpanded(isExp ? null : user.member_name)}>
                      <MessageSquare size={15} />
                      {fbs.length > 0 && <span className="rp-fb-count">{fbs.length}</span>}
                      {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>

                  {isExp && (
                    <div className="rp-fb-panel">
                      {fbs.length === 0 && !isAdmin && <p className="rp-fb-empty">코치 피드백이 없습니다.</p>}
                      {fbs.map((f, i) => (
                        <div key={f.id || i} className="rp-fb-item">
                          <span className="rp-fb-author">{f.author}</span>
                          <span className="rp-fb-content">{f.content}</span>
                        </div>
                      ))}
                      {isAdmin && primaryRecordId && (
                        <div className="rp-fb-input-row">
                          <input
                            type="text" placeholder="코치 피드백 작성..."
                            value={fbText} onChange={e => setFbText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFeedback(primaryRecordId)}
                            className="rp-fb-input"
                          />
                          <button type="button" className="rp-fb-send" onClick={() => handleFeedback(primaryRecordId)}>전송</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
