import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      const dest = data.user.role === 'admin' ? '/admin' : data.user.role === 'owner' ? '/owner' : '/student';
      navigate(dest);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      admin: { email: 'admin@mealmate.com', password: 'admin123' },
      owner: { email: 'rajesh@mealmate.com', password: 'owner123' },
      student: { email: 'arjun@student.com', password: 'student123' }
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-scale">
        <div className="auth-logo">🍽️</div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your MealMate account</p>

        <div className="demo-btns">
          <span className="demo-label">Quick Demo:</span>
          {['admin', 'owner', 'student'].map(r => (
            <button key={r} className="btn btn-secondary btn-sm" onClick={() => fillDemo(r)}>{r}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" />
              <input type="email" className="input-field input-with-icon" placeholder="you@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input type={showPass ? 'text' : 'password'} className="input-field input-with-icon" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
      <AuthStyles />
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(data.message || 'Registered successfully!');
      const dest = form.role === 'owner' ? '/owner' : '/student';
      navigate(dest);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-scale" style={{ maxWidth: 480 }}>
        <div className="auth-logo">🍽️</div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join MealMate today</p>

        <div className="role-selector">
          {[{ v: 'student', l: '🎓 Student', d: 'Browse & rate messes' }, { v: 'owner', l: '🏪 Mess Owner', d: 'Manage your mess' }].map(r => (
            <button
              key={r.v}
              type="button"
              className={`role-btn ${form.role === r.v ? 'active' : ''}`}
              onClick={() => setForm(p => ({ ...p, role: r.v }))}
            >
              <span className="role-label">{r.l}</span>
              <span className="role-desc">{r.d}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" className="input-field" placeholder="Arjun Singh"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" className="input-field" placeholder="you@email.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-icon-wrap">
              <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          {form.role === 'student' && (
            <div className="input-group">
              <label>College</label>
              <input type="text" className="input-field" placeholder="MIT Pune"
                value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))} />
            </div>
          )}
          <div className="input-group">
            <label>Phone (optional)</label>
            <input type="tel" className="input-field" placeholder="9876543210"
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          {form.role === 'owner' && (
            <div className="owner-note">
              ℹ️ Owner accounts require admin approval before you can post menus.
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
      <AuthStyles />
    </div>
  );
};

const AuthStyles = () => (
  <style>{`
    .auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: linear-gradient(135deg, var(--primary-bg), white, var(--dinner-bg)); }
    [data-theme="dark"] .auth-page { background: linear-gradient(135deg, #1A0E0B, var(--gray-50), #0A0F1A); }
    .auth-card { padding: 40px; max-width: 440px; width: 100%; }
    .auth-logo { font-size: 40px; text-align: center; margin-bottom: 12px; }
    .auth-title { font-size: 26px; text-align: center; margin-bottom: 6px; }
    .auth-subtitle { text-align: center; color: var(--gray-500); font-size: 14px; margin-bottom: 20px; }
    .demo-btns { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; background: var(--gray-100); padding: 10px 12px; border-radius: var(--radius-md); }
    .demo-label { font-size: 12px; font-weight: 700; color: var(--gray-500); text-transform: uppercase; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .input-icon-wrap { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
    .input-with-icon { padding-left: 38px; }
    .input-icon-right { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--gray-400); cursor: pointer; padding: 4px; }
    .auth-switch { text-align: center; font-size: 14px; color: var(--gray-500); margin-top: 20px; }
    .auth-switch a { color: var(--primary); font-weight: 600; }
    .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .role-btn { padding: 14px 12px; border-radius: var(--radius-md); border: 2px solid var(--gray-200); background: white; text-align: center; cursor: pointer; transition: var(--transition); display: flex; flex-direction: column; gap: 4px; }
    [data-theme="dark"] .role-btn { background: var(--gray-200); }
    .role-btn.active { border-color: var(--primary); background: var(--primary-bg); }
    .role-label { font-weight: 700; font-size: 14px; }
    .role-desc { font-size: 12px; color: var(--gray-500); }
    .role-btn.active .role-label { color: var(--primary); }
    .owner-note { background: var(--dinner-bg); border: 1px solid var(--dinner-border); border-radius: var(--radius-md); padding: 12px 14px; font-size: 13px; color: #1A3A9E; }
  `}</style>
);

export default Login;
