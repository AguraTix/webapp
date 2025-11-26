import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = (location.state as any)?.token as string | undefined;
  const email = (location.state as any)?.email as string | undefined;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Missing verification token. Please restart the reset process.');
      return;
    }
    if (!email) {
      setError('Missing email address. Please restart the reset process.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await resetPassword(email, token, password);
      if (resp.success) {
        setSuccess('Password reset successful. You can now sign in.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(resp.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
      <p className="text-[#CDCDE0] text-sm mb-6">Enter the new password for your account{email ? ` (${email})` : ''}</p>
      {error && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-3 p-3 bg-green-900/20 border border-green-500 rounded-md text-green-400 text-sm">{success}</div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none" />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none" />
        <button type="submit" disabled={isLoading} className="bg-primary text-white rounded-full py-3 font-semibold text-lg mt-2 hover:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Saving...' : 'Save Password'}</button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;