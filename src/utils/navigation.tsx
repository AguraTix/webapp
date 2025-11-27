import { LayoutGrid, CalendarDays, Ticket, User, Users } from 'lucide-react';

export const allNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="w-5 h-5" />, rolesAllowed: ['admin', 'superadmin'] },
    { label: 'Events', path: '/events-dashboard', icon: <CalendarDays className="w-5 h-5" />, rolesAllowed: ['admin', 'superadmin'] },
    { label: 'Tickets', path: '/tickets', icon: <Ticket className="w-5 h-5" />, rolesAllowed: ['admin', 'superadmin'] },
    { label: 'Admin List', path: '/admin-list', icon: <Users className="w-5 h-5" />, rolesAllowed: ['superadmin'] },
    { label: 'Account', path: '/account', icon: <User className="w-5 h-5" />, rolesAllowed: ['admin', 'superadmin'] },
];
