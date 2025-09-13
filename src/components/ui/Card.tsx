import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  shadow = 'sm',
  onClick,
  gradient = false
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const baseClasses = `
    bg-white rounded-xl border border-gray-100 
    ${shadowClasses[shadow]} 
    ${paddingClasses[padding]} 
    ${hover ? 'hover:shadow-md hover:border-gray-200 cursor-pointer' : ''} 
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
    transition-all duration-200 
    ${className}
  `;
  
  const motionProps = {
    whileHover: hover ? { y: -2, scale: 1.02 } : {},
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    onClick
  };
  
  return (
    <motion.div
      className={baseClasses}
      {...motionProps}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 pointer-events-none rounded-xl" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  name,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  changeType = 'neutral',
  index = 0
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card hover gradient className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{name}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
            {change && (
              <div className="flex items-center">
                <span className={`text-xs font-medium ${changeColors[changeType]}`}>
                  {change}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgColor} relative z-10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 pointer-events-none" />
        
        {/* Animated background pattern */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-gray-100/20 to-transparent rounded-full blur-xl" />
      </Card>
    </motion.div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'text-purple-600',
  disabled = false,
  children,
  className,
  onFocus,
  onBlur,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  return (
    <Card 
      hover={!disabled} 
      onClick={disabled ? undefined : onClick}
      className={`group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      <div
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={tabIndex}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors ${
          disabled ? '' : 'group-hover:scale-110'
        }`}>
          <Icon className={`h-6 w-6 ${color} transition-transform`} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {!disabled && (
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 2 }}
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>
        )}
        {children}
      </div>
      </div>
    </Card>
  );
};

export default Card;