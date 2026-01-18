import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    async function handleLogout() {
        setIsProfileOpen(false);
        await logout();
        navigate('/');
    }

    return (
        <header role="banner">
            <div className="headerLeft">
                <Link to="/" aria-label="Go to homepage">
                    <img src="/images/logos/logo_small.png" alt="Kevlify Logo" />
                </Link>
                <h1 id="heading">Kevlify</h1>
            </div>

            <button
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
            >
                <span className="hamburger"></span>
            </button>

            <nav className={`headerNav ${isMenuOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
                <ul className="headerRight">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    {user ? (
                        <>
                            <li><Link to="/app">Authenticator</Link></li>
                            <li className="profile-menu" ref={profileRef}>
                                <button
                                    className="profile-btn"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    aria-label="User menu"
                                    aria-expanded={isProfileOpen}
                                >
                                    {user.email?.[0]?.toUpperCase() || 'U'}
                                </button>
                                {isProfileOpen && (
                                    <div className="popup_menu profile-dropdown" role="menu">
                                        <ul>
                                            <li role="menuitem">
                                                <Link to="/settings" onClick={() => setIsProfileOpen(false)}>Settings</Link>
                                            </li>
                                            <li role="menuitem" onClick={handleLogout}>Logout</li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login"><button className="std-btn">Login</button></Link></li>
                            <li><Link to="/register"><button className="std-btn primary">Register</button></Link></li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
