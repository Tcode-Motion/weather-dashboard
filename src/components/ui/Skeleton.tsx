/* ── Skeleton — Loading placeholder ── */

import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({ width = '100%', height = '20px', borderRadius, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
      role="presentation"
    />
  );
}

export function SkeletonCard({ height = '200px' }: { height?: string }) {
  return (
    <div className="glass-card skeleton-card" style={{ height }}>
      <Skeleton width="40%" height="24px" />
      <Skeleton width="60%" height="16px" />
      <Skeleton width="80%" height="16px" />
      <Skeleton width="100%" height="60px" />
    </div>
  );
}
