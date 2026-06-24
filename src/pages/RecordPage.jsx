import { useState, useEffect, useRef } from 'react';
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
  { id: 'for_time', label: 'FOR TIME', ex: '예) 10:37' },
  { id: 'amrap',    label: 'AMRAP',    ex: '예) 5R + 37' },
  { id: 'reps',     label: 'REPS',     ex: '예) 154 REPS' },
  { id: 'weight',   label: 'WEIGHT',   ex: '예) 105 LB' },
];

const parseSeconds = (v) => {
  const m = v?.match(/^(\d+):(\d+)/);
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

export default function RecordPage({ workoutRecords, recordFeedback, addWorkoutRecord, deleteWorkoutRecord, addRecordFeedback, isAdmin, wods, memberLevel, levelMap }) {
  const { displayName } = useAuth();
  const myLevel = memberLevel || 'Beginner';
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const todayWod = wods?.find(w => w.date === today) || wods?.[0];

  /* ── Form state ── */
  const [workoutTab, setWorkoutTab] = useState('workout2');
  const [recordType, setRecordType]  = useState('for_time');
  const [timeMin, setTimeMin]        = useState('');
  const [timeSec, setTimeSec]        = useState('');
  const [amrapRounds, setAmrapRounds] = useState('');
  const [amrapReps, setAmrapReps]     = useState('');
  const [onlyReps, setOnlyReps]       = useState('');
  const [weightVal, setWeightVal]     = useState('');
  const [doneFailStatus, setDoneFailStatus] = useState(null); // null | 'D' | 'F'
  const [extraWeightVal, setExtraWeightVal] = useState('');   // extra weight annotation
  const [manualType, setManualType]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [justSaved, setJustSaved]     = useState(false);

  /* ── Auto record type detection ── */
  const autoType = workoutTab === 'workout1'
    ? 'weight'
    : (todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time');

  useEffect(() => {
    setManualType(false);
    setRecordType(workoutTab === 'workout1' ? 'weight' : (todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time'));
  }, [workoutTab, todayWod?.type]);

  /* ── Leaderboard state ── */
  const [lbLevel, setLbLevel] = useState('all');
  const [expanded, setExpanded]       = useState(null);
  const [fbText, setFbText]           = useState('');
  const [showLevelDrop, setShowLevelDrop] = useState(false);

  /* ── Date history ── */
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(today);
  const todayDateRef = useRef(null);
  useEffect(() => {
    todayDateRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
  }, []);

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
  const historyDates = Array.from({ length: 380 }, (_, i) => {
    const offset = i - 365;
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return {
      dateStr,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      isToday: offset === 0,
      isSunday: d.getDay() === 0,
      isMonthStart: d.getDate() === 1,
    };
  });

  /* ── Build record value: "12:42 (F, 75LB)" ── */
  const getPrimaryValue = () => {
    if (recordType === 'for_time') {
      const m = timeMin || '0';
      const s = (timeSec || '0').padStart(2, '0');
      if (m === '0' && s === '00') return '';
      return `${m}:${s}`;
    }
    if (recordType === 'amrap') {
      const r = parseInt(amrapRounds) || 0;
      const rp = parseInt(amrapReps) || 0;
      if (r === 0 && rp === 0) return '';
      return rp > 0 ? `${r}R + ${rp}` : `${r}R`;
    }
    if (recordType === 'reps') {
      const rp = parseInt(onlyReps) || 0;
      return rp ? `${rp} REPS` : '';
    }
    if (recordType === 'weight') {
      return weightVal ? `${weightVal} LB` : '';
    }
    return '';
  };

  const getRecordValue = () => {
    const primary = getPrimaryValue();
    if (!primary) return '';
    const extras = [];
    if (doneFailStatus) extras.push(doneFailStatus);
    if (extraWeightVal && recordType !== 'weight') extras.push(`${extraWeightVal}LB`);
    return extras.length ? `${primary} (${extras.join(', ')})` : primary;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = getRecordValue();
    if (!value) return;
    setSubmitting(true);
    await addWorkoutRecord({
      member_name:  displayName,
      member_level: myLevel,
      workout_type: workoutTab,
      wod_date:     today,
      record_type:  recordType,
      record_value: value,
    });
    setSubmitting(false);
    setJustSaved(true);
    setTimeMin(''); setTimeSec(''); setAmrapRounds(''); setAmrapReps('');
    setOnlyReps(''); setWeightVal(''); setDoneFailStatus(null); setExtraWeightVal('');
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleFeedback = async (recordId) => {
    if (!fbText.trim()) return;
    await addRecordFeedback(recordId, fbText.trim());
    setFbText('');
  };

  /* record_value를 그대로 표시 (구형 fail_done 타입 호환) */
  const abbrev = (r) => {
    if (!r) return '';
    if (r.record_type === 'fail_done') return r.record_value === 'DONE' ? 'D' : 'F';
    return r.record_value;
  };

  /* ── Leaderboard grouping ── */
  const todayRecords = (workoutRecords || []).filter(r => r.wod_date === today);
  const filtered = lbLevel === 'all'
    ? todayRecords
    : todayRecords.filter(r => {
        const lvl = (levelMap && levelMap[r.member_name]) || r.member_level || 'Beginner';
        return lvl === lbLevel;
      });
  const sorted = sortRecords(filtered);

  const userRecordsMap = {};
  sorted.forEach(r => {
    if (!userRecordsMap[r.member_name]) {
      userRecordsMap[r.member_name] = { member_name: r.member_name, member_level: r.member_level, workout1Records: [], workout2Records: [], feedbacks: [] };
    }
    if (r.workout_type === 'workout1') userRecordsMap[r.member_name].workout1Records.push(r);
    if (r.workout_type === 'workout2') userRecordsMap[r.member_name].workout2Records.push(r);
    (recordFeedback || []).filter(f => f.record_id === r.id).forEach(f => userRecordsMap[r.member_name].feedbacks.push(f));
  });

  const groupedRecords = [];
  const seenUsers = new Set();
  sorted.forEach(r => {
    if (!seenUsers.has(r.member_name)) { seenUsers.add(r.member_name); groupedRecords.push(userRecordsMap[r.member_name]); }
  });

  const currentTypeMeta = RECORD_TYPES.find(r => r.id === recordType);

  /* ── Date history ── */
  const historyWod = wods?.find(w => w.date === selectedHistoryDate);
  const historyRecords = (workoutRecords || []).filter(r => r.wod_date === selectedHistoryDate);
  const historyUserMap = {};
  historyRecords.forEach(r => {
    if (!historyUserMap[r.member_name]) historyUserMap[r.member_name] = { name: r.member_name, level: r.member_level, w1: [], w2: [] };
    if (r.workout_type === 'workout1') historyUserMap[r.member_name].w1.push(r);
    else historyUserMap[r.member_name].w2.push(r);
  });
  const historyUsers = Object.values(historyUserMap);
  const wodDates = new Set((wods || []).map(w => w.date));
  const recordDates = new Set((workoutRecords || []).map(r => r.wod_date));

  return (
    <div className="record-page fade-in">

      {/* ══ RECORD UPLOAD ══ */}
      <section className="rp-section rp-wod-col">

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
              <button type="button" key={t.id} className={`rp-workout-tab ${workoutTab === t.id ? 'active' : ''}`} onClick={() => setWorkoutTab(t.id)}>
                <span className="rp-tab-main">{t.label}</span>
                <span className="rp-tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>

          {/* ── 타입 선택 모드 (설정값 변경 클릭 시) ── */}
          {manualType ? (
            <div>
              <div className="rp-type-grid">
                {RECORD_TYPES.map(rt => (
                  <button key={rt.id} type="button" className={`rp-type-btn ${recordType === rt.id ? 'active' : ''}`}
                    onClick={() => { setRecordType(rt.id); setManualType(false); }}>
                    <span className="rp-type-label">{rt.label}</span>
                    {rt.ex && <span className="rp-type-ex">{rt.ex}</span>}
                  </button>
                ))}
              </div>
              <button type="button" className="rp-cancel-manual" onClick={() => { setManualType(false); setRecordType(autoType); }}>
                ↩ 자동 감지로 되돌리기
              </button>
            </div>
          ) : (
            <>
              {/* 설정값 변경 — 최상단 */}
              <div className="rp-settings-bar">
                <button type="button" className="rp-override-btn" onClick={() => setManualType(true)}>설정값 변경</button>
              </div>

              {/* 타입 배지 + 기본 입력 — 같은 행 */}
              <div className="rp-primary-row">
                <div className="rp-auto-badge">
                  <span className="rp-auto-icon">⚡</span>
                  <div>
                    <span className="rp-auto-label">{currentTypeMeta?.label}</span>
                    <span className="rp-auto-source">
                      {workoutTab === 'workout1' ? '스트렝스 — 무게' : todayWod?.type ? `WOD 타입: ${todayWod.type}` : '기본값'}
                    </span>
                  </div>
                </div>

                <div className="rp-primary-input-slot">
                  {recordType === 'for_time' && (
                    <div className="rp-time-row">
                      <input type="number" min="0" max="99" placeholder="분" value={timeMin} onChange={e => setTimeMin(e.target.value)} className="rp-time-input" />
                      <span className="rp-colon">:</span>
                      <input type="number" min="0" max="59" placeholder="초" value={timeSec} onChange={e => setTimeSec(e.target.value)} className="rp-time-input" />
                    </div>
                  )}
                  {recordType === 'amrap' && (
                    <div className="rp-time-row">
                      <input type="number" min="0" placeholder="R" value={amrapRounds} onChange={e => setAmrapRounds(e.target.value)} className="rp-time-input" style={{ width: '58px' }} />
                      <span className="rp-colon" style={{ fontSize: '0.95rem' }}>R +</span>
                      <input type="number" min="0" placeholder="reps" value={amrapReps} onChange={e => setAmrapReps(e.target.value)} className="rp-time-input" style={{ width: '58px' }} />
                    </div>
                  )}
                  {recordType === 'reps' && (
                    <div className="rp-time-row">
                      <input type="number" min="0" placeholder="랩스" value={onlyReps} onChange={e => setOnlyReps(e.target.value)} className="rp-time-input" style={{ width: '80px' }} />
                      <span className="rp-unit">REPS</span>
                    </div>
                  )}
                  {recordType === 'weight' && (
                    <div className="rp-time-row">
                      <input type="number" min="0" step="0.5" placeholder="무게" value={weightVal} onChange={e => setWeightVal(e.target.value)} className="rp-time-input" style={{ width: '80px' }} />
                      <span className="rp-unit">LB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DONE / FAIL 선택 (선택사항 — 다시 클릭하면 해제) */}
              <div className="rp-df-btns">
                <button type="button" className={`rp-df-btn done ${doneFailStatus === 'D' ? 'active' : ''}`}
                  onClick={() => setDoneFailStatus(s => s === 'D' ? null : 'D')}>DONE</button>
                <button type="button" className={`rp-df-btn fail ${doneFailStatus === 'F' ? 'active' : ''}`}
                  onClick={() => setDoneFailStatus(s => s === 'F' ? null : 'F')}>FAIL</button>
              </div>

              {/* 추가 무게 (선택사항, weight 기본타입 아닐 때) */}
              {recordType !== 'weight' && (
                <div className="rp-center-weight">
                  <span className="rp-weight-label">무게</span>
                  <input type="number" min="0" step="0.5" placeholder="0" value={extraWeightVal}
                    onChange={e => setExtraWeightVal(e.target.value)} className="rp-time-input" style={{ width: '90px' }} />
                  <span className="rp-unit">LB</span>
                </div>
              )}
            </>
          )}

          <button type="submit" className={`btn btn-primary rp-submit ${justSaved ? 'saved' : ''}`} disabled={submitting}>
            {justSaved ? '✓ 등록 완료!' : submitting ? '저장 중...' : <><Send size={15} /> 기록 등록</>}
          </button>
        </form>

      </section>

      {/* ══ LEADERBOARD ══ */}
      <section className="rp-section rp-lb-col">
        <div className="rp-lb-header">
          <h2 className="rp-title" style={{ margin: 0 }}>오늘의 리더보드</h2>
          <div className="rp-level-dropdown">
            <button
              className="rp-level-drop-btn"
              onClick={() => setShowLevelDrop(s => !s)}
            >
              <span style={lbLevel !== 'all' ? { color: LEVEL_STYLE[lbLevel]?.color } : {}}>
                {lbLevel === 'all' ? '전체' : lbLevel}
              </span>
              <ChevronDown size={13} style={{ transition: '0.2s', transform: showLevelDrop ? 'rotate(180deg)' : 'none' }} />
            </button>
            {showLevelDrop && (
              <div className="rp-level-drop-menu">
                <button className={`rp-level-drop-item ${lbLevel === 'all' ? 'active' : ''}`}
                  onClick={() => { setLbLevel('all'); setShowLevelDrop(false); }}>전체</button>
                {LEVELS.map(l => (
                  <button key={l}
                    className={`rp-level-drop-item ${lbLevel === l ? 'active' : ''}`}
                    style={{ color: LEVEL_STYLE[l]?.color }}
                    onClick={() => { setLbLevel(l); setShowLevelDrop(false); }}>{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {groupedRecords.length === 0 ? (
          <div className="rp-empty glass-card">아직 등록된 기록이 없습니다.</div>
        ) : (
          <div className="rp-lb-list">
            {groupedRecords.map((user) => {
              const currentLevel = (levelMap && levelMap[user.member_name]) || user.member_level || 'Beginner';
              const s = LEVEL_STYLE[currentLevel] || LEVEL_STYLE.Beginner;
              const fbs = user.feedbacks;
              const isExp = expanded === user.member_name;
              const primaryRecordId = user.workout2Records[0]?.id || user.workout1Records[0]?.id;
              const canEdit = isAdmin || user.member_name === displayName;

              return (
                <div key={user.member_name} className="rp-lb-card glass-card">
                  <div className="rp-lb-main">
                    <div className="rp-lb-info">
                      <span className="rp-lb-name">{user.member_name}</span>
                      <span className="rp-lb-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{currentLevel}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, justifyContent: 'flex-end', marginRight: '0.5rem' }}>
                      {user.workout1Records.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 1</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span className="rp-lb-value" style={{ color: '#ededed' }}>
                              {user.workout1Records.map(r => abbrev(r)).join(', ')}
                            </span>
                            {canEdit && user.workout1Records.map(r => (
                              <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제"><Trash2 size={12} /></button>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.workout2Records.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 2</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span className="rp-lb-value">
                              {user.workout2Records.map(r => abbrev(r)).join(', ')}
                            </span>
                            {canEdit && user.workout2Records.map(r => (
                              <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제"><Trash2 size={12} /></button>
                            ))}
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
                          <input type="text" placeholder="코치 피드백 작성..." value={fbText} onChange={e => setFbText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFeedback(primaryRecordId)} className="rp-fb-input" />
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

      {/* ══ DATE HISTORY ══ */}
      <div className="rp-dh-wrapper">
        <h2 className="rp-title" style={{ marginBottom: '1rem' }}>날짜별 기록</h2>

        {/* Date strip */}
        <div className="rp-dh-strip">
          {historyDates.map((d, i) => (
            <div key={d.dateStr} className="rp-dh-strip-item">
              {(d.isMonthStart || i === 0) && (
                <div className="rp-dh-month-label">{d.year}.{String(d.month).padStart(2,'0')}</div>
              )}
              <button
                ref={d.isToday ? todayDateRef : null}
                className={`rp-dh-date-btn ${selectedHistoryDate === d.dateStr ? 'active' : ''} ${d.isToday ? 'today' : ''} ${d.isSunday ? 'sunday' : ''}`}
                onClick={() => setSelectedHistoryDate(d.dateStr)}
              >
                <span className="rp-dh-day">{d.dayName}</span>
                <span className="rp-dh-num">{d.dayNum}</span>
                <span className="rp-dh-dots">
                  {wodDates.has(d.dateStr) && <span className="rp-dh-dot wod" />}
                  {recordDates.has(d.dateStr) && <span className="rp-dh-dot rec" />}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Selected date content */}
        <div className="rp-dh-content">
          {/* WOD */}
          {historyWod ? (
            <div className="rp-dh-wod glass-card">
              <div className="rp-dh-wod-label">WORKOUT ({selectedHistoryDate})</div>
              {historyWod.workout1Title && (
                <div className="rp-dh-wod-block">
                  <span className="rp-dh-wod-num">01</span>
                  <span className="rp-dh-wod-sub">Strength &amp; Accessory</span>
                  <span className="rp-dh-wod-title">{historyWod.workout1Title}</span>
                  {historyWod.workout1Description && <pre className="rp-dh-wod-pre">{historyWod.workout1Description}</pre>}
                </div>
              )}
              <div className="rp-dh-wod-block">
                <span className="rp-dh-wod-num accent">02</span>
                <span className="rp-dh-wod-sub accent">WOD</span>
                <span className="rp-dh-wod-title">{historyWod.title}</span>
                <div className="rp-dh-wod-meta">
                  <span className="rp-dh-wod-type">{historyWod.type}</span>
                  {historyWod.timeLimit && <span className="rp-dh-wod-cap">⏱ {historyWod.timeLimit}</span>}
                </div>
                {historyWod.rxd && <pre className="rp-dh-wod-pre">{historyWod.rxd}</pre>}
              </div>
            </div>
          ) : (
            <div className="rp-empty glass-card" style={{ marginBottom: '1rem' }}>
              {selectedHistoryDate === today ? '오늘 WOD가 등록되지 않았습니다.' : `${selectedHistoryDate} WOD 없음`}
            </div>
          )}

          {/* Records */}
          {historyUsers.length > 0 ? (
            <div className="rp-dh-records">
              {historyUsers.map(u => {
                const lvl = (levelMap && levelMap[u.name]) || u.level || 'Beginner';
                const s = LEVEL_STYLE[lvl] || LEVEL_STYLE.Beginner;
                const myRecord = u.name === displayName;
                return (
                  <div key={u.name} className={`rp-dh-rec-card glass-card ${myRecord ? 'mine' : ''}`}>
                    <div className="rp-dh-rec-who">
                      <span className="rp-dh-rec-name">{u.name}</span>
                      <span className="rp-dh-rec-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{lvl}</span>
                    </div>
                    <div className="rp-dh-rec-vals">
                      {u.w1.length > 0 && (
                        <div className="rp-dh-rec-group">
                          <span className="rp-dh-rec-lbl">01</span>
                          <span className="rp-dh-rec-val">{u.w1.map(r => abbrev(r)).join(', ')}</span>
                          {(isAdmin || myRecord) && u.w1.map(r => (
                            <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>
                          ))}
                        </div>
                      )}
                      {u.w2.length > 0 && (
                        <div className="rp-dh-rec-group">
                          <span className="rp-dh-rec-lbl">02</span>
                          <span className="rp-dh-rec-val accent">{u.w2.map(r => abbrev(r)).join(', ')}</span>
                          {(isAdmin || myRecord) && u.w2.map(r => (
                            <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rp-empty glass-card">이 날짜에 등록된 기록이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}
