import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import api from '../services/api';
import MealCard from '../components/meals/MealCard';

const WeeklyMenu = () => {
  const [searchParams] = useSearchParams();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [messes, setMesses] = useState([]);
  const [selectedMess, setSelectedMess] = useState('');
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState(searchParams.get('mealType') || '');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => { fetchMesses(); }, []);
  useEffect(() => { fetchMenus(); }, [selectedMess, selectedDay, mealTypeFilter]);

  const fetchMesses = async () => {
    try {
      const { data } = await api.get('/messes?limit=50');
      setMesses(data.messes);
    } catch {}
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDay, 'yyyy-MM-dd');
      let url = `/menus?date=${dateStr}`;
      if (selectedMess) url += `&messId=${selectedMess}`;
      if (mealTypeFilter) url += `&mealType=${mealTypeFilter}`;
      const { data } = await api.get(url);
      setMenus(data.menus);
    } catch {} finally {
      setLoading(false);
    }
  };

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));

  // Group menus by mess
  const grouped = {};
  menus.forEach(m => {
    const mId = m.mess._id;
    if (!grouped[mId]) grouped[mId] = { mess: m.mess, meals: {} };
    grouped[mId].meals[m.mealType] = m;
  });

  return (
    <div className="weekly-page">
      <div className="weekly-header">
        <div className="container">
          <h1>Weekly Menu</h1>
          <p>Plan your week's meals in advance</p>
        </div>
      </div>

      <div className="container weekly-body">
        {/* Controls */}
        <div className="weekly-controls card">
          <div className="week-nav">
            <button className="btn btn-secondary btn-sm" onClick={prevWeek}><FiChevronLeft /> Prev</button>
            <span className="week-range">
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={nextWeek}>Next <FiChevronRight /></button>
          </div>
          <div className="weekly-filters">
            <select className="filter-select" value={selectedMess} onChange={e => setSelectedMess(e.target.value)}>
              <option value="">All Messes</option>
              {messes.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <select className="filter-select" value={mealTypeFilter} onChange={e => setMealTypeFilter(e.target.value)}>
              <option value="">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        {/* Calendar Days */}
        <div className="day-selector">
          {weekDays.map(day => (
            <button
              key={day.toISOString()}
              className={`day-btn ${isSameDay(day, selectedDay) ? 'active' : ''} ${isToday(day) ? 'today' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-name">{format(day, 'EEE')}</span>
              <span className="day-num">{format(day, 'd')}</span>
              {isToday(day) && <span className="today-dot" />}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="selected-date-header">
          <h2>{isToday(selectedDay) ? "Today's Menus" : `Menus for ${format(selectedDay, 'EEEE, MMMM d')}`}</h2>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : Object.values(grouped).length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>No menus posted for this day</h3>
            <p>Try another day or select a different mess</p>
          </div>
        ) : (
          <div className="weekly-mess-list">
            {Object.values(grouped).map(({ mess, meals }) => (
              <div key={mess._id} className="card weekly-mess-item">
                <div className="weekly-mess-name">{mess.name}</div>
                <div className="weekly-meals-grid">
                  {['breakfast', 'lunch', 'dinner'].filter(t => !mealTypeFilter || t === mealTypeFilter).map(type => (
                    <div key={type}>
                      {meals[type]
                        ? <MealCard menu={meals[type]} />
                        : <div className={`no-meal-mini ${type}`}><span>No {type}</span></div>
                      }
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .weekly-header { background: linear-gradient(135deg, #4B7BEC, #3867D6); padding: 40px 0 28px; color: white; }
        .weekly-header h1 { color: white; font-size: 32px; margin-bottom: 6px; }
        .weekly-header p { color: rgba(255,255,255,0.8); font-size: 15px; }
        .weekly-body { padding: 28px 0 60px; }
        .weekly-controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding: 16px 20px; margin-bottom: 20px; }
        .week-nav { display: flex; align-items: center; gap: 14px; }
        .week-range { font-weight: 700; font-size: 14px; white-space: nowrap; }
        .weekly-filters { display: flex; gap: 10px; }
        .filter-select { padding: 8px 12px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 13px; color: var(--gray-700); background: white; outline: none; }
        [data-theme="dark"] .filter-select { background: var(--gray-200); border-color: var(--gray-300); color: var(--gray-800); }
        .day-selector { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 28px; }
        .day-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border-radius: var(--radius-md); border: 1.5px solid var(--gray-200); background: white; transition: var(--transition); cursor: pointer; position: relative; }
        [data-theme="dark"] .day-btn { background: var(--gray-100); }
        .day-btn:hover { border-color: var(--dinner); background: var(--dinner-bg); }
        .day-btn.today { border-color: var(--accent); }
        .day-btn.active { background: var(--dinner); border-color: var(--dinner); color: white; }
        .day-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: inherit; }
        .day-num { font-size: 20px; font-weight: 800; color: inherit; }
        .today-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); position: absolute; bottom: 8px; }
        .day-btn.active .today-dot { background: white; }
        .selected-date-header { margin-bottom: 20px; }
        .selected-date-header h2 { font-size: 22px; }
        .weekly-mess-list { display: flex; flex-direction: column; gap: 20px; }
        .weekly-mess-item { padding: 20px; }
        .weekly-mess-name { font-size: 18px; font-weight: 700; margin-bottom: 14px; color: var(--gray-900); }
        .weekly-meals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .no-meal-mini { padding: 20px; border-radius: var(--radius-lg); border: 1.5px dashed var(--gray-200); display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--gray-400); }
        .no-meal-mini.breakfast { background: var(--breakfast-bg); }
        .no-meal-mini.lunch { background: var(--lunch-bg); }
        .no-meal-mini.dinner { background: var(--dinner-bg); }
        .empty-state { text-align: center; padding: 60px 20px; }
        .empty-icon { font-size: 48px; display: block; margin-bottom: 14px; }
        .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
        .empty-state p { color: var(--gray-500); }
        @media (max-width: 768px) {
          .day-selector { grid-template-columns: repeat(7, 1fr); gap: 4px; }
          .day-btn { padding: 8px 4px; }
          .day-num { font-size: 15px; }
          .weekly-meals-grid { grid-template-columns: 1fr; }
          .weekly-controls { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default WeeklyMenu;
