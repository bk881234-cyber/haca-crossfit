import { useState, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WodCard from '../components/WodCard';
import { detectClassType, CLASS_TYPE_LABEL, CLASS_TYPE_COLOR } from '../utils/classSchedule';
import './RecordPage.css';

const LEVELS = ["Rx'd", 'Advanced', 'Scaled', 'Beginner'];

const LEGACY_LEVEL = { Black: "Rx'd", Red: 'Advanced', Yellow: 'Scaled', White: 'Scaled', Rainbow: 'Beginner' };
const normalizeLevel = (lvl) => LEGACY_LEVEL[lvl] || lvl || 'Beginner';

const WOD_TYPE_MAP = {
  'For Time': 'for_time',
  'AMRAP':    'amrap',
  'EMOM':     'reps',
  'Tabata':   'reps',
};

const LEVEL_STYLE = {
  "Rx'd":    { color: '#00e5ff', bg: 'rgba(0,229,255,0.10)',   border: '#00e5ff' },
  Advanced:  { color: '#ff4444', bg: 'rgba(255,68,68,0.10)',   border: '#ff4444' },
  Scaled:    { color: '#ffc800', bg: 'rgba(255,200,0,0.10)',   border: '#ffc800' },
  Beginner:  { color: '#9999ff', bg: 'rgba(150,150,255,0.10)', border: '#9999ff' },
  // 구 레벨 → 가장 가까운 새 레벨 스타일로 fallback
  Black:    { color: '#00e5ff', bg: 'rgba(0,229,255,0.10)',   border: '#00e5ff' },
  Red:      { color: '#ff4444', bg: 'rgba(255,68,68,0.10)',   border: '#ff4444' },
  Yellow:   { color: '#ffc800', bg: 'rgba(255,200,0,0.10)',   border: '#ffc800' },
  White:    { color: '#ffc800', bg: 'rgba(255,200,0,0.10)',   border: '#ffc800' },
  Rainbow:  { color: '#9999ff', bg: 'rgba(150,150,255,0.10)', border: '#9999ff' },
};

const RECORD_TYPES = [
  { id: 'for_time', label: 'FOR TIME', ex: '예) 10:37' },
  { id: 'amrap',    label: 'AMRAP',    ex: '예) 5R + 37' },
  { id: 'reps',     label: 'REPS',     ex: '예) 154 REPS' },
  { id: 'weight',   label: 'WEIGHT',   ex: '예) 105 LB' },
];

const parseSeconds = (v) => { const m = v?.match(/^(\d+):(\d+)/); return m ? parseInt(m[1])*60+parseInt(m[2]) : Infinity; };
const parseAmrap   = (v) => { const r = v?.match(/(\d+)\s*R\s*\+\s*(\d+)/i); if (r) return parseInt(r[1])*10000+parseInt(r[2]); return parseFloat(v)||0; };



const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const localYesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

export default function RecordPage({ workoutRecords, recordFeedback, addWorkoutRecord, deleteWorkoutRecord, addRecordFeedback, isAdmin, wods, memberLevel, levelMap }) {
  const { displayName } = useAuth();
  const myLevel = memberLevel || 'Beginner';
  const today     = localToday();
  const yesterday = localYesterday();
  /* ── 실시간 클래스 타입 감지 (1분 주기) ── */
  const [activeClassType, setActiveClassType] = useState(() => detectClassType() || 'crossfit');
  useEffect(() => {
    const tick = () => {
      const t = detectClassType();
      if (t) setActiveClassType(t);
    };
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const todayWods   = wods?.filter(w => w.date === today) || [];
  const todayWod    = todayWods.find(w => w.classType === activeClassType) ?? todayWods[0];
  const hasWorkout1 = !!todayWod?.workout1Title;

  /* ── Form ── */
  const [workoutTab,      setWorkoutTab]      = useState('workout2');
  const [recordType,      setRecordType]      = useState('for_time');
  const [timeMin,         setTimeMin]         = useState('');
  const [timeSec,         setTimeSec]         = useState('');
  const [amrapRounds,     setAmrapRounds]     = useState('');
  const [amrapReps,       setAmrapReps]       = useState('');
  const [onlyReps,        setOnlyReps]        = useState('');
  const [weightVal,       setWeightVal]       = useState('');
  const [doneFailStatus,  setDoneFailStatus]  = useState(null);
  const [extraWeightVal,  setExtraWeightVal]  = useState('');
  const [manualType,      setManualType]      = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [justSaved,       setJustSaved]       = useState(false);

  const autoType = workoutTab === 'workout1'
    ? 'weight'
    : (todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time');

  useEffect(() => {
    if (!hasWorkout1) setWorkoutTab('workout2');
  }, [hasWorkout1]);

  useEffect(() => {
    setManualType(false);
    setRecordType(workoutTab === 'workout1' ? 'weight' : (todayWod?.type ? (WOD_TYPE_MAP[todayWod.type] ?? 'for_time') : 'for_time'));
  }, [workoutTab, todayWod?.type]);

  /* ── Leaderboard ── */
  const [expanded,       setExpanded]       = useState(null);
  const [fbText,         setFbText]         = useState('');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [expandedFs,     setExpandedFs]     = useState(null);
  const [fbTextFs,       setFbTextFs]       = useState('');

  /* ── Date history calendar ── */
  const [selectedDate, setSelectedDate] = useState(yesterday);
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

  const calDays = (() => {
    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev  = new Date(calYear, calMonth, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++)  cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0)          cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });
    return cells;
  })();

  const moveMonth = (dir) => {
    let m = calMonth + dir, y = calYear;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setCalMonth(m); setCalYear(y);
  };

  const toDateStr = (y, m, d) =>
    `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  /* ── Record value builder ── */
  const getPrimaryValue = () => {
    if (recordType === 'for_time') {
      const m = timeMin || '0';
      const s = (timeSec || '0').padStart(2, '0');
      if (m === '0' && s === '00') return '';
      return `${m}:${s}`;
    }
    if (recordType === 'amrap') {
      const r = parseInt(amrapRounds) || 0, rp = parseInt(amrapReps) || 0;
      if (r === 0 && rp === 0) return '';
      return rp > 0 ? `${r}R + ${rp}` : `${r}R`;
    }
    if (recordType === 'reps')   { const rp = parseInt(onlyReps)||0; return rp ? `${rp} REPS` : ''; }
    if (recordType === 'weight') { return weightVal ? `${weightVal} LB` : ''; }
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
    await addWorkoutRecord({ member_name: displayName, member_level: myLevel, workout_type: workoutTab, wod_date: today, record_type: recordType, record_value: value, class_type: activeClassType });
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

  const abbrev = (r) => {
    if (!r) return '';
    if (r.record_type === 'fail_done') return r.record_value === 'DONE' ? 'D' : 'F';
    return r.record_value;
  };

  /* ── Leaderboard grouping ── */
  const todayRecords = (workoutRecords || []).filter(r =>
    r.wod_date === today && (r.class_type === activeClassType || !r.class_type)
  );

  const userRecordsMap = {};
  todayRecords.forEach(r => {
    if (!userRecordsMap[r.member_name])
      userRecordsMap[r.member_name] = { member_name: r.member_name, member_level: r.member_level, workout1Records: [], workout2Records: [], feedbacks: [] };
    if (r.workout_type === 'workout1') userRecordsMap[r.member_name].workout1Records.push(r);
    if (r.workout_type === 'workout2') userRecordsMap[r.member_name].workout2Records.push(r);
    (recordFeedback || []).filter(f => f.record_id === r.id).forEach(f => userRecordsMap[r.member_name].feedbacks.push(f));
  });

  // 워크아웃 2 기준 성적순 정렬 (AMRAP: 라운드 많은 순 / For Time: 시간 짧은 순)
  const wodType = todayWod?.type;
  const groupedRecords = Object.values(userRecordsMap).sort((a, b) => {
    const ar = a.workout2Records[0];
    const br = b.workout2Records[0];
    if (!ar && !br) return 0;
    if (!ar) return 1;
    if (!br) return -1;
    if (wodType === 'AMRAP')    return parseAmrap(br.record_value)   - parseAmrap(ar.record_value);
    if (wodType === 'For Time') return parseSeconds(ar.record_value) - parseSeconds(br.record_value);
    return 0;
  });

  const currentTypeMeta = RECORD_TYPES.find(r => r.id === recordType);

  /* ── 전체보기: 레벨별 그룹핑 ── */
  const recordsByLevel = {};
  LEVELS.forEach(l => { recordsByLevel[l] = []; });
  groupedRecords.forEach(u => {
    const lvl = normalizeLevel((levelMap && levelMap[u.member_name]) || u.member_level);
    (recordsByLevel[lvl] || recordsByLevel['Beginner']).push(u);
  });

  const handleFeedbackFs = async (recordId) => {
    if (!fbTextFs.trim()) return;
    await addRecordFeedback(recordId, fbTextFs.trim());
    setFbTextFs('');
  };

  /* ── Date history data ── */
  const historyWod = wods?.find(w => w.date === selectedDate);
  const historyRecords = (workoutRecords || []).filter(r => r.wod_date === selectedDate);
  const historyUserMap = {};
  historyRecords.forEach(r => {
    if (!historyUserMap[r.member_name]) historyUserMap[r.member_name] = { name: r.member_name, level: r.member_level, w1: [], w2: [] };
    if (r.workout_type === 'workout1') historyUserMap[r.member_name].w1.push(r);
    else historyUserMap[r.member_name].w2.push(r);
  });
  const historyUsers = Object.values(historyUserMap);
  const wodDates    = new Set((wods || []).map(w => w.date));
  const recordDates = new Set((workoutRecords || []).map(r => r.wod_date));

  return (
    <>
    <div className="record-page fade-in">

      {/* ══ WOD + 기록 폼 ══ */}
      <div className="rp-wod-top">
        {/* 클래스 타입 선택 뱃지 */}
        <div className="rp-class-type-bar">
          {['crossfit', 'hyrox'].map(ct => (
            <button
              key={ct}
              className={`rp-ct-btn ${activeClassType === ct ? 'active' : ''}`}
              style={activeClassType === ct ? { borderColor: CLASS_TYPE_COLOR[ct], color: CLASS_TYPE_COLOR[ct], background: `${CLASS_TYPE_COLOR[ct]}18` } : {}}
              onClick={() => setActiveClassType(ct)}
            >
              {CLASS_TYPE_LABEL[ct]}
            </button>
          ))}
          <span className="rp-ct-auto">⏱ 시간대 자동감지</span>
        </div>

        {todayWod
          ? <WodCard wod={todayWod} large={true} />
          : <div className="rp-empty glass-card">오늘 {CLASS_TYPE_LABEL[activeClassType]} WOD가 없습니다.</div>
        }

        <form className="rp-form glass-card" onSubmit={handleSubmit}>
          <div className="rp-workout-tabs">
            {[{ id: 'workout1', label: 'WORKOUT 1', sub: 'Strength' }, { id: 'workout2', label: 'WORKOUT 2', sub: 'WOD' }].map(t => {
              const disabled = t.id === 'workout1' && !hasWorkout1;
              return (
                <button
                  type="button"
                  key={t.id}
                  disabled={disabled}
                  className={`rp-workout-tab ${workoutTab === t.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && setWorkoutTab(t.id)}
                >
                  <span className="rp-tab-main">{t.label}</span>
                  <span className="rp-tab-sub">{disabled ? '없음' : t.sub}</span>
                </button>
              );
            })}
          </div>

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
              <button type="button" className="rp-cancel-manual" onClick={() => { setManualType(false); setRecordType(autoType); }}>↩ 자동 감지로 되돌리기</button>
            </div>
          ) : (
            <>
              <div className="rp-settings-bar">
                <button type="button" className="rp-override-btn" onClick={() => setManualType(true)}>설정값 변경</button>
              </div>
              <div className="rp-primary-row">
                <div className="rp-auto-badge">
                  <span className="rp-auto-icon">⚡</span>
                  <div>
                    <span className="rp-auto-label">{currentTypeMeta?.label}</span>
                    <span className="rp-auto-source">{workoutTab === 'workout1' ? '스트렝스 — 무게' : todayWod?.type ? `WOD 타입: ${todayWod.type}` : '기본값'}</span>
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
              <div className="rp-df-btns">
                <button type="button" className={`rp-df-btn done ${doneFailStatus === 'D' ? 'active' : ''}`} onClick={() => setDoneFailStatus(s => s === 'D' ? null : 'D')}>DONE</button>
                <button type="button" className={`rp-df-btn fail ${doneFailStatus === 'F' ? 'active' : ''}`} onClick={() => setDoneFailStatus(s => s === 'F' ? null : 'F')}>FAIL</button>
              </div>
              {recordType !== 'weight' && (
                <div className="rp-center-weight">
                  <span className="rp-weight-label">무게</span>
                  <input type="number" min="0" step="0.5" placeholder="0" value={extraWeightVal} onChange={e => setExtraWeightVal(e.target.value)} className="rp-time-input" style={{ width: '90px' }} />
                  <span className="rp-unit">LB</span>
                </div>
              )}
            </>
          )}

          <button type="submit" className={`btn btn-primary rp-submit ${justSaved ? 'saved' : ''}`} disabled={submitting}>
            {justSaved ? '✓ 등록 완료!' : submitting ? '저장 중...' : <><Send size={15} /> 기록 등록</>}
          </button>
        </form>
      </div>

      {/* ══ RIGHT: Leaderboard (모바일: WOD 다음, 날짜별 기록 위) ══ */}
      <section className="rp-lb-col">
        <div className="rp-lb-header">
          <h2 className="rp-title">
            오늘의 리더보드
            <span className="rp-lb-ct-badge" style={{ color: CLASS_TYPE_COLOR[activeClassType] }}>
              {CLASS_TYPE_LABEL[activeClassType]}
            </span>
          </h2>
          <button className="rp-fullscreen-btn" onClick={() => setShowFullscreen(true)}>전체보기</button>
        </div>

        {groupedRecords.length === 0 ? (
          <div className="rp-empty glass-card">아직 등록된 기록이 없습니다.</div>
        ) : (
          <div className="rp-lb-list">
            {groupedRecords.map((user) => {
              const currentLevel = normalizeLevel((levelMap && levelMap[user.member_name]) || user.member_level);
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: 1, justifyContent: 'flex-end', marginRight: '0.5rem', minWidth: 0 }}>
                      {user.workout1Records.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 1</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span className="rp-lb-value" style={{ color: '#ededed' }}>{user.workout1Records.map(r => abbrev(r)).join(', ')}</span>
                            {canEdit && user.workout1Records.map(r => (
                              <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제"><Trash2 size={12} /></button>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.workout2Records.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>WORKOUT 2</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span className="rp-lb-value">{user.workout2Records.map(r => abbrev(r)).join(', ')}</span>
                            {canEdit && user.workout2Records.map(r => (
                              <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0 2px' }} title="기록 삭제"><Trash2 size={12} /></button>
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
                      {fbs.length === 0 && <p className="rp-fb-empty">댓글이 없습니다.</p>}
                      {fbs.map((f, i) => (
                        <div key={f.id || i} className="rp-fb-item">
                          <span className="rp-fb-author">{f.author}</span>
                          <span className="rp-fb-content">{f.content}</span>
                        </div>
                      ))}
                      {primaryRecordId && (
                        <div className="rp-fb-input-row">
                          <input type="text" placeholder="댓글 작성..." value={fbText} onChange={e => setFbText(e.target.value)}
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

      {/* ══ 날짜별 기록 ══ */}
      <div className="rp-dh-wrapper">
          <h2 className="rp-title">날짜별 기록</h2>
          <div className="rp-dh-body">
            <div className="rp-cal">
              <div className="rp-cal-header">
                <button className="rp-cal-nav" onClick={() => moveMonth(-1)}>&#8593;</button>
                <span className="rp-cal-title">{calYear}년 {calMonth + 1}월</span>
                <button className="rp-cal-nav" onClick={() => moveMonth(1)}>&#8595;</button>
                <button className="rp-cal-today-btn" onClick={() => {
                  setCalYear(new Date().getFullYear());
                  setCalMonth(new Date().getMonth());
                  setSelectedDate(yesterday);
                }}>오늘</button>
              </div>
              <div className="rp-cal-grid">
                {DAY_NAMES.map(n => <div key={n} className={`rp-cal-day-label ${n === '일' ? 'sun' : ''}`}>{n}</div>)}
                {calDays.map((cell, i) => {
                  const ds = cell.cur ? toDateStr(calYear, calMonth, cell.day) : null;
                  const isSun = i % 7 === 0;
                  return (
                    <button key={i} disabled={!cell.cur}
                      onClick={() => ds && setSelectedDate(ds)}
                      className={`rp-cal-cell ${!cell.cur ? 'other' : ''} ${ds === selectedDate ? 'active' : ''} ${ds === today ? 'today' : ''} ${isSun ? 'sun' : ''}`}
                    >
                      <span className="rp-cal-cell-num">{cell.day}</span>
                      <span className="rp-cal-dots">
                        {ds && wodDates.has(ds)    && <span className="rp-dh-dot wod" />}
                        {ds && recordDates.has(ds) && <span className="rp-dh-dot rec" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="rp-cal-legend">
                <span><span className="rp-dh-dot wod" /> WOD</span>
                <span><span className="rp-dh-dot rec" /> 기록</span>
              </div>
            </div>
            <div className="rp-dh-content">
              {historyWod ? (
                <div className="rp-dh-wod glass-card">
                  <div className="rp-dh-wod-label">WORKOUT ({selectedDate})</div>
                  {historyWod.workout1Title && (
                    <div className="rp-dh-wod-block">
                      <div className="rp-dh-wod-num-row"><span className="rp-dh-wod-num">01</span><span className="rp-dh-wod-sub">Strength &amp; Accessory</span></div>
                      <span className="rp-dh-wod-title">{historyWod.workout1Title}</span>
                      {historyWod.workout1Description && <pre className="rp-dh-wod-pre">{historyWod.workout1Description}</pre>}
                    </div>
                  )}
                  <div className="rp-dh-wod-block">
                    <div className="rp-dh-wod-num-row"><span className="rp-dh-wod-num accent">02</span><span className="rp-dh-wod-sub accent">WOD</span></div>
                    <span className="rp-dh-wod-title">{historyWod.title}</span>
                    <div className="rp-dh-wod-meta">
                      <span className="rp-dh-wod-type">{historyWod.type}</span>
                      {historyWod.timeLimit && <span className="rp-dh-wod-cap">⏱ {historyWod.timeLimit}</span>}
                    </div>
                    {historyWod.rxd && <pre className="rp-dh-wod-pre">{historyWod.rxd}</pre>}
                  </div>
                </div>
              ) : (
                <div className="rp-empty glass-card">{selectedDate} WOD 없음</div>
              )}
              {historyUsers.length > 0 ? (
                <div className="rp-dh-records">
                  {historyUsers.map(u => {
                    const lvl = normalizeLevel((levelMap && levelMap[u.name]) || u.level);
                    const s = LEVEL_STYLE[lvl] || LEVEL_STYLE.Beginner;
                    const mine = u.name === displayName;
                    return (
                      <div key={u.name} className={`rp-dh-rec-card glass-card ${mine ? 'mine' : ''}`}>
                        <div className="rp-dh-rec-who">
                          <span className="rp-dh-rec-name">{u.name}</span>
                          <span className="rp-dh-rec-level" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{lvl}</span>
                        </div>
                        <div className="rp-dh-rec-vals">
                          {u.w1.length > 0 && (
                            <div className="rp-dh-rec-group">
                              <span className="rp-dh-rec-lbl">01</span>
                              <span className="rp-dh-rec-val">{u.w1.map(r => abbrev(r)).join(', ')}</span>
                              {(isAdmin || mine) && u.w1.map(r => <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>)}
                            </div>
                          )}
                          {u.w2.length > 0 && (
                            <div className="rp-dh-rec-group">
                              <span className="rp-dh-rec-lbl">02</span>
                              <span className="rp-dh-rec-val accent">{u.w2.map(r => abbrev(r)).join(', ')}</span>
                              {(isAdmin || mine) && u.w2.map(r => <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>)}
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

    </div>

    {/* ══ 전체보기 풀스크린 ══ */}
    {showFullscreen && (
        <div className="rp-fs-overlay">
          <div className="rp-fs-header">
            <div>
              <h2 className="rp-fs-title">오늘의 리더보드</h2>
              <span className="rp-fs-date">{today}</span>
            </div>
            <button className="rp-fs-close" onClick={() => { setShowFullscreen(false); setExpandedFs(null); }}>✕</button>
          </div>
          <div className="rp-fs-body">
            {LEVELS.map(level => {
              const users = recordsByLevel[level] || [];
              const s = LEVEL_STYLE[level] || LEVEL_STYLE.Beginner;
              return (
                <div key={level} className="rp-fs-col">
                  <div className="rp-fs-col-header" style={{ color: s.color }}>
                    {level}
                    {users.length > 0 && <span className="rp-fs-col-count">{users.length}</span>}
                  </div>
                  <div className="rp-fs-col-cards">
                    {users.length === 0 ? (
                      <div className="rp-fs-empty">—</div>
                    ) : users.map(u => {
                      const canEdit = isAdmin || u.member_name === displayName;
                      const primaryId = u.workout2Records[0]?.id || u.workout1Records[0]?.id;
                      const fbs = u.feedbacks;
                      const isExpFs = expandedFs === u.member_name;
                      return (
                        <div key={u.member_name} className={`rp-fs-card ${u.member_name === displayName ? 'mine' : ''}`}>
                          <div className="rp-fs-card-main">
                            <span className="rp-fs-name">{u.member_name}</span>
                            <div className="rp-fs-records">
                              {u.workout2Records.length > 0 && (
                                <div className="rp-fs-rec-group">
                                  <span className="rp-fs-rec-lbl">WORKOUT 2</span>
                                  <div className="rp-fs-rec-row">
                                    <span className="rp-fs-val">{u.workout2Records.map(r => abbrev(r)).join(', ')}</span>
                                    {canEdit && u.workout2Records.map(r => (
                                      <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {u.workout1Records.length > 0 && (
                                <div className="rp-fs-rec-group">
                                  <span className="rp-fs-rec-lbl">WORKOUT 1</span>
                                  <div className="rp-fs-rec-row">
                                    <span className="rp-fs-val w1">{u.workout1Records.map(r => abbrev(r)).join(', ')}</span>
                                    {canEdit && u.workout1Records.map(r => (
                                      <button key={r.id} onClick={() => deleteWorkoutRecord(r.id)} className="rp-history-del"><Trash2 size={11} /></button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <button className="rp-fb-trigger" onClick={() => setExpandedFs(isExpFs ? null : u.member_name)}>
                              <MessageSquare size={13} />
                              {fbs.length > 0 && <span className="rp-fb-count">{fbs.length}</span>}
                              {isExpFs ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          </div>
                          {isExpFs && (
                            <div className="rp-fb-panel">
                              {fbs.length === 0 && <p className="rp-fb-empty">댓글이 없습니다.</p>}
                              {fbs.map((f, i) => (
                                <div key={f.id || i} className="rp-fb-item">
                                  <span className="rp-fb-author">{f.author}</span>
                                  <span className="rp-fb-content">{f.content}</span>
                                </div>
                              ))}
                              {primaryId && (
                                <div className="rp-fb-input-row">
                                  <input type="text" placeholder="댓글 작성..." value={fbTextFs}
                                    onChange={e => setFbTextFs(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleFeedbackFs(primaryId)}
                                    className="rp-fb-input" />
                                  <button type="button" className="rp-fb-send" onClick={() => handleFeedbackFs(primaryId)}>전송</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </>
  );
}
