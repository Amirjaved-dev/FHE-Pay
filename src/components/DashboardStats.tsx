import React from 'react';
import { UsersIcon, ChartBarIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { StatCard } from './ui/Card';
import { SkeletonStats } from './ui/SkeletonCard';

interface DashboardStatsProps {
  stats?: {
    totalEmployees: number;
    activeStreams: number;
    totalFunds: string;
    monthlyPayroll: string;
  };
  isLoading?: boolean;
}

export default function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const defaultStats = {
    totalEmployees: 0,
    activeStreams: 0,
    totalFunds: '0',
    monthlyPayroll: '0'
  };

  const currentStats = stats || defaultStats;

  const statCards = [
    {
      id: 'employees',
      name: 'Total Employees',
      value: currentStats.totalEmployees.toString(),
      icon: UsersIcon,
      change: '+12%',
      changeType: 'positive' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'streams',
      name: 'Active Streams',
      value: currentStats.activeStreams.toString(),
      icon: ChartBarIcon,
      change: '+8%',
      changeType: 'positive' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'funds',
      name: 'Total Funds',
      value: `$${parseFloat(currentStats.totalFunds).toLocaleString()}`,
      icon: BanknotesIcon,
      change: '+15%',
      changeType: 'positive' as const,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'payroll',
      name: 'Monthly Payroll',
      value: `$${parseFloat(currentStats.monthlyPayroll).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: '+5%',
      changeType: 'positive' as const,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (isLoading) {
    return <SkeletonStats count={4} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: 'easeOut'
            }}
          >
            <StatCard
              name={stat.name}
              value={stat.value}
              icon={IconComponent}
              change={stat.change}
              changeType={stat.changeType}
              color={stat.color}
              bgColor={stat.bgColor}
              index={index}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}