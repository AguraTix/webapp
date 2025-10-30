import React from 'react';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full flex">
    {/* Left: Background image and heading */}
    <div className="hidden md:flex flex-1 items-center justify-center bg-black relative">
      <img src="/event1.png" alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="relative z-10 flex flex-col items-start justify-center px-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Enjoy Endless Events Experiences<br />with{' '}
          <span className="relative inline-block align-baseline">
            <span className="text-primary">Agura</span>
            <svg width="80" height="18" viewBox="0 0 80 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 -bottom-2">
              <path d="M5 15 Q40 25 75 5" stroke="#E6007A" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="text-white text-sm max-w-xs">
          Discover, purchase, and enjoy tickets for your favorite events on our seamless platform.
        </p>
      </div>
    </div>
    {/* Right: Form content */}
    <div className="flex-1 flex items-center justify-center bg-[#18181B]">
      <div className="w-full max-w-md p-8">{children}</div>
    </div>
  </div>
);

export default AuthLayout; 