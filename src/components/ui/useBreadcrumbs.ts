import React from 'react';
import { useLocation } from 'react-router-dom';
import { generateBreadcrumbs } from './breadcrumbs-utils';

// Hook to get current breadcrumb data
export const useBreadcrumbs = () => {
  const location = useLocation();
  
  const breadcrumbs = React.useMemo(() => {
    return generateBreadcrumbs(location.pathname);
  }, [location.pathname]);
  
  const currentPage = breadcrumbs[breadcrumbs.length - 1]?.label || 'Page';
  const parentPage = breadcrumbs[breadcrumbs.length - 2];
  
  return {
    breadcrumbs,
    currentPage,
    parentPage,
    isHomePage: location.pathname === '/'
  };
};