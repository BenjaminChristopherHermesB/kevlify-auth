import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer role="contentinfo">
            <div className="footer-content">
                <div className="footer-brand">
                    <img src="/images/logos/logo_small.png" alt="Kevlify Logo" />
                    <span>Kevlify</span>
                </div>
                <nav className="footer-links" aria-label="Footer navigation">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <a href="https://github.com/BenjaminChristopherHermesB/kevlify-auth" target="_blank" rel="noopener noreferrer">GitHub</a>
                </nav>
                <p className="footer-copyright">
                    Copyright &copy;{year}, All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
