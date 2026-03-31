import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OwnerProfile = () => {
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', location: { address: '', city: '' },
    contact: { phone: '', email: '', whatsapp: '' },
    pricing: { breakfast: '', lunch: '', dinner: '', monthly: '' },
    timing: {
      breakfast: { open: '', close: '' },
      lunch: { open: '', close: '' },
      dinner: { open: '', close: '' }
    },
    cuisine: [], mealTypes: [], isVeg: false,
    amenities: '', tags: '', coverImage: ''
  });

  const cuisineOptions = ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Street Food', 'Veg Only', 'Non-Veg Available', 'Jain Food'];
  const mealTypeOptions = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    api.get('/messes/my-mess').then(({ data }) => {
      if (data.mess) {
        const m = data.mess;
        setMess(m);
        setForm({
          name: m.name || '',
          description: m.description || '',
          location: m.location || { address: '', city: '' },
          contact: m.contact || { phone: '', email: '', whatsapp: '' },
          pricing: { breakfast: m.pricing?.breakfast || '', lunch: m.pricing?.lunch || '', dinner: m.pricing?.dinner || '', monthly: m.pricing?.monthly || '' },
          timing: {
            breakfast: m.timing?.breakfast || { open: '', close: '' },
            lunch: m.timing?.lunch || { open: '', close: '' },
            dinner: m.timing?.dinner || { open: '', close: '' }
          },
          cuisine: m.cuisine || [],
          mealTypes: m.mealTypes || [],
          isVeg: m.isVeg || false,
          amenities: (m.amenities || []).join(', '),
          tags: (m.tags || []).join(', '),
          coverImage: m.coverImage || ''
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        pricing: { breakfast: Number(form.pricing.breakfast) || 0, lunch: Number(form.pricing.lunch) || 0, dinner: Number(form.pricing.dinner) || 0, monthly: Number(form.pricing.monthly) || 0 }
      };
      if (mess) {
        await api.put(`/messes/${mess._id}`, payload);
        toast.success('Mess profile updated!');
      } else {
        await api.post('/messes', payload);
        toast.success('Mess profile created!');
      }
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const toggleCuisine = (c) => setForm(p => ({ ...p, cuisine: p.cuisine.includes(c) ? p.cuisine.filter(x => x !== c) : [...p.cuisine, c] }));
  const toggleMealType = (t) => setForm(p => ({ ...p, mealTypes: p.mealTypes.includes(t) ? p.mealTypes.filter(x => x !== t) : [...p.mealTypes, t] }));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="owner-profile-page">
      <div className="dashboard-header">
        <div className="container">
          <h1>{mess ? 'Edit Mess Profile' : 'Create Mess Profile'}</h1>
          <p>{mess ? 'Update your mess information' : 'Set up your mess to get started'}</p>
        </div>
      </div>
      <div className="container-sm dashboard-body">
        <div className="card profile-form">
          {/* Basic Info */}
          <section className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid-2">
              <div className="input-group span-2">
                <label>Mess Name *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Annapurna Mess" />
              </div>
              <div className="input-group span-2">
                <label>Description</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell students about your mess…" />
              </div>
              <div className="input-group span-2">
                <label>Cover Image URL</label>
                <input className="input-field" value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="form-section">
            <h3>Location</h3>
            <div className="form-grid-2">
              <div className="input-group span-2">
                <label>Address *</label>
                <input className="input-field" value={form.location.address} onChange={e => setForm(p => ({ ...p, location: { ...p.location, address: e.target.value } }))} placeholder="FC Road, Near Garware College" />
              </div>
              <div className="input-group">
                <label>City *</label>
                <input className="input-field" value={form.location.city} onChange={e => setForm(p => ({ ...p, location: { ...p.location, city: e.target.value } }))} placeholder="Pune" />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="form-section">
            <h3>Contact</h3>
            <div className="form-grid-2">
              <div className="input-group"><label>Phone</label><input className="input-field" value={form.contact.phone} onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, phone: e.target.value } }))} placeholder="9876543210" /></div>
              <div className="input-group"><label>Email</label><input className="input-field" value={form.contact.email} onChange={e => setForm(p => ({ ...p, contact: { ...p.contact, email: e.target.value } }))} placeholder="mess@email.com" /></div>
            </div>
          </section>

          {/* Pricing */}
          <section className="form-section">
            <h3>Pricing (₹)</h3>
            <div className="form-grid-4">
              {['breakfast', 'lunch', 'dinner', 'monthly'].map(t => (
                <div key={t} className="input-group">
                  <label>{t.charAt(0).toUpperCase() + t.slice(1)}</label>
                  <input type="number" className="input-field" value={form.pricing[t]} onChange={e => setForm(p => ({ ...p, pricing: { ...p.pricing, [t]: e.target.value } }))} placeholder="0" />
                </div>
              ))}
            </div>
          </section>

          {/* Cuisine & Meal Types */}
          <section className="form-section">
            <h3>Cuisine & Meal Types</h3>
            <div className="input-group">
              <label>Cuisine</label>
              <div className="chip-group">
                {cuisineOptions.map(c => (
                  <button key={c} type="button" className={`chip ${form.cuisine.includes(c) ? 'active' : ''}`} onClick={() => toggleCuisine(c)}>{c}</button>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label>Meal Types Served</label>
              <div className="chip-group">
                {mealTypeOptions.map(t => (
                  <button key={t} type="button" className={`chip ${form.mealTypes.includes(t) ? 'active' : ''}`} onClick={() => toggleMealType(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
            </div>
            <div className="checkbox-row">
              <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={e => setForm(p => ({ ...p, isVeg: e.target.checked }))} />
              <label htmlFor="isVeg">Pure Vegetarian Mess 🌿</label>
            </div>
          </section>

          {/* Amenities & Tags */}
          <section className="form-section">
            <h3>Extras</h3>
            <div className="input-group">
              <label>Amenities (comma separated)</label>
              <input className="input-field" value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} placeholder="RO Water, AC Dining, WiFi, Parking" />
            </div>
            <div className="input-group">
              <label>Tags (comma separated)</label>
              <input className="input-field" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="budget-friendly, home-style, south-indian" />
            </div>
          </section>

          <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : mess ? 'Update Profile' : 'Create Mess Profile'}
          </button>
        </div>
      </div>

      <style>{`
        .owner-profile-page { background: var(--gray-50); min-height: calc(100vh - 64px); }
        .dashboard-header { background: white; border-bottom: 1px solid var(--gray-200); padding: 24px 0; }
        [data-theme="dark"] .dashboard-header { background: var(--gray-100); }
        .dashboard-header h1 { font-size: 24px; margin-bottom: 4px; }
        .dashboard-header p { font-size: 14px; color: var(--gray-500); }
        .dashboard-body { padding: 28px 0 60px; }
        .profile-form { padding: 32px; }
        .form-section { margin-bottom: 28px; padding-bottom: 28px; border-bottom: 1px solid var(--gray-200); }
        .form-section:last-of-type { border-bottom: none; }
        .form-section h3 { font-size: 16px; margin-bottom: 16px; color: var(--gray-800); }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .span-2 { grid-column: span 2; }
        .chip-group { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { padding: 6px 14px; border-radius: 99px; border: 1.5px solid var(--gray-200); background: white; font-size: 13px; color: var(--gray-600); cursor: pointer; transition: var(--transition); font-weight: 500; }
        [data-theme="dark"] .chip { background: var(--gray-200); }
        .chip.active { background: var(--primary-bg); border-color: var(--primary); color: var(--primary); font-weight: 700; }
        .checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; margin-top: 10px; }
        .checkbox-row input { width: 16px; height: 16px; accent-color: var(--primary); }
        @media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } .span-2 { grid-column: 1; } .form-grid-4 { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
};

export default OwnerProfile;
