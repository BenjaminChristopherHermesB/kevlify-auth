import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            onClose();
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2 id="modal-title">{title}</h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
