import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const observerRef = useRef(null);

    useEffect(() => {
        if (!loading && user) {
            navigate('/app', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.scroll-reveal').forEach((el) => {
            observerRef.current.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, []);

    return (
        <article className="landing-page">
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-grid"></div>
                </div>
                <div className="hero-content scroll-reveal">
                    <h1 className="hero-title">
                        <span className="title-line">Secure Your</span>
                        <span className="title-line accent">Digital Identity</span>
                    </h1>
                    <p className="hero-description">
                        Open-source two-factor authentication with client-side encryption.
                        Your secrets never leave your browser unencrypted.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn-primary">
                            Get Started
                            <span className="btn-arrow">→</span>
                        </Link>
                        <Link to="/about" className="btn-secondary">
                            Learn More
                        </Link>
                    </div>
                </div>
                <div className="hero-visual scroll-reveal">
                    <img
                        src="/images/hero-illustration.jpg"
                        alt="Security illustration showing encrypted authentication with shield and lock icons"
                        className="hero-image"
                    />
                </div>
            </section>

            <section className="features-section">
                <div className="section-header scroll-reveal">
                    <span className="section-label">Features</span>
                    <h2 className="section-title">Everything you need for secure 2FA</h2>
                    <p className="section-description">
                        Built with security and privacy at its core
                    </p>
                </div>

                <div className="features-grid">
                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/encryption.png"
                                alt="Encryption icon - padlock with key representing client-side encryption"
                            />
                        </div>
                        <h3>Client-Side Encryption</h3>
                        <p>Your secrets are encrypted in your browser using AES-GCM before storage. We can never see them.</p>
                    </article>

                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/protocols.png"
                                alt="Protocol icon - interconnected nodes representing multiple authentication protocols"
                            />
                        </div>
                        <h3>Multi-Protocol Support</h3>
                        <p>Compatible with TOTP, HOTP, and Steam authenticators. Works with most 2FA providers.</p>
                    </article>

                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/qr-scanner.png"
                                alt="QR scanner icon - camera with QR code overlay for scanning"
                            />
                        </div>
                        <h3>QR Code Scanning</h3>
                        <p>Add accounts instantly by scanning QR codes with your camera. Fast and easy setup.</p>
                    </article>

                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/backup.png"
                                alt="Backup icon - cloud with download arrow and lock for secure backups"
                            />
                        </div>
                        <h3>Encrypted Backups</h3>
                        <p>Export and import your data securely. Password-protected backup files keep you safe.</p>
                    </article>

                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/categories.png"
                                alt="Categories icon - organized folder structure for account organization"
                            />
                        </div>
                        <h3>Categories</h3>
                        <p>Organize your accounts into custom categories. Find what you need instantly.</p>
                    </article>

                    <article className="feature-card scroll-reveal">
                        <div className="feature-icon">
                            <img
                                src="/images/icons/dark-mode.png"
                                alt="Dark mode icon - moon symbol representing dark theme interface"
                            />
                        </div>
                        <h3>Beautiful Dark Theme</h3>
                        <p>A stunning dark interface designed for comfortable viewing day or night.</p>
                    </article>
                </div>
            </section>

            <section className="security-section">
                <div className="security-content">
                    <div className="security-text scroll-reveal">
                        <span className="section-label">Security</span>
                        <h2 className="section-title">Your privacy is our priority</h2>
                        <p>
                            Kevlify uses the Web Crypto API for client-side encryption. Your authentication
                            secrets are encrypted using AES-GCM with keys derived from your password via
                            PBKDF2 with 100,000 iterations.
                        </p>
                        <p>
                            The encrypted data is stored on our servers, but without your encryption password,
                            it cannot be decrypted — not even by us.
                        </p>
                        <ul className="security-list">
                            <li>
                                <span className="check-icon">✓</span>
                                AES-256-GCM encryption
                            </li>
                            <li>
                                <span className="check-icon">✓</span>
                                PBKDF2 key derivation
                            </li>
                            <li>
                                <span className="check-icon">✓</span>
                                Zero-knowledge architecture
                            </li>
                            <li>
                                <span className="check-icon">✓</span>
                                Open source code
                            </li>
                        </ul>
                    </div>
                    <div className="security-visual scroll-reveal">
                        <img
                            src="/images/about/security-shield.png"
                            alt="Security shield illustration with checkmark representing protected authentication"
                        />
                    </div>
                </div>
            </section>

            <section className="cta-section scroll-reveal">
                <div className="cta-content">
                    <h2>Ready to secure your accounts?</h2>
                    <p>Join thousands of users who trust Kevlify for their 2FA needs.</p>
                    <Link to="/register" className="btn-primary large">
                        Create Free Account
                        <span className="btn-arrow">→</span>
                    </Link>
                </div>
            </section>
        </article>
    );
}

export default Home;
