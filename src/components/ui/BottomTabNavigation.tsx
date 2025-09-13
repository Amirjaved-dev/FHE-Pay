import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  CogIcon as CogIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const defaultTabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid
  },
  {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: UsersIcon,
    activeIcon: UsersIconSolid
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: ChartBarIcon,
    activeIcon: ChartBarIconSolid
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/payroll',
    icon: DocumentTextIcon,
    activeIcon: DocumentTextIconSolid
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: CogIcon,
    activeIcon: CogIconSolid
  }
];

interface BottomTabNavigationProps {
  tabs?: TabItem[];
  className?: string;
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  tabs = defaultTabs,
  className = ''
}) => {
  const location = useLocation();
  
  const isTabActive = (tabPath: string) => {
    if (tabPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(tabPath);
  };
  
  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.path);
          const IconComponent = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className="relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative flex flex-col items-center"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-8 h-1 bg-purple-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon container */}
                <div className="relative">
                  <IconComponent
                    className={`h-6 w-6 transition-colors duration-200 ${
                      isActive ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                  
                  {/* Badge */}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.div>
                  )}
                </div>
                
                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive ? '#7c3aed' : '#9ca3af',
                    fontWeight: isActive ? 600 : 400
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-xs mt-1 text-center leading-tight max-w-full truncate"
                >
                  {tab.label}
                </motion.span>
              </motion.div>
              
              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              />
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

// Hook to detect if bottom tab navigation should be shown
export const useBottomTabVisibility = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isScrolledEnough = Math.abs(currentScrollY - lastScrollY) > 10;
      
      if (isScrolledEnough) {
        setIsVisible(!isScrollingDown || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  return isVisible;
};

// Spacer component to prevent content from being hidden behind bottom nav
export const BottomTabSpacer: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div 
      className={`h-16 ${className}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    />
  );
};

// Enhanced version with animation controls
export const AnimatedBottomTabNavigation: React.FC<BottomTabNavigationProps & {
  isVisible?: boolean;
}> = ({ tabs = defaultTabs, className = '', isVisible = true }) => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <BottomTabNavigation tabs={tabs} className={className} />
    </motion.div>
  );
};

export default BottomTabNavigation;