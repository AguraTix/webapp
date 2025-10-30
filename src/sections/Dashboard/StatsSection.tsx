import React from 'react';
import DashboardCard from '../../components/shared/DashboardCard';

const stats = [
  { title: 'Total Events', value: '12', icon: <span>🎉</span> },
  { title: 'Tickets Sold', value: '340', icon: <span>🎫</span> },
  { title: 'Revenue', value: '$2,500', icon: <span>💰</span> },
];

const StatsSection = () => (
  <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10 w-full">
    {stats.map((stat, idx) => (
      <DashboardCard key={idx} {...stat} />
    ))}
  </section>
);

export default StatsSection; 