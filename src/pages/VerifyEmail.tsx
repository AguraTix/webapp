import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmVerificationCode, resendVerificationCode } from '../api/auth';

const VerifyEmail = () => {
    const [codes, setCodes] = useState(['', '', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email as string | undefined;

    const handleChange = (idx: number, value: string) => {
        if (value.length > 1) return;
        const onlyDigits = value.replace(/[^0-9]/g, '');
        setCodes(prev => prev.map((c, i) => (i === idx ? onlyDigits : c)));

        // Auto-focus next input
        if (onlyDigits && idx < 4) {
            const nextInput = document.getElementById(`code-${idx + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !codes[idx] && idx > 0) {
            const prevInput = document.getElementById(`code-${idx - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email) {
            setError('Email address is missing. Please go back and try again.');
            return;
        }

        const token = codes.join('');
        if (token.length < codes.length) {
            setError('Please enter the full verification code.');
            return;
        }

        setIsLoading(true);
        try {
            const resp = await confirmVerificationCode(email, token);
            if (resp.success) {
                setSuccess('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(resp.error || 'Invalid verification code.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setError(null);
        setSuccess(null);
        try {
            const resp = await resendVerificationCode(email);
            if (resp.success) {
                setSuccess('Verification code resent successfully.');
            } else {
                setError(resp.error || 'Failed to resend code.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-xl font-bold text-white mb-2">Verify Email Address</h2>
            <p className="text-[#CDCDE0] text-sm mb-6">We sent a verification code to your email{email ? ` (${email})` : ''}. Enter it below to continue.</p>

            {error && (
                <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">{error}</div>
            )}
            {success && (
                <div className="mb-3 p-3 bg-green-900/20 border border-green-500 rounded-md text-green-400 text-sm">{success}</div>
            )}

            <form className="flex flex-col gap-6 items-center" onSubmit={handleSubmit}>
                <div className="flex gap-3 mb-2">
                    {codes.map((code, idx) => (
                        <input
                            key={idx}
                            id={`code-${idx}`}
                            type="text"
                            maxLength={1}
                            value={code}
                            onChange={e => handleChange(idx, e.target.value)}
                            onKeyDown={e => handleKeyDown(idx, e)}
                            className="w-12 h-12 text-center text-xl font-bold bg-[#23232B] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary text-white rounded-full py-3 px-8 font-semibold text-lg hover:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button type="button" onClick={handleResend} className="text-sm text-gray-400 hover:text-primary">Resend code</button>
            </form>
        </AuthLayout>
    );
};

export default VerifyEmail;
