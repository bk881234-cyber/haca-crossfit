import { useState } from 'react';
import { MessageCircle, Heart, Send, Award, Bell, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './CommunityPage.css';

function CommunityPage({ feed, addFeedPost, toggleLikeFeed, addCommentToFeed, deleteFeedPost, notices = [] }) {
  const { displayName, isAdmin } = useAuth();
  const [postContent, setPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedNotice, setExpandedNotice] = useState(null);

  const activeNotices = notices.filter(n => n.isActive);

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    addFeedPost(postContent, null);
    setPostContent('');
  };

  const handleCommentSubmit = (feedId, e) => {
    e.preventDefault();
    const commentText = commentInputs[feedId] || '';
    if (!commentText.trim()) return;
    addCommentToFeed(feedId, commentText);
    setCommentInputs(prev => ({ ...prev, [feedId]: '' }));
  };

  const handleCommentChange = (feedId, text) => {
    setCommentInputs(prev => ({ ...prev, [feedId]: text }));
  };

  return (
    <div className="community-container fade-in">
      <div className="community-header">
        <h1>오운완 커뮤니티</h1>
        <p className="sub-text">오늘 운동 기록을 자랑하고 다른 크루원들의 성장을 응원해 주세요!</p>
      </div>

      {/* 공지사항 섹션 */}
      {activeNotices.length > 0 && (
        <div className="community-notices">
          <div className="notices-header">
            <Bell size={16} className="text-lime" />
            <span className="notices-title">공지사항</span>
            <span className="notices-count">{activeNotices.length}</span>
          </div>
          <div className="notices-list">
            {activeNotices.map(notice => (
              <div key={notice.id} className="notice-item">
                <button
                  className="notice-toggle"
                  onClick={() => setExpandedNotice(expandedNotice === notice.id ? null : notice.id)}
                >
                  <div className="notice-title-row">
                    {notice.isPopup && <span className="notice-hot-badge">HOT</span>}
                    <span className="notice-item-title">{notice.title}</span>
                  </div>
                  <div className="notice-meta">
                    <span className="notice-date">{notice.timestamp}</span>
                    {expandedNotice === notice.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expandedNotice === notice.id && (
                  <div className="notice-body fade-in">
                    <p>{notice.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Create Post Form */}
      <form className="glass-card create-post-form" onSubmit={handleSubmitPost}>
        <div className="avatar-input-row">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80"
            alt="My Profile"
            className="user-avatar"
          />
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="오늘의 와드 결과나 오운완 소감을 공유해 보세요! (예: DT Rx'd 14분대 컷!🏋️‍♂️)"
            className="post-textarea"
            rows={3}
            required
          />
        </div>

        <div className="form-action-row">
          <button type="submit" className="btn btn-primary btn-submit-post">
            <Award size={16} /> 오운완 인증하기
          </button>
        </div>
      </form>

      {/* 2. Feed Timeline */}
      <div className="feed-timeline">
        {feed.map((post) => {
          const currentCommentText = commentInputs[post.id] || '';
          return (
            <div key={post.id} className="glass-card feed-card fade-in">
              {/* Card Header */}
              <div className="feed-card-header">
                <img src={post.avatar} alt={post.author} className="feed-avatar" />
                <div className="feed-user-meta">
                  <span className="feed-author-name">{post.author}</span>
                  <span className="feed-timestamp">{post.timestamp}</span>
                </div>
                {(isAdmin || post.author === displayName) && (
                  <button
                    className="feed-delete-btn"
                    onClick={() => deleteFeedPost(post.id)}
                    title="게시글 삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="feed-body">
                <p className="feed-text">{post.content}</p>
                {post.image && (
                  <div className="feed-image-wrapper">
                    <img src={post.image} alt="Workout Certification" className="feed-image" />
                  </div>
                )}
              </div>

              {/* Card Action Info (Likes & Comments counts) */}
              <div className="feed-card-stats">
                <div className="stat-item">
                  <Heart size={14} className={post.hasLiked ? 'text-dangerfill' : ''} />
                  <span>좋아요 {post.likes}개</span>
                </div>
                <div className="stat-item">
                  <MessageCircle size={14} />
                  <span>댓글 {post.comments.length}개</span>
                </div>
              </div>

              {/* Card Buttons */}
              <div className="feed-card-actions">
                <button
                  className={`feed-action-btn ${post.hasLiked ? 'liked' : ''}`}
                  onClick={() => toggleLikeFeed(post.id)}
                >
                  <Heart size={18} className={post.hasLiked ? 'heart-fill' : ''} />
                  <span>응원하기</span>
                </button>
              </div>

              {/* Card Comments Section */}
              <div className="comments-section">
                {post.comments.length > 0 && (
                  <div className="comments-list">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <span className="comment-author">{comment.author}</span>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <form className="comment-form" onSubmit={(e) => handleCommentSubmit(post.id, e)}>
                  <input
                    type="text"
                    value={currentCommentText}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                    placeholder="응원의 한마디를 적어보세요..."
                    className="comment-input"
                    required
                  />
                  <button type="submit" className="comment-send-btn">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommunityPage;
