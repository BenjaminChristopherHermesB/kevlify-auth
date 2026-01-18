import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Authenticator = lazy(() => import('./pages/Authenticator'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <div className="app">
            <Header />
            <main id="main-content" className="main">
                <ErrorBoundary>
                    <Suspense fallback={<Spinner />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/app" element={
                                <ProtectedRoute><Authenticator /></ProtectedRoute>
                            } />
                            <Route path="/settings" element={
                                <ProtectedRoute><Settings /></ProtectedRoute>
                            } />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </main>
            <Footer />
        </div>
    );
}

export default App;
