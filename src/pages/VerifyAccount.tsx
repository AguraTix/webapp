import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyAccount = () => {
  const [codes, setCodes] = useState(['', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email as string | undefined;

  const handleChange = (idx: number, value: string) => {
    if (value.length > 1) return;
    const onlyDigits = value.replace(/[^0-9]/g, '');
    setCodes(prev => prev.map((c, i) => (i === idx ? onlyDigits : c)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = codes.join('');
    if (token.length < codes.length) {
      setError('Please enter the full verification code.');
      return;
    }
    // Proceed to reset password with the token (used as reset token)
    navigate('/reset-password', { state: { token, email } });
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-white mb-2">Account Verification</h2>
      <p className="text-[#CDCDE0] text-sm mb-6">We sent a verification code to your email{email ? ` (${email})` : ''}. Enter it below to continue.</p>
      {error && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-400 text-sm">{error}</div>
      )}
      <form className="flex flex-col gap-6 items-center" onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-2">
          {codes.map((code, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={code}
              onChange={e => handleChange(idx, e.target.value)}
              className="w-12 h-12 text-center text-xl font-bold bg-[#23232B] text-white rounded-md focus:outline-none"
            />
          ))}
        </div>
        <button type="submit" className="bg-primary text-white rounded-full py-3 px-8 font-semibold text-lg hover:bg-primary/80 transition-all duration-200">Verify Code</button>
        <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-gray-400 hover:text-primary">Resend code</button>
      </form>
    </AuthLayout>
  );
};

export default VerifyAccount;