import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import Sidebar from '../sections/Dashboard/Sidebar';
import { allNavItems } from '../utils/navigation';
import { authUtils, logout } from '../api/auth';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const userProfile = authUtils.getUserProfile();
    const userRole = userProfile?.role?.toLowerCase() || 'admin';

    const navItems = allNavItems.filter(item =>
        item.rolesAllowed.includes(userRole)
    );

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            authUtils.clearAuthData();
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-black text-opacity-35 overflow-x-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 md:hidden">
                    <div className="flex flex-col h-full bg-[#000000] w-64 p-4 border-r border-[#23232B]">
                        {/* Close Button */}
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-xl font-bold text-pink-600">Agura</span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-white hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-4 flex-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${isActive
                                            ? "bg-pink-600 text-white"
                                            : "text-white/80 hover:bg-pink-600/20"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Logout */}
                        <div className="mt-auto">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors font-semibold"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div className="flex-1" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Menu Button - Added padding when sidebar is closed */}
            <button
                className="fixed top-4 left-4 z-40 md:hidden bg-[#23232B] p-2 rounded-lg shadow-lg border border-gray-800 hover:bg-[#2a2a32] transition-colors"
                onClick={() => setSidebarOpen(true)}
            >
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Main Content - Added top padding on mobile to prevent overlap with menu button */}
            <div className="flex flex-1 w-full md:pl-80">
                <main className="flex-1 py-8 md:py-10 w-full overflow-x-hidden pt-20 md:pt-10">
                    <div className="max-w-6xl mx-auto w-full px-4 md:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;