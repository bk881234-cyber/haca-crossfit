import React, { useState } from 'react';
import { Calendar, Users, CheckCircle2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import './ReservationPage.css';

function ReservationPage({ classes, myReservations, toggleBooking }) {
  const [selectedDate, setSelectedDate] = useState('2026-06-22'); // 기본 오늘 날짜
  const [expandedClass, setExpandedClass] = useState(null); // 참석자 목록 펼침 제어

  // Week days helper (Mon - Fri)
  const weekDays = [
    { dayName: '월', date: '2026-06-22', isToday: true },
    { dayName: '화', date: '2026-06-23', isToday: false },
    { dayName: '수', date: '2026-06-24', isToday: false },
    { dayName: '목', date: '2026-06-25', isToday: false },
    { dayName: '금', date: '2026-06-26', isToday: false },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // 날짜별로 다른 예약을 시뮬레이션할 수 있음
  };

  const toggleExpandClass = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
    }
  };

  return (
    <div className="reservation-container fade-in">
      <div className="reservation-header">
        <h1>클래스 예약</h1>
        <p className="sub-text">참석하실 날짜와 시간대를 선택하여 클래스를 예약해 주세요.</p>
      </div>

      {/* 1. Date Selector (Calendar horizontal scroll style) */}
      <div className="date-selector-row">
        {weekDays.map((day) => {
          const isSelected = selectedDate === day.date;
          return (
            <button
              key={day.date}
              className={`date-card ${isSelected ? 'active' : ''} ${day.isToday ? 'today' : ''}`}
              onClick={() => handleDateSelect(day.date)}
            >
              <span className="day-name">{day.dayName}</span>
              <span className="day-number">{day.date.split('-')[2]}</span>
              {day.isToday && <span className="today-badge">TODAY</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Date Summary */}
      <div className="selected-date-banner glass-card">
        <Calendar size={18} className="text-lime" />
        <span className="date-text">
          2026년 6월 {selectedDate.split('-')[2]}일 (월요일 기준 스케줄)
        </span>
      </div>

      {/* 2. Class List */}
      <div className="class-list-container">
        {classes.map((cls) => {
          const isBooked = myReservations.includes(cls.id);
          const isFull = cls.attendees.length >= cls.maxCapacity;
          const fillPercentage = (cls.attendees.length / cls.maxCapacity) * 100;
          const isExpanded = expandedClass === cls.id;

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
                    <span>
                      {cls.attendees.length} / {cls.maxCapacity} 명
                    </span>
                  </div>
                  {isFull && <span className="badge badge-danger">마감</span>}
                  {isBooked && <span className="badge badge-accent">예약완료</span>}
                </div>
              </div>

              {/* Progress Bar (Visual representation of capacity) */}
              <div className="capacity-progress-bar-bg">
                <div
                  className={`capacity-progress-bar-fill ${isFull ? 'full' : ''}`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>

              {/* Accordion Toggle for Attendees List */}
              <div className="attendee-accordion">
                <button
                  className="accordion-trigger btn-ghost"
                  onClick={() => toggleExpandClass(cls.id)}
                >
                  <span>예약자 명단 보기 ({cls.attendees.length}명)</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isExpanded && (
                  <div className="attendees-panel fade-in">
                    {cls.attendees.length > 0 ? (
                      <div className="attendees-grid">
                        {cls.attendees.map((attendee, index) => (
                          <div key={index} className="attendee-chip">
                            <span className="dot" />
                            <span>{attendee}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-attendees">첫 번째로 예약을 등록해 보세요!</p>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Actions */}
              <div className="class-booking-action-row">
                {isBooked ? (
                  <button
                    className="btn btn-danger btn-booking-action"
                    onClick={() => toggleBooking(cls.id)}
                  >
                    예약 취소하기
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-booking-action"
                    onClick={() => toggleBooking(cls.id)}
                    disabled={isFull}
                  >
                    {isFull ? '예약 불가 (정원 초과)' : '예약 신청하기'}
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
