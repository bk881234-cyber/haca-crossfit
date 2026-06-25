// SchedulePage 시간표 기반 — 현재 진행 중인 수업 타입 감지
const CLASS_SCHEDULE = {
  1: [ // 월요일
    { start: [6, 30],  type: 'hyrox' },
    { start: [10, 0],  type: 'crossfit' },
    { start: [11, 30], type: 'hyrox' },
    { start: [18, 30], type: 'crossfit' },
    { start: [19, 30], type: 'hyrox' },
    { start: [20, 30], type: 'crossfit' },
  ],
  2: [ // 화요일
    { start: [6, 30],  type: 'crossfit' },
    { start: [10, 0],  type: 'hyrox' },
    { start: [11, 30], type: 'crossfit' },
    { start: [18, 30], type: 'hyrox' },
    { start: [19, 30], type: 'crossfit' },
    { start: [20, 30], type: 'hyrox' },
  ],
  3: [ // 수요일
    { start: [6, 30],  type: 'hyrox' },
    { start: [10, 0],  type: 'crossfit' },
    { start: [11, 30], type: 'hyrox' },
    { start: [18, 30], type: 'crossfit' },
    { start: [19, 30], type: 'hyrox' },
    { start: [20, 30], type: 'crossfit' },
  ],
  4: [ // 목요일
    { start: [6, 30],  type: 'crossfit' },
    { start: [10, 0],  type: 'hyrox' },
    { start: [11, 30], type: 'crossfit' },
    { start: [18, 30], type: 'hyrox' },
    { start: [19, 30], type: 'crossfit' },
    { start: [20, 30], type: 'hyrox' },
  ],
  5: [ // 금요일
    { start: [6, 30],  type: 'hyrox' },
    { start: [10, 0],  type: 'crossfit' },
    { start: [11, 30], type: 'hyrox' },
    { start: [18, 30], type: 'crossfit' },
    { start: [19, 30], type: 'hyrox' },
    { start: [20, 30], type: 'crossfit' },
  ],
  6: [ // 토요일
    { start: [10, 0],  type: 'hybrid' },
    { start: [11, 30], type: 'hybrid' },
  ],
  // 0 = 일요일: 수업 없음
};

/** 현재 시각 기준으로 진행 중인 수업 타입 반환. 수업 없으면 null */
export function detectClassType() {
  const now = new Date();
  const day = now.getDay();
  const curMin = now.getHours() * 60 + now.getMinutes();
  const slots = CLASS_SCHEDULE[day] || [];

  let current = null;
  for (const slot of slots) {
    if (curMin >= slot.start[0] * 60 + slot.start[1]) current = slot.type;
  }
  return current;
}

export const CLASS_TYPE_LABEL = { crossfit: 'CrossFit', hyrox: 'HYROX', hybrid: 'Hybrid' };
export const CLASS_TYPE_COLOR = { crossfit: 'var(--accent)', hyrox: '#ffc800', hybrid: '#cc66ff' };
