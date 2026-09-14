import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-badge">404 Error</div>
        <div className="not-found-icon-wrapper">
          <Film size={60} className="not-found-icon" />
        </div>
        <h1 className="not-found-title">Lost in the Reel</h1>
        <p className="not-found-text">
          The scene or page you are looking for does not exist or has been cut from the final edit.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            <span>Back to Home</span>
          </Link>
          <Link to="/popular" className="btn btn-secondary">
            <span>Browse Popular</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
