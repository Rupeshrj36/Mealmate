import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <span style={{ fontSize: 72 }}>🍽️</span>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>404</h1>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', maxWidth: 360, fontSize: 15 }}>
        Looks like this page went missing — just like the last piece of gulab jamun.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/messes" className="btn btn-outline">Browse Messes</Link>
      </div>
    </div>
  );
};

export default NotFound;
