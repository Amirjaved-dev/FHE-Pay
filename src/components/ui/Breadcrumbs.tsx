import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { BreadcrumbItem, generateBreadcrumbs } from './breadcrumbs-utils';

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
  maxItems?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRightIcon className="h-4 w-4 text-gray-400" />,
  showHome = true,
  className = '',
  maxItems = 4
}) => {
  const location = useLocation();
  
  // Use provided items or generate from current path
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);
  
  // Truncate items if too many
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1), // Keep first item
        { label: '...', path: undefined }, // Ellipsis
        ...breadcrumbItems.slice(-maxItems + 2) // Keep last items
      ]
    : breadcrumbItems;
  
  if (displayItems.length <= 1 && !showHome) {
    return null;
  }
  
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';
          
          return (
            <motion.li
              key={`${item.path || item.label}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center"
            >
              {index > 0 && (
                <span className="mr-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="text-gray-400 px-2">...</span>
              ) : isLast ? (
                <span 
                  className="font-medium text-gray-900 flex items-center"
                  aria-current="page"
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 mr-1.5 text-gray-500" />
                  )}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path!}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center group"
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 mr-1.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                  <span className="hover:underline">{item.label}</span>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

// Compact version for mobile
export const CompactBreadcrumbs: React.FC<BreadcrumbsProps> = (props) => {
  const location = useLocation();
  const breadcrumbItems = props.items || generateBreadcrumbs(location.pathname);
  
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  const currentItem = breadcrumbItems[breadcrumbItems.length - 1];
  const parentItem = breadcrumbItems[breadcrumbItems.length - 2];
  
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center text-sm ${props.className || ''}`}
      aria-label="Breadcrumb"
    >
      {parentItem && parentItem.path && (
        <>
          <Link
            to={parentItem.path}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
          >
            <ChevronRightIcon className="h-4 w-4 mr-1 rotate-180" />
            <span className="truncate max-w-24">{parentItem.label}</span>
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
        </>
      )}
      <span className="font-medium text-gray-900 truncate">
        {currentItem.label}
      </span>
    </motion.nav>
  );
};



// Breadcrumb with dropdown for overflow items
export const DropdownBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  maxItems = 3
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname);
  
  if (breadcrumbItems.length <= maxItems) {
    return <Breadcrumbs items={breadcrumbItems} className={className} />;
  }
  
  const visibleItems = [
    breadcrumbItems[0], // First item
    ...breadcrumbItems.slice(-maxItems + 1) // Last items
  ];
  
  const hiddenItems = breadcrumbItems.slice(1, -maxItems + 1);
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      <ol className="flex items-center space-x-2">
        {/* First item */}
        <li className="flex items-center">
          <Link
            to={visibleItems[0].path!}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
          >
            {visibleItems[0].icon && (
              React.createElement(visibleItems[0].icon, { className: "h-4 w-4 mr-1.5" })
            )}
            {visibleItems[0].label}
          </Link>
        </li>
        
        {/* Dropdown for hidden items */}
        {hiddenItems.length > 0 && (
          <li className="flex items-center relative">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
            >
              ...
            </button>
            
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48"
              >
                {hiddenItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path!}
                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </li>
        )}
        
        {/* Remaining visible items */}
        {visibleItems.slice(1).map((item, index) => {
          const isLast = index === visibleItems.length - 2;
          
          return (
            <li key={index + 1} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link
                  to={item.path!}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;