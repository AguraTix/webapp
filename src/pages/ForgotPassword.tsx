import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setIsLoading(true);
    try {
      const resp = await forgotPassword(identifier);
      if (resp.success) {
        setSuccess('Verification code sent successfully.');
        setTimeout(() => navigate('/verify-account', { state: { email: identifier } }), 1200);
      } else {
        setError(resp.error || 'Failed to send verification code.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-white mb-2">Forgot Password</h2>
      <p className="text-[#CDCDE0] text-sm mb-6">Enter your email to receive the reset verification code</p>

      {error && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-3 p-3 bg-green-900/20 border border-green-500 rounded-md text-green-400 text-sm">{success}</div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
          className="bg-primary text-white rounded-full py-3 font-semibold text-lg mt-2 hover:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;