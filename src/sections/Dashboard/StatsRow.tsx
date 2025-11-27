import React, { useState, useEffect } from 'react';
import { Eye, User, Plus, Star, MoreHorizontal } from 'lucide-react';
import { getAllEvents } from '../../api/event';
import { getTicketStats } from '../../api/ticket';
import AuthHelper from '../../utils/AuthHelper';

const DiagonalUp = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
        <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const stats = [
    {
        icon: <Eye className="w-5 h-5 text-[#CDCDE0]" />,
        label: 'Events',
        value: '50.8K',
        percent: '28.4%',
        percentColor: 'bg-green-900',
        fontColor: 'text-green-400',
        borderColor: 'border border-green-400',
        isUp: true,
    },
    {
        icon: <User className="w-5 h-5 text-[#CDCDE0]" />,
        label: 'Tickets Bought',
        value: '23.6K',
        percent: '12.6%',
        percentColor: 'bg-red-900',
        fontColor: 'text-red-400',
        borderColor: 'border border-red-400',
        isUp: false,
    },
    {
        icon: <Plus className="w-5 h-5 text-[#CDCDE0]" />,
        label: 'Total Orders',
        value: '756',
        percent: '3.1%',
        percentColor: 'bg-green-900',
        fontColor: 'text-green-400',
        borderColor: 'border border-green-400',
        isUp: true,
    },
    {
        icon: <Star className="w-5 h-5 text-[#CDCDE0]" />,
        label: 'Total Income',
        value: '0',
        percent: '0%',
        percentColor: 'bg-green-900',
        fontColor: 'text-green-400',
        borderColor: 'border border-green-400',
        isUp: true,
    },
];

const DiagonalDown = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle">
        <path d="M11 3L3 11M3 11H10M3 11V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface StatsRowProps {
    refreshKey?: number;
}

const StatsRow: React.FC<StatsRowProps> = ({ refreshKey = 0 }) => {
  const [eventStats, setEventStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    isLoading: true
  });

  const [ticketStats, setTicketStats] = useState({
    totalTickets: 0,
    totalIncome: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Events
        const eventsResponse = await getAllEvents();
        let events = [];
        let allowedEventIds: string[] | undefined = undefined;

        if (eventsResponse.success && eventsResponse.data) {
          events = eventsResponse.data.events || [];
          
          // Filter events based on user role
          if (AuthHelper.isAdmin()) {
            const currentUserId = AuthHelper.getUserId();
            events = events.filter(
              (event) => event.admin_id == currentUserId || event.user_id == currentUserId
            );
            allowedEventIds = events.map(e => e.event_id || '').filter(id => id !== '');
          }
          
          const now = new Date();
          const upcoming = events.filter(event => new Date(event.date) > now).length;
          const completed = events.filter(event => new Date(event.date) <= now).length;

          setEventStats({
            totalEvents: events.length,
            upcomingEvents: upcoming,
            completedEvents: completed,
            isLoading: false
          });
        }

        // Fetch Ticket Stats
        // Pass allowedEventIds to getTicketStats if we are an admin
        const ticketResponse = await getTicketStats( allowedEventIds);
        
        if (ticketResponse.success && ticketResponse.data) {
          const stats = ticketResponse.data.stats;
          setTicketStats({
            totalTickets: stats.sold_tickets || 0,
            totalIncome: stats.total_revenue || 0,
            isLoading: false
          });
        } else {
            setTicketStats(prev => ({ ...prev, isLoading: false }));
        }

      } catch (error) {
        console.error('Error fetching stats:', error);
        setEventStats(prev => ({ ...prev, isLoading: false }));
        setTicketStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    setEventStats(prev => ({ ...prev, isLoading: true }));
    setTicketStats(prev => ({ ...prev, isLoading: true }));
    fetchStats();
  }, [refreshKey]);

  const updatedStats = [
    {
      ...stats[0],
      value: eventStats.isLoading ? '...' : eventStats.totalEvents.toString(),
      label: 'Total Events'
    },
    {
      ...stats[1],
      value: eventStats.isLoading ? '...' : eventStats.upcomingEvents.toString(),
      label: 'Upcoming Events'
    },
    {
      ...stats[2],
      value: eventStats.isLoading ? '...' : eventStats.completedEvents.toString(),
      label: 'Completed Events'
    },
    {
        ...stats[3],
        value: ticketStats.isLoading ? '...' : `Rwf${ticketStats.totalIncome.toLocaleString()}`,
        label: 'Total Income'
    }
  ];

  return (
    <div className="flex  gap-4 pb-2 mb-8 overflow-x-auto">
      {updatedStats.map((stat, idx) => (
            <div key={idx} className="relative flex flex-col gap-3 bg-[#101010] rounded-lg p-5 shadow-lg min-w-[260px] max-w-xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-sm text-[#CDCDE0] font-medium">{stat.label}</span>
                    </div>
                    <button className="p-1 rounded-full hover:bg-[#23232B] text-[#CDCDE0]">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold text-white">{stat.value}</span>
                    {/* <div className={`flex items-center gap-1 px-1 py-0.5 rounded-sm ${stat.percentColor} ${stat.fontColor} ${stat.borderColor} text-xs font-medium mb-2 `}>
                        {stat.percent}
                        {stat.isUp ? <DiagonalUp /> : <DiagonalDown />}
                    </div> */}
                </div>
            </div>
        ))}
    </div>
  );
};

export default StatsRow;