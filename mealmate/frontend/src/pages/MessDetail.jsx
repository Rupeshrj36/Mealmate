import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiStar, FiUsers, FiClock, FiMail, FiMessageSquare, FiSend } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import api from '../services/api';
import MealCard from '../components/meals/MealCard';
import FeedbackCard from '../components/feedback/FeedbackCard';
import RatingStars from '../components/feedback/RatingStars';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, addDays, subDays } from 'date-fns';

const MessDetail = () => {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const [mess, setMess] = useState(null);
  const [menus, setMenus] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('menu');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '', mealType: '', tags: [] });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const tagOptions = ['tasty', 'hygienic', 'value for money', 'quick service', 'authentic', 'fresh'];

  useEffect(() => {
    fetchMess();
    fetchFeedback();
    fetchAnnouncements();
  }, [id]);

  useEffect(() => { fetchMenusForDate(); }, [id, selectedDate]);

  useEffect(() => {
    if (user?.subscriptions) setIsSubscribed(user.subscriptions.includes(id));
  }, [user, id]);

  const fetchMess = async () => {
    try {
      const { data } = await api.get(`/messes/${id}`);
      setMess(data.mess);
    } catch {
      toast.error('Mess not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenusForDate = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await api.get(`/menus?messId=${id}&date=${dateStr}`);
      const grouped = {};
      data.menus.forEach(m => { grouped[m.mealType] = m; });
      setMenus(grouped);
    } catch {}
  };

  const fetchFeedback = async () => {
    try {
      const { data } = await api.get(`/feedback/mess/${id}`);
      setFeedbacks(data.feedbacks);
    } catch {}
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get(`/announcements/mess/${id}`);
      setAnnouncements(data.announcements);
    } catch {}
  };

  const handleSubscribe = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      if (isSubscribed) {
        await api.delete(`/subscriptions/${id}`);
        setIsSubscribed(false);
        setMess(prev => ({ ...prev, subscriberCount: (prev.subscriberCount || 1) - 1 }));
        toast.success('Unfollowed');
      } else {
        await api.post(`/subscriptions/${id}`);
        setIsSubscribed(true);
        setMess(prev => ({ ...prev, subscriberCount: (prev.subscriberCount || 0) + 1 }));
        toast.success('Following!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user) { toast.error('Login to give feedback'); return; }
    if (!feedbackForm.rating) { toast.error('Please give a rating'); return; }
    setSubmittingFeedback(true);
    try {
      await api.post('/feedback', { messId: id, ...feedbackForm });
      toast.success('Feedback submitted!');
      fetchFeedback();
      setFeedbackForm({ rating: 5, comment: '', mealType: '', tags: [] });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const toggleTag = (tag) => {
    setFeedbackForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  if (loading) return <div className="loading-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!mess) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}><h2>Mess not found</h2><Link to="/messes" className="btn btn-primary mt-16">Browse Messes</Link></div>;

  const defaultImg = 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=1200&h=400&fit=crop';

  return (
    <div className="mess-detail-page">
      {/* Cover */}
      <div className="mess-cover" style={{ backgroundImage: `url(${mess.coverImage || defaultImg})` }}>
        <div className="cover-overlay" />
        <div className="container cover-content">
          <div className="cover-info">
            <h1 className="cover-title">{mess.name}</h1>
            <div className="cover-meta">
              <span><FiMapPin size={14} /> {mess.location?.address}, {mess.location?.city}</span>
              <span><FiStar size={14} style={{ color: 'var(--accent)' }} /> {mess.rating?.average?.toFixed(1) || '0'} ({mess.rating?.count || 0} reviews)</span>
              <span><FiUsers size={14} /> {mess.subscriberCount || 0} followers</span>
              {mess.isVeg && <span className="badge badge-veg">🌿 Pure Veg</span>}
            </div>
          </div>
          <div className="cover-actions">
            <button
              className={`btn btn-lg ${isSubscribed ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? '✓ Following' : '+ Follow Mess'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mess-detail-body">
        <div className="mess-detail-layout">
          {/* Main */}
          <div className="mess-main">
            {/* Tabs */}
            <div className="tabs-bar">
              {['menu', 'feedback', 'about'].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'feedback' && feedbacks.length > 0 && <span className="tab-count">{feedbacks.length}</span>}
                </button>
              ))}
            </div>

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="animate-fade">
                <div className="date-nav">
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(d => subDays(d, 1))}>← Prev</button>
                  <div className="date-display">
                    <span className="date-label">{format(selectedDate, 'EEEE')}</span>
                    <span className="date-sub">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(d => addDays(d, 1))}>Next →</button>
                </div>

                <div className="meal-slots">
                  {['breakfast', 'lunch', 'dinner'].map(type => (
                    <div key={type}>
                      {menus[type]
                        ? <MealCard menu={menus[type]} />
                        : (
                          <div className={`empty-meal-slot ${type}`}>
                            <span>{type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : '🌙'}</span>
                            <span>No {type} menu posted for this day</span>
                          </div>
                        )
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="animate-fade">
                {/* Rating Summary */}
                <div className="rating-summary card">
                  <div className="rating-big">{mess.rating?.average?.toFixed(1) || '0'}</div>
                  <div>
                    <RatingStars value={Math.round(mess.rating?.average || 0)} readOnly size={22} />
                    <div className="rating-count">{mess.rating?.count || 0} reviews</div>
                  </div>
                </div>

                {/* Write Feedback */}
                {isStudent && (
                  <div className="write-feedback card">
                    <h3 className="write-feedback-title"><FiMessageSquare /> Write a Review</h3>
                    <div className="feedback-form">
                      <div className="input-group">
                        <label>Your Rating *</label>
                        <RatingStars value={feedbackForm.rating} onChange={r => setFeedbackForm(p => ({ ...p, rating: r }))} size={28} />
                      </div>
                      <div className="input-group">
                        <label>Meal Type</label>
                        <select className="input-field" value={feedbackForm.mealType} onChange={e => setFeedbackForm(p => ({ ...p, mealType: e.target.value }))}>
                          <option value="">Select meal type</option>
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Comment</label>
                        <textarea className="input-field" rows={3} value={feedbackForm.comment} onChange={e => setFeedbackForm(p => ({ ...p, comment: e.target.value }))} placeholder="Share your experience…" />
                      </div>
                      <div className="input-group">
                        <label>Tags</label>
                        <div className="tag-options">
                          {tagOptions.map(t => (
                            <button
                              key={t}
                              className={`tag-btn ${feedbackForm.tags.includes(t) ? 'active' : ''}`}
                              onClick={() => toggleTag(t)}
                            ># {t}</button>
                          ))}
                        </div>
                      </div>
                      <button className="btn btn-primary" onClick={handleFeedbackSubmit} disabled={submittingFeedback}>
                        <FiSend /> {submittingFeedback ? 'Submitting…' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}

                {feedbacks.length === 0
                  ? <div className="empty-state"><span className="empty-icon">💬</span><h3>No reviews yet</h3><p>Be the first to review!</p></div>
                  : feedbacks.map(f => <FeedbackCard key={f._id} feedback={f} onUpdate={fetchFeedback} />)
                }
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="about-section animate-fade">
                {mess.description && (
                  <div className="card about-card">
                    <h3>About {mess.name}</h3>
                    <p>{mess.description}</p>
                  </div>
                )}
                {mess.cuisine?.length > 0 && (
                  <div className="card about-card">
                    <h3>Cuisine</h3>
                    <div className="cuisine-tags">
                      {mess.cuisine.map(c => <span key={c} className="badge badge-primary">{c}</span>)}
                    </div>
                  </div>
                )}
                {mess.amenities?.length > 0 && (
                  <div className="card about-card">
                    <h3>Amenities</h3>
                    <div className="amenity-list">
                      {mess.amenities.map(a => <span key={a} className="amenity-item">✓ {a}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="mess-sidebar">
            {/* Timings */}
            {mess.timing && (
              <div className="card sidebar-card">
                <h4><FiClock size={15} /> Meal Timings</h4>
                <div className="timing-list">
                  {mess.timing.breakfast?.open && (
                    <div className="timing-row"><span className="badge badge-breakfast">Breakfast</span><span>{mess.timing.breakfast.open} – {mess.timing.breakfast.close}</span></div>
                  )}
                  {mess.timing.lunch?.open && (
                    <div className="timing-row"><span className="badge badge-lunch">Lunch</span><span>{mess.timing.lunch.open} – {mess.timing.lunch.close}</span></div>
                  )}
                  {mess.timing.dinner?.open && (
                    <div className="timing-row"><span className="badge badge-dinner">Dinner</span><span>{mess.timing.dinner.open} – {mess.timing.dinner.close}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing */}
            {mess.pricing && (
              <div className="card sidebar-card">
                <h4>💰 Pricing</h4>
                <div className="pricing-list">
                  {mess.pricing.breakfast && <div className="pricing-row"><span>Breakfast</span><strong>₹{mess.pricing.breakfast}</strong></div>}
                  {mess.pricing.lunch && <div className="pricing-row"><span>Lunch</span><strong>₹{mess.pricing.lunch}</strong></div>}
                  {mess.pricing.dinner && <div className="pricing-row"><span>Dinner</span><strong>₹{mess.pricing.dinner}</strong></div>}
                  {mess.pricing.monthly && <div className="pricing-row monthly"><span>Monthly</span><strong>₹{mess.pricing.monthly}</strong></div>}
                </div>
              </div>
            )}

            {/* Contact */}
            {mess.contact && (
              <div className="card sidebar-card">
                <h4>📞 Contact</h4>
                {mess.contact.phone && <a href={`tel:${mess.contact.phone}`} className="contact-row"><FiPhone size={14} />{mess.contact.phone}</a>}
                {mess.contact.email && <a href={`mailto:${mess.contact.email}`} className="contact-row"><FiMail size={14} />{mess.contact.email}</a>}
              </div>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="card sidebar-card">
                <h4>📢 Announcements</h4>
                <div className="ann-list">
                  {announcements.map(a => (
                    <div key={a._id} className={`ann-item ann-${a.type}`}>
                      <div className="ann-title">{a.title}</div>
                      <div className="ann-content">{a.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .mess-cover { height: 280px; background-size: cover; background-position: center; position: relative; display: flex; align-items: flex-end; }
        .cover-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%); }
        .cover-content { position: relative; z-index: 1; display: flex; align-items: flex-end; justify-content: space-between; padding-bottom: 28px; gap: 20px; }
        .cover-title { font-size: 32px; color: white; margin-bottom: 10px; }
        .cover-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; color: rgba(255,255,255,0.85); font-size: 14px; }
        .cover-meta span { display: flex; align-items: center; gap: 5px; }
        .cover-actions { flex-shrink: 0; }
        .mess-detail-body { padding: 32px 0 60px; }
        .mess-detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 28px; }
        .tabs-bar { display: flex; border-bottom: 2px solid var(--gray-200); margin-bottom: 24px; gap: 4px; }
        .tab-btn { padding: 10px 20px; font-size: 14px; font-weight: 600; color: var(--gray-500); background: none; border: none; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: var(--transition); display: flex; align-items: center; gap: 6px; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        .tab-btn:hover { color: var(--gray-800); }
        .tab-count { background: var(--primary); color: white; font-size: 11px; padding: 1px 6px; border-radius: 99px; }
        .date-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: var(--gray-100); border-radius: var(--radius-lg); padding: 12px 16px; }
        [data-theme="dark"] .date-nav { background: var(--gray-200); }
        .date-display { text-align: center; }
        .date-label { display: block; font-weight: 700; font-size: 15px; }
        .date-sub { font-size: 13px; color: var(--gray-500); }
        .meal-slots { display: flex; flex-direction: column; gap: 14px; }
        .empty-meal-slot { display: flex; align-items: center; gap: 10px; padding: 20px; border-radius: var(--radius-lg); border: 1.5px dashed var(--gray-300); color: var(--gray-400); font-size: 14px; }
        .empty-meal-slot.breakfast { background: var(--breakfast-bg); }
        .empty-meal-slot.lunch { background: var(--lunch-bg); }
        .empty-meal-slot.dinner { background: var(--dinner-bg); }
        .rating-summary { display: flex; align-items: center; gap: 20px; padding: 20px; margin-bottom: 16px; }
        .rating-big { font-size: 52px; font-weight: 800; color: var(--gray-900); line-height: 1; }
        .rating-count { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
        .write-feedback { padding: 20px; margin-bottom: 16px; }
        .write-feedback-title { font-size: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .feedback-form { display: flex; flex-direction: column; gap: 14px; }
        .tag-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .tag-btn { padding: 5px 12px; border-radius: 99px; border: 1.5px solid var(--gray-200); background: white; font-size: 12px; font-weight: 500; color: var(--gray-600); transition: var(--transition); }
        [data-theme="dark"] .tag-btn { background: var(--gray-200); }
        .tag-btn.active { background: var(--primary-bg); border-color: var(--primary); color: var(--primary); }
        .about-section { display: flex; flex-direction: column; gap: 16px; }
        .about-card { padding: 20px; }
        .about-card h3 { font-size: 16px; margin-bottom: 10px; }
        .about-card p { font-size: 14px; color: var(--gray-600); line-height: 1.7; }
        .cuisine-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .amenity-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .amenity-item { font-size: 13px; color: var(--gray-600); }
        .sidebar-card { padding: 16px 20px; margin-bottom: 16px; }
        .sidebar-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
        .timing-list { display: flex; flex-direction: column; gap: 8px; }
        .timing-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .pricing-list { display: flex; flex-direction: column; gap: 8px; }
        .pricing-row { display: flex; justify-content: space-between; font-size: 14px; color: var(--gray-600); padding: 4px 0; border-bottom: 1px dashed var(--gray-200); }
        .pricing-row strong { color: var(--gray-900); }
        .pricing-row.monthly { border-top: 2px solid var(--gray-200); border-bottom: none; padding-top: 10px; margin-top: 4px; color: var(--primary); }
        .pricing-row.monthly strong { color: var(--primary); font-size: 16px; }
        .contact-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-600); padding: 6px 0; }
        .contact-row:hover { color: var(--primary); }
        .ann-list { display: flex; flex-direction: column; gap: 10px; }
        .ann-item { padding: 10px 12px; border-radius: var(--radius-md); border-left: 3px solid; }
        .ann-general { background: var(--gray-100); border-color: var(--gray-400); }
        .ann-special { background: #FFF8E1; border-color: var(--accent); }
        .ann-holiday { background: var(--lunch-bg); border-color: var(--lunch); }
        .ann-menu_change { background: var(--dinner-bg); border-color: var(--dinner); }
        .ann-maintenance { background: var(--breakfast-bg); border-color: var(--breakfast); }
        .ann-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
        .ann-content { font-size: 12px; color: var(--gray-600); line-height: 1.5; }
        .empty-state { text-align: center; padding: 40px; }
        .empty-icon { font-size: 36px; display: block; margin-bottom: 10px; }
        .empty-state h3 { font-size: 16px; margin-bottom: 6px; }
        .empty-state p { font-size: 13px; color: var(--gray-500); }
        @media (max-width: 900px) { .mess-detail-layout { grid-template-columns: 1fr; } .mess-sidebar { order: -1; } }
        @media (max-width: 768px) { .cover-content { flex-direction: column; align-items: flex-start; } .cover-title { font-size: 24px; } }
      `}</style>
    </div>
  );
};

export default MessDetail;
