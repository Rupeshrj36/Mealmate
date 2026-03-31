import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiCoffee, FiSun, FiMoon, FiStar } from 'react-icons/fi';
import api from '../services/api';
import MealCard from '../components/meals/MealCard';
import MessCard from '../components/mess/MessCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Home = () => {
  const { user, isStudent } = useAuth();
  const [todayData, setTodayData] = useState([]);
  const [featuredMesses, setFeaturedMesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    if (isStudent) fetchSubscriptions();
  }, [isStudent]);

  const fetchData = async () => {
    try {
      const [todayRes, messRes] = await Promise.all([
        api.get('/menus/today'),
        api.get('/messes?limit=6')
      ]);
      setTodayData(todayRes.data.grouped || []);
      setFeaturedMesses(messRes.data.messes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data } = await api.get('/subscriptions');
      setSubscriptions(data.subscriptions.map(s => s._id));
    } catch {}
  };

  const handleSubscribe = async (messId, isSubscribed) => {
    if (!user) { toast.error('Please login to follow messes'); return; }
    try {
      if (isSubscribed) {
        await api.delete(`/subscriptions/${messId}`);
        setSubscriptions(prev => prev.filter(id => id !== messId));
        toast.success('Unfollowed');
      } else {
        await api.post(`/subscriptions/${messId}`);
        setSubscriptions(prev => [...prev, messId]);
        toast.success('Following!');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text animate-fade">
            <div className="hero-eyebrow">🍽️ College Mess Management</div>
            <h1 className="hero-title">
              Your Meals,<br />
              <span className="hero-highlight">Your Way.</span>
            </h1>
            <p className="hero-subtitle">
              Discover, track, and follow the best messes on your campus.
              Know exactly what's cooking before you step out.
            </p>
            <div className="hero-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search messes, cuisines, or dishes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && window.location.assign(`/messes?search=${search}`)}
                className="hero-search-input"
              />
              <Link to={`/messes${search ? `?search=${search}` : ''}`} className="btn btn-primary">
                Find Messes <FiArrowRight />
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>50+</strong><span>Messes</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>1,200+</strong><span>Students</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>3</strong><span>Meals/Day</span></div>
            </div>
          </div>
          <div className="hero-visual animate-scale">
            <div className="meal-badges-float">
              <div className="float-badge breakfast"><FiCoffee /> Breakfast</div>
              <div className="float-badge lunch"><FiSun /> Lunch</div>
              <div className="float-badge dinner"><FiMoon /> Dinner</div>
            </div>
            <div className="hero-plate">🍽️</div>
          </div>
        </div>
      </section>

      {/* Today's Menu */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-eyebrow">📅 {today}</div>
              <h2 className="section-title">Today's Meals</h2>
              <p className="section-subtitle">Live menus from all active messes</p>
            </div>
            <Link to="/weekly-menu" className="btn btn-outline hide-mobile">
              Weekly View <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : todayData.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h3>No menus posted yet today</h3>
              <p>Check back later or browse messes to subscribe for updates.</p>
            </div>
          ) : (
            <div className="today-grid">
              {todayData.map(({ mess, meals }) => (
                <div key={mess._id} className="today-mess-block card">
                  <div className="today-mess-header">
                    <div className="today-mess-info">
                      <div className="today-mess-img">
                        {mess.coverImage
                          ? <img src={mess.coverImage} alt={mess.name} />
                          : <span>🍽️</span>
                        }
                      </div>
                      <div>
                        <Link to={`/messes/${mess._id}`} className="today-mess-name">{mess.name}</Link>
                        <div className="today-mess-rating">
                          <FiStar size={12} style={{ color: 'var(--accent)' }} />
                          <span>{mess.rating?.average?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/messes/${mess._id}`} className="btn btn-ghost btn-sm">
                      View All <FiArrowRight size={13} />
                    </Link>
                  </div>
                  <div className="today-meals-row">
                    {['breakfast', 'lunch', 'dinner'].map(type => (
                      meals[type]
                        ? <MealCard key={type} menu={meals[type]} compact />
                        : <div key={type} className={`no-meal-slot ${type}`}>
                            <span>{type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : '🌙'}</span>
                            <span className="no-meal-text">No {type}</span>
                          </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Meal Type Cards */}
      <section className="section meal-types-section">
        <div className="container">
          <h2 className="section-title text-center mb-24">Browse by Meal Type</h2>
          <div className="meal-type-cards">
            {[
              { type: 'breakfast', icon: '🌅', label: 'Breakfast', time: '7:00 – 10:00 AM', desc: 'Start your day right', cls: 'breakfast' },
              { type: 'lunch', icon: '☀️', label: 'Lunch', time: '12:00 – 3:00 PM', desc: 'Power through the day', cls: 'lunch' },
              { type: 'dinner', icon: '🌙', label: 'Dinner', time: '7:00 – 10:00 PM', desc: 'Wind down with a good meal', cls: 'dinner' }
            ].map(m => (
              <Link key={m.type} to={`/weekly-menu?mealType=${m.type}`} className={`meal-type-card card meal-type-${m.cls}`}>
                <span className="meal-type-icon">{m.icon}</span>
                <h3>{m.label}</h3>
                <p className="meal-type-time">{m.time}</p>
                <p className="meal-type-desc">{m.desc}</p>
                <span className="btn btn-sm meal-type-btn">Browse <FiArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Messes */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Messes</h2>
              <p className="section-subtitle">Top-rated messes loved by students</p>
            </div>
            <Link to="/messes" className="btn btn-outline hide-mobile">
              All Messes <FiArrowRight />
            </Link>
          </div>
          <div className="grid-3">
            {featuredMesses.map(mess => (
              <MessCard
                key={mess._id}
                mess={mess}
                isSubscribed={subscriptions.includes(mess._id)}
                onSubscribe={isStudent ? handleSubscribe : null}
              />
            ))}
          </div>
          {featuredMesses.length === 0 && !loading && (
            <div className="empty-state">
              <span className="empty-icon">🏪</span>
              <h3>No messes available yet</h3>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <h2>Are you a Mess Owner?</h2>
              <p>Join MealMate and reach hundreds of hungry college students. Post daily menus, receive feedback, and grow your mess business.</p>
              <div className="cta-buttons">
                <Link to="/register?role=owner" className="btn btn-primary btn-lg">Register as Mess Owner</Link>
                <Link to="/register" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Student? Sign Up Free</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <style>{`
        .hero { background: linear-gradient(135deg, #FFF5F2 0%, #FFF9F5 50%, #F0F8FF 100%); padding: 80px 0 60px; position: relative; overflow: hidden; }
        [data-theme="dark"] .hero { background: linear-gradient(135deg, #1A0E0B 0%, #1A1510 50%, #0A0F1A 100%); }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(circle at 70% 50%, rgba(232,71,26,0.07) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(245,166,35,0.05) 0%, transparent 50%); }
        .hero-content { display: grid; grid-template-columns: 1fr auto; gap: 60px; align-items: center; position: relative; }
        .hero-eyebrow { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 16px; }
        .hero-title { font-size: clamp(36px, 5vw, 58px); font-weight: 800; line-height: 1.1; margin-bottom: 18px; color: var(--gray-900); }
        .hero-highlight { color: var(--primary); }
        .hero-subtitle { font-size: 17px; color: var(--gray-600); line-height: 1.7; max-width: 500px; margin-bottom: 28px; }
        .hero-search { display: flex; align-items: center; gap: 10px; background: white; border: 1.5px solid var(--gray-200); border-radius: var(--radius-xl); padding: 6px 6px 6px 16px; max-width: 500px; box-shadow: var(--shadow-md); }
        [data-theme="dark"] .hero-search { background: var(--gray-100); border-color: var(--gray-300); }
        .search-icon { color: var(--gray-400); flex-shrink: 0; }
        .hero-search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; color: var(--gray-800); }
        .hero-stats { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
        .stat { display: flex; flex-direction: column; }
        .stat strong { font-size: 22px; font-weight: 800; color: var(--gray-900); }
        .stat span { font-size: 12px; color: var(--gray-500); }
        .stat-divider { width: 1px; height: 36px; background: var(--gray-200); }
        .hero-visual { display: flex; align-items: center; justify-content: center; position: relative; }
        .hero-plate { font-size: 120px; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.1)); animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .meal-badges-float { position: absolute; display: flex; flex-direction: column; gap: 10px; left: -40px; }
        .float-badge { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; box-shadow: var(--shadow-md); animation: float 3s ease-in-out infinite; }
        .float-badge.breakfast { background: var(--breakfast-bg); color: #B85F00; animation-delay: 0s; }
        .float-badge.lunch { background: var(--lunch-bg); color: #0A7A40; animation-delay: 0.5s; }
        .float-badge.dinner { background: var(--dinner-bg); color: #1A3A9E; animation-delay: 1s; }
        .section { padding: 64px 0; }
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 28px; }
        .section-eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary); margin-bottom: 4px; }
        .today-grid { display: flex; flex-direction: column; gap: 20px; }
        .today-mess-block { padding: 20px; }
        .today-mess-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .today-mess-info { display: flex; align-items: center; gap: 12px; }
        .today-mess-img { width: 44px; height: 44px; border-radius: 10px; overflow: hidden; background: var(--gray-100); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .today-mess-img img { width: 100%; height: 100%; object-fit: cover; }
        .today-mess-name { font-size: 16px; font-weight: 700; color: var(--gray-900); display: block; margin-bottom: 3px; }
        .today-mess-name:hover { color: var(--primary); }
        .today-mess-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--gray-500); }
        .today-meals-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .no-meal-slot { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 16px; border-radius: var(--radius-lg); border: 1.5px dashed var(--gray-200); }
        .no-meal-slot.breakfast { background: var(--breakfast-bg); border-color: var(--breakfast-border); }
        .no-meal-slot.lunch { background: var(--lunch-bg); border-color: var(--lunch-border); }
        .no-meal-slot.dinner { background: var(--dinner-bg); border-color: var(--dinner-border); }
        .no-meal-text { font-size: 12px; color: var(--gray-500); }
        .no-meal-slot span:first-child { font-size: 22px; }
        .meal-types-section { background: var(--gray-100); }
        [data-theme="dark"] .meal-types-section { background: var(--gray-200); }
        .meal-type-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .meal-type-card { padding: 28px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; }
        .meal-type-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .meal-type-breakfast { border-top: 3px solid var(--breakfast); }
        .meal-type-lunch { border-top: 3px solid var(--lunch); }
        .meal-type-dinner { border-top: 3px solid var(--dinner); }
        .meal-type-icon { font-size: 40px; }
        .meal-type-card h3 { font-size: 20px; }
        .meal-type-time { font-size: 12px; color: var(--gray-500); }
        .meal-type-desc { font-size: 14px; color: var(--gray-600); }
        .meal-type-btn { margin-top: 8px; }
        .meal-type-breakfast .meal-type-btn { background: var(--breakfast-bg); color: #B85F00; }
        .meal-type-lunch .meal-type-btn { background: var(--lunch-bg); color: #0A7A40; }
        .meal-type-dinner .meal-type-btn { background: var(--dinner-bg); color: #1A3A9E; }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 12px; }
        .empty-state h3 { font-size: 18px; margin-bottom: 8px; color: var(--gray-700); }
        .empty-state p { color: var(--gray-500); font-size: 14px; }
        .cta-section { padding: 48px 0 80px; }
        .cta-card { background: linear-gradient(135deg, var(--primary) 0%, #C23410 100%); border-radius: var(--radius-xl); padding: 60px 48px; text-align: center; color: white; }
        .cta-card h2 { font-size: 32px; color: white; margin-bottom: 12px; }
        .cta-card p { font-size: 16px; opacity: 0.85; max-width: 500px; margin: 0 auto 28px; line-height: 1.7; }
        .cta-buttons { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .cta-buttons .btn-primary { background: white; color: var(--primary); }
        .cta-buttons .btn-primary:hover { background: var(--gray-100); }
        @media (max-width: 768px) {
          .hero-content { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .today-meals-row { grid-template-columns: 1fr; }
          .meal-type-cards { grid-template-columns: 1fr; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .cta-card { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
};

export default Home;
