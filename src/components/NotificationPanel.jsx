import { X, Bell, MessageSquare } from 'lucide-react';
import './NotificationPanel.css';

const formatTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export default function NotificationPanel({ notifications, onMarkAllRead, onClose }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <div className="notif-overlay" onClick={onClose} />
      <div className="notif-panel glass-card">
        <div className="notif-panel-header">
          <span className="notif-panel-title">알림</span>
          {unreadCount > 0 && (
            <button className="notif-mark-all" onClick={onMarkAllRead}>모두 읽음</button>
          )}
          <button className="notif-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="notif-panel-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">알림이 없습니다.</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item ${n.is_read ? 'read' : 'unread'}`}>
                <div className="notif-icon">
                  {n.type === 'new_wod' ? <Bell size={14} /> : <MessageSquare size={14} />}
                </div>
                <div className="notif-body">
                  <p className="notif-msg">{n.message}</p>
                  <span className="notif-time">{formatTime(n.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
