import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, BanknotesIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { ActionCard, Card } from './ui/Card';

export default function QuickActions() {
  const navigate = useNavigate();
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const actions = [
    {
      id: 'employees',
      title: 'Manage Employees',
      description: 'Add, edit, or remove employees from your payroll system',
      icon: UsersIcon,
      color: 'blue',
      shortcut: 'E',
      onClick: () => navigate('/employees'),
      ariaLabel: 'Navigate to employee management page'
    },
    {
      id: 'funding',
      title: 'Fund Account',
      description: 'Deposit funds for payroll and manage your balance',
      icon: BanknotesIcon,
      color: 'green',
      shortcut: 'F',
      onClick: () => navigate('/funding'),
      ariaLabel: 'Navigate to account funding page'
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'Access payroll and financial reports and analytics',
      icon: ChartBarIcon,
      color: 'purple',
      shortcut: 'R',
      onClick: () => navigate('/reports'),
      ariaLabel: 'Navigate to reports and analytics page'
    },
    {
      id: 'portal',
      title: 'Portal Access',
      description: 'Employee self-service portal for payments and info',
      icon: DocumentTextIcon,
      color: 'orange',
      shortcut: 'P',
      onClick: () => navigate('/portal'),
      ariaLabel: 'Navigate to employee portal page'
    }
  ];

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (event.altKey) {
        const action = actions.find(a => a.shortcut.toLowerCase() === event.key.toLowerCase());
        if (action) {
          event.preventDefault();
          action.onClick();
        }
      }
      
      // Handle arrow key navigation
      if (focusedIndex !== null) {
        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            setFocusedIndex((prev) => 
              prev !== null ? (prev + 1) % actions.length : 0
            );
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            setFocusedIndex((prev) => 
              prev !== null ? (prev - 1 + actions.length) % actions.length : actions.length - 1
            );
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (focusedIndex !== null) {
              actions[focusedIndex].onClick();
            }
            break;
          case 'Escape':
            setFocusedIndex(null);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, actions]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <span className="text-xs text-gray-500 hidden sm:block">
          Use Alt + letter shortcuts
        </span>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          const isFocused = focusedIndex === index;
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActionCard
                title={action.title}
                description={action.description}
                icon={IconComponent}
                color={action.color}
                onClick={action.onClick}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                className={`h-full transition-all duration-200 ${
                  isFocused ? 'ring-2 ring-purple-500 ring-offset-2' : ''
                }`}
                aria-label={action.ariaLabel}
                aria-describedby={`action-${action.id}-desc`}
                tabIndex={0}
                role="button"
              >
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-gray-500">
                    Alt + {action.shortcut}
                  </span>
                  <div className="w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div id={`action-${action.id}-desc`} className="sr-only">
                  {action.description}. Keyboard shortcut: Alt + {action.shortcut}
                </div>
              </ActionCard>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Screen reader instructions */}
      <div className="sr-only" aria-live="polite">
        Quick actions grid. Use Tab to navigate between actions, Enter or Space to activate.
        Keyboard shortcuts available: Alt + E for Employees, Alt + F for Funding, 
        Alt + R for Reports, Alt + P for Portal.
      </div>
    </Card>
  );
}