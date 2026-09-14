import React from 'react';

export default function Loading({ message = "Loading cinematic stream..." }) {
  return (
    <div className="cinematic-loading-container" role="status" aria-live="polite">
      <div className="cinematic-loading-pulse">
        <div className="pulse-ring"></div>
        <div className="pulse-core"></div>
      </div>
      <p className="cinematic-loading-text">{message}</p>
    </div>
  );
}
