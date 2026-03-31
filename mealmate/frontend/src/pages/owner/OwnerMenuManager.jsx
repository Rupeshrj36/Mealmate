import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, addDays, subDays } from 'date-fns';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const OwnerMenuManager = () => {
  const [date, setDate] = useState(new Date());
  const [menus, setMenus] = useState({});
  const [editingMenu, setEditingMenu] = useState(null);
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const emptyForm = () => ({ mealType: 'lunch', items: [{ name: '', isVeg: true }], price: '', isSpecial: false, specialNote: '', image: '' });
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { fetchMess(); }, []);
  useEffect(() => { if (mess) fetchMenus(); }, [date, mess]);

  const fetchMess = async () => {
    try {
      const { data } = await api.get('/messes/my-mess');
      setMess(data.mess);
    } catch {} finally { setLoading(false); }
  };

  const fetchMenus = async () => {
    try {
      const d = format(date, 'yyyy-MM-dd');
      const { data } = await api.get(`/menus/my-menus?startDate=${d}&endDate=${d}`);
      const g = {};
      data.menus.forEach(m => { g[m.mealType] = m; });
      setMenus(g);
    } catch {}
  };

  const openCreateForm = (mealType) => {
    setForm({ ...emptyForm(), mealType });
    setEditingMenu(null);
  };

  const openEditForm = (menu) => {
    setForm({
      mealType: menu.mealType,
      items: menu.items.map(i => ({ name: i.name, isVeg: i.isVeg })),
      price: menu.price || '',
      isSpecial: menu.isSpecial || false,
      specialNote: menu.specialNote || '',
      image: menu.image || ''
    });
    setEditingMenu(menu._id);
  };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { name: '', isVeg: true }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => setForm(p => ({
    ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [key]: val } : it)
  }));

  const handleSave = async () => {
    if (!form.items.some(i => i.name.trim())) { toast.error('Add at least one menu item'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        date: format(date, 'yyyy-MM-dd'),
        items: form.items.filter(i => i.name.trim()),
        price: form.price ? Number(form.price) : undefined
      };
      if (editingMenu) {
        await api.put(`/menus/${editingMenu}`, payload);
        toast.success('Menu updated!');
      } else {
        await api.post('/menus', payload);
        toast.success('Menu posted!');
      }
      setEditingMenu(null);
      setForm(emptyForm());
      fetchMenus();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Delete this menu?')) return;
    try {
      await api.delete(`/menus/${menuId}`);
      toast.success('Menu deleted');
      fetchMenus();
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!mess) return (
    <div className="empty-state" style={{ padding: '80px 20px' }}>
      <span className="empty-icon">🏪</span>
      <h3>No Mess Profile Found</h3>
      <p>Create your mess profile first from the dashboard.</p>
    </div>
  );

  const isEditing = editingMenu !== null || Object.keys(form).some((k, i) => i === 0);
  const showForm = editingMenu !== null || (form.items[0]?.name !== undefined && !menus[form.mealType]);

  return (
    <div className="menu-manager">
      <div className="dashboard-header">
        <div className="container">
          <h1>Menu Manager</h1>
          <p>Manage daily menus for {mess.name}</p>
        </div>
      </div>

      <div className="container dashboard-body">
        {/* Date Nav */}
        <div className="date-nav card">
          <button className="btn btn-secondary btn-sm" onClick={() => setDate(d => subDays(d, 1))}>← Prev Day</button>
          <div className="date-center">
            <input type="date" className="date-input" value={format(date, 'yyyy-MM-dd')} onChange={e => setDate(new Date(e.target.value))} />
            <span className="date-day">{format(date, 'EEEE, MMMM d')}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setDate(d => addDays(d, 1))}>Next Day →</button>
        </div>

        <div className="menu-manager-grid">
          {/* Existing Menus */}
          <div className="meals-column">
            <h2 className="column-title">Posted Menus</h2>
            {MEAL_TYPES.map(type => (
              <div key={type} className={`meal-slot-card card meal-type-${type}`}>
                <div className="meal-slot-header">
                  <div className="flex gap-8 align-center">
                    <span>{type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : '🌙'}</span>
                    <h3 className="meal-slot-title">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                  </div>
                  {menus[type]
                    ? (
                      <div className="flex gap-8">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditForm(menus[type])}><FiEdit size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(menus[type]._id)}><FiTrash2 size={13} /></button>
                      </div>
                    )
                    : <button className="btn btn-primary btn-sm" onClick={() => openCreateForm(type)}><FiPlus size={13} /> Add</button>
                  }
                </div>
                {menus[type] ? (
                  <div className="meal-items-list">
                    {menus[type].items.map((item, i) => (
                      <div key={i} className="meal-item-row">
                        <span className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                    {menus[type].price && <div className="meal-price-tag">₹{menus[type].price}</div>}
                    {menus[type].isSpecial && <div className="special-tag">⚡ Special</div>}
                  </div>
                ) : (
                  <div className="no-menu-placeholder">No menu posted for {type}</div>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="form-column">
            <div className="card form-card">
              <h2 className="column-title">{editingMenu ? 'Edit Menu' : 'Add Menu'}</h2>

              <div className="input-group">
                <label>Meal Type</label>
                <select className="input-field" value={form.mealType} onChange={e => setForm(p => ({ ...p, mealType: e.target.value }))} disabled={!!editingMenu}>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label>Menu Items</label>
                <div className="items-builder">
                  {form.items.map((item, i) => (
                    <div key={i} className="item-builder-row">
                      <select className="veg-select" value={item.isVeg} onChange={e => updateItem(i, 'isVeg', e.target.value === 'true')}>
                        <option value="true">🟢</option>
                        <option value="false">🔴</option>
                      </select>
                      <input type="text" className="input-field" placeholder={`Item ${i + 1}`} value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                      {form.items.length > 1 && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)}><FiX /></button>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={addItem}><FiPlus /> Add Item</button>
                </div>
              </div>

              <div className="input-group">
                <label>Price (₹)</label>
                <input type="number" className="input-field" placeholder="e.g. 120" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>

              <div className="input-group">
                <label>Image URL (optional)</label>
                <input type="url" className="input-field" placeholder="https://..." value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />
              </div>

              <div className="checkbox-row">
                <input type="checkbox" id="isSpecial" checked={form.isSpecial} onChange={e => setForm(p => ({ ...p, isSpecial: e.target.checked }))} />
                <label htmlFor="isSpecial">Mark as Special</label>
              </div>

              {form.isSpecial && (
                <div className="input-group">
                  <label>Special Note</label>
                  <input type="text" className="input-field" placeholder="e.g. Festival Special" value={form.specialNote} onChange={e => setForm(p => ({ ...p, specialNote: e.target.value }))} />
                </div>
              )}

              <div className="form-btns">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  <FiSave /> {saving ? 'Saving…' : editingMenu ? 'Update Menu' : 'Post Menu'}
                </button>
                {editingMenu && (
                  <button className="btn btn-ghost" onClick={() => { setEditingMenu(null); setForm(emptyForm()); }}>
                    <FiX /> Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .menu-manager { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dashboard-body { padding: 24px 0 60px; }
        .date-nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; margin-bottom: 20px; gap: 12px; }
        .date-center { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .date-input { border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); padding: 6px 10px; font-size: 14px; outline: none; }
        .date-day { font-size: 13px; font-weight: 600; color: var(--gray-600); }
        .menu-manager-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
        .column-title { font-size: 18px; margin-bottom: 16px; }
        .meals-column { display: flex; flex-direction: column; gap: 16px; }
        .meal-slot-card { padding: 18px; border-top: 3px solid; }
        .meal-type-breakfast { border-top-color: var(--breakfast); }
        .meal-type-lunch { border-top-color: var(--lunch); }
        .meal-type-dinner { border-top-color: var(--dinner); }
        .meal-slot-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .align-center { align-items: center; }
        .meal-slot-title { font-size: 15px; font-weight: 700; text-transform: capitalize; }
        .meal-items-list { display: flex; flex-direction: column; gap: 6px; }
        .meal-item-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .veg-dot { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
        .veg-dot.veg { background: #20BF6B; }
        .veg-dot.nonveg { background: var(--error); }
        .meal-price-tag { margin-top: 8px; font-size: 14px; font-weight: 700; color: var(--gray-700); }
        .special-tag { display: inline-flex; align-items: center; gap: 4px; background: #FFF8E1; color: #956900; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; margin-top: 6px; }
        .no-menu-placeholder { font-size: 13px; color: var(--gray-400); padding: 8px 0; }
        .form-card { padding: 24px; position: sticky; top: 80px; }
        .items-builder { display: flex; flex-direction: column; gap: 8px; }
        .item-builder-row { display: flex; align-items: center; gap: 8px; }
        .veg-select { width: 52px; padding: 10px 4px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 16px; text-align: center; background: white; cursor: pointer; }
        [data-theme="dark"] .veg-select { background: var(--gray-200); }
        .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
        .checkbox-row input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }
        .form-btns { display: flex; gap: 10px; margin-top: 8px; }
        @media (max-width: 900px) { .menu-manager-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default OwnerMenuManager;
