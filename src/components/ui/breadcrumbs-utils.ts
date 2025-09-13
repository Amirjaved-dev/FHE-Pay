import { HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Route mapping for automatic breadcrumb generation
export const routeMap: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/employees/add': 'Add Employee',
  '/employees/edit': 'Edit Employee',
  '/payroll': 'Payroll',
  '/payroll/create': 'Create Payroll',
  '/payroll/history': 'Payroll History',
  '/reports': 'Reports',
  '/reports/analytics': 'Analytics',
  '/settings': 'Settings',
  '/settings/profile': 'Profile',
  '/settings/security': 'Security',
  '/funding': 'Funding',
  '/streams': 'Payment Streams'
};

// Generate breadcrumbs from current path
export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always start with home if not on home page
  if (pathname !== '/') {
    breadcrumbs.push({
      label: 'Dashboard',
      path: '/',
      icon: HomeIcon
    });
  }
  
  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      path: index === segments.length - 1 ? undefined : currentPath // Last item has no link
    });
  });
  
  return breadcrumbs;
};