import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function About() {
    const observerRef = useRef(null);

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
            <section className="page-hero">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                </div>
                <div className="page-hero-content scroll-reveal">
                    <span className="section-label">About Kevlify</span>
                    <h1>Building security for everyone</h1>
                    <p>
                        A free, open-source two-factor authentication app designed with
                        privacy and security at its core.
                    </p>
                </div>
            </section>

            <section className="content-section">
                <div className="two-column-layout">
                    <div className="column-text scroll-reveal">
                        <span className="section-label">Mission</span>
                        <h2>What is Kevlify?</h2>
                        <p>
                            Kevlify is a secure, web-based authenticator that generates time-based
                            one-time passwords (TOTP) and HMAC-based one-time passwords (HOTP).
                        </p>
                        <p>
                            Unlike mobile-only apps, Kevlify runs entirely in your browser with
                            client-side encryption, giving you secure access to your 2FA codes
                            from any device with an internet connection.
                        </p>
                        <p>
                            Our mission is to make strong authentication accessible to everyone
                            while maintaining the highest standards of privacy and security.
                        </p>
                    </div>
                    <div className="column-visual scroll-reveal">
                        <img
                            src="/images/logos/logo.png"
                            alt="Kevlify logo - blue shield emblem representing secure authentication"
                            className="about-logo-image"
                        />
                    </div>
                </div>
            </section>

            <section className="features-highlight-section">
                <div className="section-header scroll-reveal">
                    <span className="section-label">Capabilities</span>
                    <h2>Key Features</h2>
                </div>

                <div className="highlight-grid">
                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">01</div>
                        <h3>Compatibility</h3>
                        <p>
                            Works with most providers and accounts supporting TOTP and HOTP
                            authentication protocols.
                        </p>
                    </div>

                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">02</div>
                        <h3>Backup & Restore</h3>
                        <p>
                            Backup your authenticators with strong client-side encryption.
                            Never lose access to your accounts.
                        </p>
                    </div>

                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">03</div>
                        <h3>Dark Mode</h3>
                        <p>
                            Beautiful material design inspired interface in a comfortable
                            dark theme for day and night use.
                        </p>
                    </div>

                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">04</div>
                        <h3>Service Icons</h3>
                        <p>
                            Find your authenticators easily with automatically matched
                            brand logos for popular services.
                        </p>
                    </div>

                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">05</div>
                        <h3>Categories</h3>
                        <p>
                            Organize your authenticators into custom categories for
                            quick access and better organization.
                        </p>
                    </div>

                    <div className="highlight-card scroll-reveal">
                        <div className="highlight-number">06</div>
                        <h3>Client-Side Encryption</h3>
                        <p>
                            Your secrets are encrypted in your browser before being stored.
                            Zero-knowledge architecture.
                        </p>
                    </div>
                </div>
            </section>

            <section className="security-deep-section">
                <div className="two-column-layout reverse">
                    <div className="column-visual scroll-reveal">
                        <img
                            src="/images/about/security-shield.png"
                            alt="Security shield with layered protection illustration representing encryption layers"
                        />
                    </div>
                    <div className="column-text scroll-reveal">
                        <span className="section-label">Security</span>
                        <h2>How we protect you</h2>
                        <p>
                            Kevlify uses the Web Crypto API for client-side encryption. Your
                            authentication secrets are encrypted using AES-GCM with keys derived
                            from your password via PBKDF2 with 100,000 iterations.
                        </p>
                        <p>
                            The encrypted data is stored on our servers, but without your
                            encryption password, it cannot be decrypted — not even by us.
                        </p>
                        <div className="security-specs">
                            <div className="spec-item">
                                <strong>Key Derivation</strong>
                                <span>PBKDF2 with SHA-256</span>
                            </div>
                            <div className="spec-item">
                                <strong>Iterations</strong>
                                <span>100,000</span>
                            </div>
                            <div className="spec-item">
                                <strong>Encryption</strong>
                                <span>AES-256-GCM</span>
                            </div>
                            <div className="spec-item">
                                <strong>Architecture</strong>
                                <span>Zero-Knowledge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="open-source-section">
                <div className="two-column-layout">
                    <div className="column-text scroll-reveal">
                        <span className="section-label">Open Source</span>
                        <h2>Free and transparent</h2>
                        <p>
                            Kevlify is free software distributed under the GPL-3.0 license.
                            You can view, modify, and distribute the source code.
                        </p>
                        <p>
                            We believe security software should be open and auditable.
                            Our code is available for review by anyone.
                        </p>
                        <div className="cta-buttons">
                            <a
                                href="https://github.com/kevlify/authenticator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                            >
                                View on GitHub
                            </a>
                            <Link to="/register" className="btn-primary">
                                Get Started
                                <span className="btn-arrow">→</span>
                            </Link>
                        </div>
                    </div>
                    <div className="column-visual scroll-reveal">
                        <img
                            src="/images/about/open-source.jpg"
                            alt="Open source illustration with code brackets and community collaboration symbols"
                        />
                    </div>
                </div>
            </section>
        </article>
    );
}

export default About;
