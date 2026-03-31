import React, { useState } from 'react';

const RatingStars = ({ value = 0, onChange, size = 24, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="rating-stars" style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          style={{
            fontSize: size,
            cursor: readOnly ? 'default' : 'pointer',
            color: s <= (hovered || value) ? 'var(--accent)' : 'var(--gray-300)',
            transition: 'color 0.15s ease',
            lineHeight: 1
          }}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(s)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default RatingStars;
