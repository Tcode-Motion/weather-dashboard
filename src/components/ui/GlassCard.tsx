/* ── GlassCard — Reusable glassmorphism container ── */

import React from 'react';
import { motion } from 'framer-motion';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  delay?: number;
  onClick?: () => void;
  id?: string;
}

export default function GlassCard({ children, className = '', hoverable = true, delay = 0, onClick, id }: GlassCardProps) {
  return (
    <motion.div
      id={id}
      className={`glass-card ${hoverable ? 'glass-hoverable' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </motion.div>
  );
}
