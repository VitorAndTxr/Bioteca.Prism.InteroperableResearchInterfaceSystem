/**
 * Login Screen
 * Based on IRIS Design System - Figma node 6804-13742
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context';
import { Button } from '../../design-system/components/button';
import { Input } from '../../design-system/components/input';
import './Login.css';

// Import logo and background assets
const logoSrc = '/design-system/login/dbd3d42817cc4ca74e0246b441a51dbe46407c98.svg';

export interface LoginProps {
    onLoginSuccess?: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
    const { login, authState, error, clearError } = useAuth();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Loading state
    const isLoading = authState === 'loading';

    // Form validation
    const validateEmail = (value: string): boolean => {
        if (!value.trim()) {
            setEmailError('Email é obrigatório');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Email inválido');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = (value: string): boolean => {
        if (!value) {
            setPasswordError('Senha é obrigatória');
            return false;
        }
        if (value.length < 6) {
            setPasswordError('Senha deve ter no mínimo 6 caracteres');
            return false;
        }
        setPasswordError('');
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        clearError();

        // Validate fields
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        try {
            await login({
                email,
                password,
                rememberMe
            });

            // Success callback
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            // Error is handled by AuthContext
            console.error('Login failed:', err);
        }
    };

    // Eye icon for password visibility toggle
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 10C15.4167 13.3333 12.9167 15 10 15C7.08333 15 4.58333 13.3333 2.5 10C4.58333 6.66667 7.08333 5 10 5C12.9167 5 15.4167 6.66667 17.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    const EyeSlashIcon = () => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.95 14.95C13.5625 16.0417 11.875 16.6667 10 16.6667C6.66667 16.6667 4 14.1667 2.5 10C3.23333 8.36667 4.18333 7.01667 5.35 5.95M8.25 4.43333C8.81667 4.28333 9.4 4.16667 10 4.16667C13.3333 4.16667 16 6.66667 17.5 10C16.95 11.1833 16.2917 12.2083 15.5417 13.075M11.7667 11.7667C11.5378 12.0123 11.2617 12.2093 10.9549 12.3459C10.6481 12.4825 10.317 12.556 9.98045 12.5619C9.64387 12.5678 9.31019 12.506 8.99874 12.3801C8.68729 12.2542 8.40446 12.0667 8.16714 11.8294C7.92983 11.592 7.74234 11.3092 7.61644 10.9978C7.49054 10.6863 7.42874 10.3526 7.43465 10.0161C7.44056 9.67948 7.51406 9.3484 7.65066 9.04159C7.78726 8.73477 7.98422 8.45868 8.22983 8.22983M2.5 2.5L17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );

    return (
        <div className="login-screen">
            {/* Background decorative elements */}
            <div className="login-background" />
            <div className="login-background-overlay" />

            {/* Main content container */}
            <div className="login-container">
                {/* Left side - Login form */}
                <div className="login-form-section">
                    <form className="login-form" onSubmit={handleSubmit}>
                        {/* Title */}
                        <h1 className="login-title">Entrar na I.R.I.S.</h1>

                        {/* Global error message */}
                        {error && (
                            <div className="login-error-banner" role="alert">
                                <span>{error.message}</span>
                            </div>
                        )}

                        {/* Form fields */}
                        <div className="login-form-fields">
                            {/* Email input */}
                            <Input
                                label="Login"
                                type="email"
                                placeholder="patel@gmail.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) validateEmail(e.target.value);
                                }}
                                onBlur={() => validateEmail(email)}
                                error={emailError}
                                disabled={isLoading}
                                size="big"
                                fullWidth
                                required
                                autoComplete="email"
                                autoFocus
                            />

                            {/* Password input */}
                            <Input
                                label="Senha"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) validatePassword(e.target.value);
                                }}
                                onBlur={() => validatePassword(password)}
                                error={passwordError}
                                disabled={isLoading}
                                size="big"
                                fullWidth
                                required
                                autoComplete="current-password"
                                iconRight={
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                                    </button>
                                }
                            />
                        </div>

                        {/* Remember me checkbox - Optional for future enhancement */}
                        {/* <div className="login-options">
                            <label className="login-checkbox">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span>Lembrar-me</span>
                            </label>
                        </div> */}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="big"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            Entrar
                        </Button>
                    </form>
                </div>

                {/* Right side - Logo */}
                <div className="login-logo-section">
                    <img
                        src={logoSrc}
                        alt="IRIS Logo"
                        className="login-logo"
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;
