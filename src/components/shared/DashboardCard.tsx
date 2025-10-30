import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, className }) => (
  <div className={`flex flex-col gap-2 justify-start font-bold bg-[#101010] rounded-md w-full h-[8rem] px-4 py-4 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${className}`}>
    <span className="text-2xl text-primary">{icon}</span>
    <h1 className="text-sm text-primary">{title}</h1>
    <p className="text-xl text-[#CDCDE0] font-semibold">{value}</p>
  </div>
);

export default DashboardCard; 