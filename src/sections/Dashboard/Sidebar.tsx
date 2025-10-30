import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, CalendarDays, Ticket, User, LogOut } from 'lucide-react';
import { logout, authUtils } from '../../api/auth';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
    { label: 'Events', path: '/events-dashboard', icon: <CalendarDays className="w-5 h-5" /> },
    { label: 'Tickets', path: '/tickets', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Account', path: '/account', icon: <User className="w-5 h-5" /> },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            authUtils.clearAuthData();
            navigate('/login', { replace: true });
        }
    };

    return (
        <aside className="hidden md:block fixed top-0 left-0 w-80 h-screen z-30 bg-black border-r border-[#23232B] py-8 px-4">
            <div className="flex px-2 mb-10 ml-6">
                <span className="items-center text-xl font-bold text-pink-600">Agura Ticketing</span>
            </div>

            <nav className="flex flex-col items-center gap-5 py-7">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold  transition-all duration-200  hover:bg-pink-600/80  ${isActive ? 'bg-pink-600 text-white' : 'text-white/80'} w-56 text-white text-lg`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout button pinned to bottom */}
            <div className="absolute bottom-6 left-0 w-full px-4">
                <button
                    onClick={handleLogout}
                    className="mx-auto flex items-center justify-center gap-2 w-56 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;