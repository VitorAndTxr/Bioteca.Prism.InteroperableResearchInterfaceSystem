/**
 * Login Screen
 * Based on IRIS Design System - Figma node 6804-13742
 */

import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context';
import { Button } from '../../design-system/components/button';
import { Input } from '../../design-system/components/input';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import './Login.css';

// Import logo and background assets
const logoSrc = '/assets/logo.svg';

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
        console.log('[LoginScreen] 🎯 Form submitted');
        console.log('[LoginScreen]    Email:', email);
        console.log('[LoginScreen]    Password length:', password.length);

        // Clear previous errors
        clearError();

        // Validate fields
        console.log('[LoginScreen]    Validating email...');
        const isEmailValid = validateEmail(email);
        console.log('[LoginScreen]    Email valid:', isEmailValid);

        console.log('[LoginScreen]    Validating password...');
        const isPasswordValid = validatePassword(password);
        console.log('[LoginScreen]    Password valid:', isPasswordValid);

        if (!isEmailValid || !isPasswordValid) {
            console.log('[LoginScreen]    ❌ Validation failed, aborting login');
            return;
        }

        console.log('[LoginScreen]    ✅ Validation passed, calling login()...');

        try {
            await login({
                email,
                password,
                rememberMe
            });

            console.log('[LoginScreen]    ✅ Login successful!');

            // Success callback
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            // Error is handled by AuthContext
            console.error('[LoginScreen]    ❌ Login failed:', err);
        }
    };


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
                                        {showPassword ? (
                                            <EyeIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        )}
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
