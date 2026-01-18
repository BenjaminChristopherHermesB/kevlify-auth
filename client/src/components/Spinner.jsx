import React from 'react';

function Spinner({ size = 'medium', message = 'Loading...' }) {
    return (
        <div className={`spinner-container ${size}`} role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true"></div>
            <span className="spinner-text">{message}</span>
        </div>
    );
}

export default Spinner;
