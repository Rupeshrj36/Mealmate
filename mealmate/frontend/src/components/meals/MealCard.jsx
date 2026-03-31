import React from 'react';
import { FiSun, FiCoffee, FiMoon, FiStar, FiZap } from 'react-icons/fi';

const mealConfig = {
  breakfast: { icon: <FiCoffee />, label: 'Breakfast', color: 'var(--breakfast)', bg: 'var(--breakfast-bg)', cls: 'breakfast' },
  lunch: { icon: <FiSun />, label: 'Lunch', color: 'var(--lunch)', bg: 'var(--lunch-bg)', cls: 'lunch' },
  dinner: { icon: <FiMoon />, label: 'Dinner', color: 'var(--dinner)', bg: 'var(--dinner-bg)', cls: 'dinner' }
};

const MealCard = ({ menu, compact = false }) => {
  if (!menu) return null;
  const cfg = mealConfig[menu.mealType] || mealConfig.lunch;

  return (
    <div className={`meal-card ${compact ? 'compact' : ''}`} style={{ '--meal-color': cfg.color, '--meal-bg': cfg.bg }}>
      <div className="meal-card-header">
        <span className={`badge badge-${cfg.cls}`}>{cfg.icon} {cfg.label}</span>
        <div className="meal-meta">
          {menu.isSpecial && <span className="special-badge"><FiZap size={11} /> Special</span>}
          {menu.price && <span className="meal-price">₹{menu.price}</span>}
        </div>
      </div>

      {!compact && menu.image && (
        <div className="meal-image">
          <img src={menu.image} alt={`${cfg.label} meal`} />
        </div>
      )}

      <div className="meal-items">
        {menu.items?.map((item, i) => (
          <div key={i} className="meal-item">
            <span className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
            <span className="item-name">{item.name}</span>
          </div>
        ))}
      </div>

      {menu.specialNote && (
        <div className="special-note">
          <FiStar size={12} /> {menu.specialNote}
        </div>
      )}

      <style>{`
        .meal-card {
          background: var(--meal-bg);
          border: 1px solid color-mix(in srgb, var(--meal-color) 25%, transparent);
          border-radius: var(--radius-lg); padding: 16px;
          transition: var(--transition);
        }
        .meal-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .meal-card.compact { padding: 12px; }
        .meal-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .meal-meta { display: flex; align-items: center; gap: 8px; }
        .meal-price { font-size: 14px; font-weight: 700; color: var(--gray-700); }
        .special-badge {
          display: flex; align-items: center; gap: 3px;
          background: #FFF8E1; color: #956900; border: 1px solid #FFE082;
          padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;
        }
        .meal-image { height: 140px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 12px; }
        .meal-image img { width: 100%; height: 100%; object-fit: cover; }
        .meal-items { display: flex; flex-wrap: wrap; gap: 6px; }
        .meal-item { display: flex; align-items: center; gap: 6px; background: white; border-radius: 6px; padding: 4px 10px; border: 1px solid var(--gray-200); }
        [data-theme="dark"] .meal-item { background: var(--gray-200); }
        .item-name { font-size: 13px; font-weight: 500; color: var(--gray-700); }
        .veg-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; border: 1.5px solid; }
        .veg-dot.veg { background: #20BF6B; border-color: #18A05A; }
        .veg-dot.nonveg { background: var(--error); border-color: #D94040; }
        .special-note { margin-top: 10px; padding: 8px 10px; background: #FFF8E1; border-radius: 8px; font-size: 12px; color: #956900; display: flex; align-items: center; gap: 6px; }
      `}</style>
    </div>
  );
};

export default MealCard;
