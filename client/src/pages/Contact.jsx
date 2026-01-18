import React, { useEffect, useRef } from 'react';

function Contact() {
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
                    <span className="section-label">About Us</span>
                    <h1>Meet the team</h1>
                    <p>
                        We do not try to be perfect. We try to get better. We work in our own space,
                        learn what we can, and create things we are proud of.
                    </p>
                </div>
            </section>

            <section className="team-section-modern">
                <div className="team-member-card scroll-reveal">
                    <div className="member-photo-wrapper">
                        <img
                            src="/images/team/benjamin.jpg"
                            alt="B C H Benjamin - Software Enthusiast and Co-creator of Kevlify"
                            className="member-photo"
                        />
                    </div>
                    <div className="member-details">
                        <h2>B C H Benjamin</h2>
                        <p className="member-title">Developer</p>
                        <p className="member-bio">
                            Benjamin Christopher Hermes B | Loves Bricking His Phone |
                            Loves Annoying People | Chess Buff | Check My Rating On{' '}
                            <a href="http://chess.com/member/BenjaminBCH" target="_blank" rel="noreferrer">
                                chess.com
                            </a>
                        </p>
                        <div className="member-links">
                            <a href="mailto:1at24cs037@atria.edu" className="link-item">
                                <img
                                    src="/images/icons/email.png"
                                    alt="Email icon - envelope symbol for email contact"
                                    className="link-icon"
                                />
                                <span>1at24cs037@atria.edu</span>
                            </a>
                            <a
                                href="https://instagram.com/bchbenjamin"
                                target="_blank"
                                rel="noreferrer"
                                className="link-item"
                            >
                                <img
                                    src="/images/icons/instagram.png"
                                    alt="Instagram icon - camera symbol for Instagram profile"
                                    className="link-icon"
                                />
                                <span>@bchbenjamin</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="team-member-card reverse scroll-reveal">
                    <div className="member-photo-wrapper">
                        <img
                            src="/images/team/yogeetha.jpg"
                            alt="C Yogeetha - Co-creator of Kevlify and fitness enthusiast"
                            className="member-photo"
                        />
                    </div>
                    <div className="member-details">
                        <h2>C Yogeetha</h2>
                        <p className="member-title">Developer</p>
                        <p className="member-bio">
                            I stay lowkey | I workout | I travel when I can | I learn quietly | I am still improving
                        </p>
                        <div className="member-links">
                            <a href="mailto:1at24cs045@atria.edu" className="link-item">
                                <img
                                    src="/images/icons/email.png"
                                    alt="Email icon - envelope symbol for email contact"
                                    className="link-icon"
                                />
                                <span>1at24cs045@atria.edu</span>
                            </a>
                            <a
                                href="https://www.instagram.com/yogee._.tha/"
                                target="_blank"
                                rel="noreferrer"
                                className="link-item"
                            >
                                <img
                                    src="/images/icons/instagram.png"
                                    alt="Instagram icon - camera symbol for Instagram profile"
                                    className="link-icon"
                                />
                                <span>@yogee._.tha</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="values-section">
                <div className="section-header scroll-reveal">
                    <span className="section-label">Our Values</span>
                    <h2>What drives us</h2>
                </div>

                <div className="values-grid">
                    <div className="value-card scroll-reveal">
                        <div className="value-number">01</div>
                        <h3>Privacy First</h3>
                        <p>Your data belongs to you. We build tools that respect your privacy by design.</p>
                    </div>

                    <div className="value-card scroll-reveal">
                        <div className="value-number">02</div>
                        <h3>Open Source</h3>
                        <p>Transparency builds trust. Our code is open for anyone to review and contribute.</p>
                    </div>

                    <div className="value-card scroll-reveal">
                        <div className="value-number">03</div>
                        <h3>Continuous Learning</h3>
                        <p>We're students first. Every project is an opportunity to learn and grow.</p>
                    </div>
                </div>
            </section>

            <footer className="contact-page-footer scroll-reveal">
                <p>
                    &copy; 2025, All rights reserved. Built with passion at Atria Institute of Technology.
                </p>
                <p className="footer-note">
                    No stickers to be made out of any element of this webpage.
                </p>
            </footer>
        </article>
    );
}

export default Contact;
