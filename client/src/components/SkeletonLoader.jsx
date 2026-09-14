import React from 'react';

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-poster skeleton-shimmer"></div>
      <div className="skeleton-meta">
        <div className="skeleton-line title skeleton-shimmer"></div>
        <div className="skeleton-line subtitle skeleton-shimmer"></div>
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="skeleton-hero skeleton-shimmer" aria-hidden="true">
      <div className="skeleton-hero-content">
        <div className="skeleton-badge skeleton-shimmer"></div>
        <div className="skeleton-title skeleton-shimmer"></div>
        <div className="skeleton-line meta skeleton-shimmer"></div>
        <div className="skeleton-line desc skeleton-shimmer"></div>
        <div className="skeleton-line desc short skeleton-shimmer"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-btn skeleton-shimmer"></div>
          <div className="skeleton-btn skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 6 }) {
  return (
    <div className="skeleton-row-container" aria-hidden="true">
      <div className="skeleton-row-header">
        <div className="skeleton-row-title skeleton-shimmer"></div>
      </div>
      <div className="skeleton-row-cards">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'row', count }) {
  if (type === 'hero') return <SkeletonHero />;
  if (type === 'grid') return <SkeletonGrid count={count} />;
  return <SkeletonRow count={count} />;
}
