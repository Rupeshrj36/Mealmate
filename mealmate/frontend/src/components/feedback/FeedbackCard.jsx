import React, { useState } from 'react';
import { FiMessageSquare, FiCornerDownRight } from 'react-icons/fi';
import RatingStars from './RatingStars';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const FeedbackCard = ({ feedback, isOwner, onUpdate }) => {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSaving(true);
    try {
      await api.put(`/feedback/${feedback._id}/reply`, { text: reply });
      toast.success('Reply posted!');
      setShowReply(false);
      setReply('');
      onUpdate && onUpdate();
    } catch (e) {
      toast.error('Failed to post reply');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="feedback-card card">
      <div className="feedback-header">
        <div className="feedback-user">
          <div className="feedback-avatar">
            {feedback.user?.avatar
              ? <img src={feedback.user.avatar} alt="" />
              : <span>{(feedback.user?.name || 'A')[0]}</span>
            }
          </div>
          <div>
            <div className="feedback-name">{feedback.user?.name || 'Anonymous'}</div>
            <div className="feedback-time">{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}</div>
          </div>
        </div>
        <div className="feedback-right">
          <RatingStars value={feedback.rating} readOnly size={16} />
          {feedback.mealType && (
            <span className={`badge badge-${feedback.mealType} text-xs`}>{feedback.mealType}</span>
          )}
        </div>
      </div>

      {feedback.comment && <p className="feedback-comment">{feedback.comment}</p>}

      {feedback.tags?.length > 0 && (
        <div className="feedback-tags">
          {feedback.tags.map(t => (
            <span key={t} className="badge badge-primary text-xs">#{t}</span>
          ))}
        </div>
      )}

      {feedback.ownerReply && (
        <div className="owner-reply">
          <div className="owner-reply-header"><FiCornerDownRight size={13} /> Owner's Reply</div>
          <p>{feedback.ownerReply.text}</p>
        </div>
      )}

      {isOwner && !feedback.ownerReply && (
        <div className="reply-section">
          {!showReply
            ? <button className="btn btn-ghost btn-sm" onClick={() => setShowReply(true)}><FiMessageSquare size={14}/> Reply</button>
            : (
              <>
                <textarea
                  className="input-field"
                  rows={2}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Write your reply..."
                />
                <div className="flex gap-8 mt-8">
                  <button className="btn btn-primary btn-sm" onClick={handleReply} disabled={saving}>
                    {saving ? 'Posting…' : 'Post Reply'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowReply(false)}>Cancel</button>
                </div>
              </>
            )
          }
        </div>
      )}

      <style>{`
        .feedback-card { padding: 16px; margin-bottom: 12px; }
        .feedback-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .feedback-user { display: flex; align-items: center; gap: 10px; }
        .feedback-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 15px; overflow: hidden; flex-shrink: 0; }
        .feedback-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .feedback-name { font-weight: 600; font-size: 14px; }
        .feedback-time { font-size: 12px; color: var(--gray-500); }
        .feedback-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .feedback-comment { font-size: 14px; color: var(--gray-600); line-height: 1.6; margin-bottom: 8px; }
        .feedback-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
        .owner-reply { background: var(--gray-100); border-left: 3px solid var(--primary); border-radius: 0 8px 8px 0; padding: 10px 12px; margin-top: 10px; }
        .owner-reply-header { font-size: 12px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
        .owner-reply p { font-size: 13px; color: var(--gray-600); }
        .reply-section { margin-top: 10px; border-top: 1px solid var(--gray-200); padding-top: 10px; }
      `}</style>
    </div>
  );
};

export default FeedbackCard;
