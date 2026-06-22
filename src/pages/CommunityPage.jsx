import React, { useState } from 'react';
import { MessageCircle, Heart, Send, Image, Award, Smile } from 'lucide-react';
import './CommunityPage.css';

// Unsplash Workout Image Presets for Easy Mocking
const imagePresets = [
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571731979149-75be7a62506e?auto=format&fit=crop&w=800&q=80'
];

function CommunityPage({ feed, addFeedPost, toggleLikeFeed, addCommentToFeed }) {
  const [postContent, setPostContent] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // { [feedId]: commentText }

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    addFeedPost(postContent, selectedPresetImage);
    setPostContent('');
    setSelectedPresetImage('');
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

  const selectPreset = (url) => {
    setSelectedPresetImage(url === selectedPresetImage ? '' : url);
  };

  return (
    <div className="community-container fade-in">
      <div className="community-header">
        <h1>오운완 커뮤니티</h1>
        <p className="sub-text">오늘 운동 기록을 자랑하고 다른 크루원들의 성장을 응원해 주세요! 💬</p>
      </div>

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

        {/* Preset Image Selection Wrapper */}
        <div className="preset-images-section">
          <span className="preset-label">
            <Image size={14} /> 운동 인증 사진 추가 (데모 프리셋)
          </span>
          <div className="preset-gallery">
            {imagePresets.map((url, idx) => (
              <div
                key={idx}
                className={`preset-thumbnail-wrapper ${selectedPresetImage === url ? 'selected' : ''}`}
                onClick={() => selectPreset(url)}
              >
                <img src={url} alt={`Preset ${idx + 1}`} className="preset-thumbnail" />
                <div className="select-overlay">
                  <Smile size={18} />
                </div>
              </div>
            ))}
          </div>
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
