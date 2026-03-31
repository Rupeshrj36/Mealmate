import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiUsers, FiCheck } from 'react-icons/fi';

const StarRating = ({ rating }) => (
  <div className="star-row">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={s <= Math.round(rating) ? 'star' : 'star-empty'}>★</span>
    ))}
    <span className="rating-num">{rating?.toFixed(1)}</span>
  </div>
);

const MessCard = ({ mess, isSubscribed, onSubscribe }) => {
  const defaultImg = 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=220&fit=crop';

  return (
    <div className="mess-card card animate-fade">
      <div className="mess-img-wrap">
        <img src={mess.coverImage || defaultImg} alt={mess.name} className="mess-img" />
        <div className="mess-img-overlay">
          {mess.isVeg && <span className="badge badge-veg">🌿 Pure Veg</span>}
          {!mess.isVeg && <span className="badge badge-nonveg">🍗 Non-Veg</span>}
        </div>
      </div>
      <div className="mess-card-body">
        <div className="mess-card-top">
          <h3 className="mess-name">{mess.name}</h3>
          <StarRating rating={mess.rating?.average || 0} />
        </div>

        <div className="mess-location">
          <FiMapPin size={13} />
          <span>{mess.location?.address}, {mess.location?.city}</span>
        </div>

        {mess.description && (
          <p className="mess-desc">{mess.description.slice(0, 90)}{mess.description.length > 90 ? '…' : ''}</p>
        )}

        <div className="mess-meal-types">
          {mess.mealTypes?.map(t => (
            <span key={t} className={`badge badge-${t}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
          ))}
        </div>

        <div className="mess-pricing">
          {mess.pricing?.breakfast && <span>B: <strong>₹{mess.pricing.breakfast}</strong></span>}
          {mess.pricing?.lunch && <span>L: <strong>₹{mess.pricing.lunch}</strong></span>}
          {mess.pricing?.dinner && <span>D: <strong>₹{mess.pricing.dinner}</strong></span>}
        </div>

        <div className="mess-card-footer">
          <div className="subscriber-count">
            <FiUsers size={13} /> {mess.subscriberCount || 0} subscribers
          </div>
          <div className="mess-actions">
            {onSubscribe && (
              <button
                className={`btn btn-sm ${isSubscribed ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => onSubscribe(mess._id, isSubscribed)}
              >
                {isSubscribed ? <><FiCheck size={13} /> Following</> : '+ Follow'}
              </button>
            )}
            <Link to={`/messes/${mess._id}`} className="btn btn-primary btn-sm">View Menu</Link>
          </div>
        </div>
      </div>

      <style>{`
        .mess-card { overflow: hidden; }
        .mess-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .mess-img-wrap { position: relative; height: 180px; overflow: hidden; }
        .mess-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .mess-card:hover .mess-img { transform: scale(1.04); }
        .mess-img-overlay { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; }
        .mess-card-body { padding: 16px; }
        .mess-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .mess-name { font-size: 16px; font-weight: 700; color: var(--gray-900); flex: 1; }
        .star-row { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
        .rating-num { font-size: 12px; font-weight: 700; color: var(--gray-500); margin-left: 3px; }
        .mess-location { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--gray-500); margin-bottom: 8px; }
        .mess-desc { font-size: 13px; color: var(--gray-600); line-height: 1.5; margin-bottom: 10px; }
        .mess-meal-types { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .mess-pricing { display: flex; gap: 12px; font-size: 12px; color: var(--gray-500); margin-bottom: 12px; }
        .mess-pricing strong { color: var(--gray-800); }
        .mess-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .subscriber-count { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--gray-500); }
        .mess-actions { display: flex; gap: 6px; }
      `}</style>
    </div>
  );
};

export default MessCard;
