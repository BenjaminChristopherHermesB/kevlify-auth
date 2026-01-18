import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('googleSignInButton'),
                    {
                        theme: 'outline',
                        size: 'large',
                        width: 400,
                        text: 'signin_with'
                    }
                );
            }
        };

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    async function handleGoogleResponse(response) {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(response.credential);
            navigate('/app');
        } catch (err) {
            setError(err.message || 'Google Sign-In failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/app');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <article className="page auth-page">
            <section className="auth-card animate-fade-in">
                <div className="auth-header">
                    <img src="/images/logos/logo.png" alt="Kevlify Logo" className="auth-logo" />
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your authenticator</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            aria-describedby={error ? 'error-message' : undefined}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            minLength={8}
                        />
                    </div>

                    <button
                        type="submit"
                        className="std-btn primary full-width"
                        disabled={loading}
                        aria-busy={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <div id="googleSignInButton" className="google-signin-wrapper"></div>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </div>
            </section>
        </article>
    );
}

export default Login;
