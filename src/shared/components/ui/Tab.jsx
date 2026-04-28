// src/shared/components/Tab.jsx

import { useState } from 'react';
import { motion } from 'motion/react';

const PRIMARY = '#7D27BE';

export default function Tab({ label, count, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold overflow-hidden transition-colors"
      style={{
        color: active ? '#fff' : hovered ? '#fff' : '#6b7280',
        background: active ? PRIMARY : hovered ? 'transparent' : '#f3f4f6', // ← gris cuando inactivo
        border: `2px solid ${active ? PRIMARY : hovered ? PRIMARY : '#e5e7eb'}`, // ← borde morado en hover
        zIndex: 0,
      }}
    >
      {!active && (
        <motion.span
          initial={{ width: '0%' }}
          animate={{ width: hovered ? '100%' : '0%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full"
          style={{ background: PRIMARY, zIndex: -1 }}
        />
      )}

      <span className="relative z-10">{label}</span>

      <span
        className="relative z-10 text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
        style={{
          background: active ? '#fff' : hovered ? '#fff' : '#e5e7eb',
          color: active ? PRIMARY : hovered ? PRIMARY : '#6b7280',
          transition: 'background 0.25s, color 0.25s',
        }}
      >
        {count}
      </span>
    </button>
  );
}