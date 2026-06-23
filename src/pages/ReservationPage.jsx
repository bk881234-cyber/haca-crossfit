import { useState } from 'react';
import { Calendar, Users, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import './ReservationPage.css';

function ReservationPage({ classes, myReservations, toggleBooking, allReservations }) {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedClass, setExpandedClass] = useState(null);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const weekDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: dayNames[d.getDay()],
      date: d.toISOString().split('T')[0],
      dayNumber: d.getDate(),
      isToday: i === 0,
      isSunday: d.getDay() === 0,
    };
  });

  const koreanDayNames = { '월': '월요일', '화': '화요일', '수': '수요일', '목': '목요일', '금': '금요일', '토': '토요일', '일': '일요일' };
  const selectedDay = weekDays.find(d => d.date === selectedDate);

  const isBookedOnDate = (classId) =>
    myReservations.some(r => r.classId === classId && r.date === selectedDate);

  const hasAnyBookingOnDate = myReservations.some(r => r.date === selectedDate);

  const getAttendeesForDate = (classId) =>
    (allReservations || []).filter(r => r.class_id === classId && r.reservation_date === selectedDate).map(r => r.member_name);

  return (
    <div className="reservation-container fade-in">
      <div className="reservation-header">
        <h1>클래스 예약</h1>
        <p className="sub-text">날짜와 시간대를 선택하여 예약하세요.</p>
      </div>

      {/* Date Selector */}
      <div className="date-selector-row">
        {weekDays.map((day) => (
          <button
            key={day.date}
            className={`date-card ${selectedDate === day.date ? 'active' : ''} ${day.isSunday ? 'sunday' : ''}`}
            onClick={() => setSelectedDate(day.date)}
          >
            {day.isToday && <span className="today-badge">TODAY</span>}
            <span className="day-name">{day.dayName}</span>
            <span className="day-number">{day.dayNumber}</span>
          </button>
        ))}
      </div>

      {/* Selected Date Banner */}
      <div className="selected-date-banner glass-card">
        <Calendar size={18} className="text-lime" />
        <span className="date-text">
          {selectedDate.replace(/-/g, '년 ').replace(/-/, '월 ')}일 ({selectedDay?.dayName && koreanDayNames[selectedDay.dayName]})
        </span>
      </div>

      {/* 중복 예약 안내 */}
      {hasAnyBookingOnDate && (
        <div className="duplicate-notice">
          <AlertCircle size={16} />
          <span>이 날짜에 이미 예약이 있습니다. 예약을 취소해야 다른 시간으로 변경할 수 있습니다.</span>
        </div>
      )}

      {/* Class List */}
      <div className="class-list-container">
        {classes.length === 0 && (
          <div className="empty-classes glass-card">
            <p>등록된 클래스 스케줄이 없습니다.</p>
          </div>
        )}
        {classes.map((cls) => {
          const isBooked = isBookedOnDate(cls.id);
          const attendees = getAttendeesForDate(cls.id);
          const isFull = attendees.length >= cls.maxCapacity;
          const fillPercentage = Math.min((attendees.length / cls.maxCapacity) * 100, 100);
          const isExpanded = expandedClass === cls.id;
          const canBook = isBooked || !hasAnyBookingOnDate;

          return (
            <div key={cls.id} className={`glass-card class-slot-card ${isBooked ? 'booked' : ''}`}>
              <div className="class-slot-main">
                <div className="class-time-info">
                  <div className="time-badge">
                    <Clock size={16} />
                    <span>{cls.time}</span>
                  </div>
                  <div className="coach-info">코치: {cls.coach}</div>
                </div>

                <div className="capacity-info">
                  <div className="capacity-label">
                    <Users size={16} />
                    <span>{attendees.length} / {cls.maxCapacity} 명</span>
                  </div>
                  {isFull && !isBooked && <span className="badge badge-danger">마감</span>}
                  {isBooked && <span className="badge badge-accent">예약완료</span>}
                </div>
              </div>

              <div className="capacity-progress-bar-bg">
                <div
                  className={`capacity-progress-bar-fill ${isFull ? 'full' : ''}`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>

              <div className="attendee-accordion">
                <button className="accordion-trigger btn-ghost" onClick={() => setExpandedClass(isExpanded ? null : cls.id)}>
                  <span>예약자 명단 ({attendees.length}명)</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && (
                  <div className="attendees-panel fade-in">
                    {attendees.length > 0 ? (
                      <div className="attendees-grid">
                        {attendees.map((name, i) => (
                          <div key={i} className="attendee-chip">
                            <span className="dot" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-attendees">첫 번째로 예약을 등록해 보세요!</p>
                    )}
                  </div>
                )}
              </div>

              <div className="class-booking-action-row">
                {isBooked ? (
                  <button className="btn btn-danger btn-booking-action" onClick={() => toggleBooking(cls.id, selectedDate)}>
                    예약 취소하기
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-booking-action"
                    onClick={() => toggleBooking(cls.id, selectedDate)}
                    disabled={isFull || !canBook}
                  >
                    {isFull ? '예약 불가 (정원 초과)' : !canBook ? '이미 다른 클래스 예약됨' : '예약 신청하기'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReservationPage;
