import React from 'react';
import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Film,
  title = "No movies found",
  description = "Try adjusting your search query or browse our trending catalog.",
  actionText = "Explore Movies",
  actionLink = "/",
  onActionClick
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrapper">
        <Icon size={44} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary empty-state-btn">
            {actionText}
          </Link>
        ) : onActionClick ? (
          <button
            type="button"
            onClick={onActionClick}
            className="btn btn-primary empty-state-btn"
          >
            {actionText}
          </button>
        ) : null
      )}
    </div>
  );
}
