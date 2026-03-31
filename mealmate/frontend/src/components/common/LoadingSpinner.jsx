import React from 'react';

export const LoadingSpinner = ({ size = 36, center = false }) => {
  const spinner = (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid var(--gray-200)`,
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0
      }}
    />
  );
  if (center) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        {spinner}
      </div>
    );
  }
  return spinner;
};

export const PageLoader = () => (
  <div style={{
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16
  }}>
    <div style={{ fontSize: 40 }}>🍽️</div>
    <LoadingSpinner size={32} />
    <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Loading MealMate…</p>
  </div>
);

export default LoadingSpinner;
