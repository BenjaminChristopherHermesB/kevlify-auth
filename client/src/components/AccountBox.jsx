import React, { useState, useEffect, useRef } from 'react';
import * as OTPAuth from 'otpauth';
import { getIconForIssuer } from '../utils/icons';

function AccountBox({ account, onDelete, onEdit }) {
    const [code, setCode] = useState('000 000');
    const [progress, setProgress] = useState(100);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [iconUrl, setIconUrl] = useState(null);
    const [iconError, setIconError] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const dynamicIcon = getIconForIssuer(account.issuer);
        if (dynamicIcon) {
            setIconUrl(dynamicIcon);
        }
    }, [account.issuer]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        let totp;
        try {
            if (account.secret_encrypted && account.secret_encrypted !== 'ERROR_DECRYPTING') {
                totp = new OTPAuth.TOTP({
                    secret: OTPAuth.Secret.fromBase32(account.secret_encrypted),
                    algorithm: ['SHA1', 'SHA256', 'SHA512'][account.algorithm] || 'SHA1',
                    digits: account.digits || 6,
                    period: account.period || 30
                });
            }
        } catch (e) {
            console.error('Invalid secret for', account.issuer, e);
        }

        const update = () => {
            if (!totp) {
                setCode('ERROR');
                return;
            }
            setCode(totp.generate());
            const period = account.period || 30;
            const now = Date.now() / 1000;
            const remaining = period - (now % period);
            setProgress((remaining / period) * 100);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [account.secret_encrypted, account.algorithm, account.digits, account.period]);

    const handleCopy = () => {
        if (!code || code === 'ERROR') return;
        navigator.clipboard.writeText(code.replace(/\s/g, ''));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        onEdit(account);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsMenuOpen(false);
        if (confirm('Are you sure you want to delete this account?')) {
            onDelete(account.id);
        }
    };

    const getDisplayIcon = () => {
        if (account.icon) return account.icon;
        if (iconUrl && !iconError) return iconUrl;
        return '/images/logos/logo_small.png';
    };

    return (
        <article
            className="account_box"
            onClick={handleCopy}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
            aria-label={`${account.issuer} account. Code: ${code}. Click to copy.`}
        >
            <div className="account-header">
                <img
                    src={getDisplayIcon()}
                    alt={`${account.issuer} icon`}
                    className="account_logo"
                    onError={() => setIconError(true)}
                />
                <div className="account-menu-wrapper" ref={menuRef}>
                    <button
                        className="account_menu"
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        aria-label="Account menu"
                        aria-expanded={isMenuOpen}
                    >
                        ⋮
                    </button>
                    {isMenuOpen && (
                        <div className="popup_menu account-popup" role="menu">
                            <ul>
                                <li role="menuitem" onClick={handleEdit}>Edit</li>
                                <li role="menuitem" className="danger" onClick={handleDelete}>Delete</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="account-issuer">{account.issuer}</h3>
            {account.username && <p className="user_id">{account.username}</p>}
            <p className="auth_code" aria-live="polite">{code.slice(0, 3)} {code.slice(3)}</p>

            <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: progress < 20 ? 'var(--color-error)' : 'var(--color-primary)'
                    }}
                />
            </div>

            <p className="copied_text" style={{ opacity: isCopied ? 1 : 0 }} aria-live="polite">
                Copied to clipboard!
            </p>
        </article>
    );
}

export default AccountBox;
