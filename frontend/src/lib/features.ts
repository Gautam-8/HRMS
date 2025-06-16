export interface Feature {
  id: string;
  label: string;
  path: string;
  icon: string;
  roles: string[];
  description: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['HR', 'Manager', 'Employee'],
    description: 'Overview and quick actions'
  },
  {
    id: 'team',
    label: 'Team',
    path: '/dashboard/team',
    icon: 'Users',
    roles: ['HR', 'Manager'],
    description: 'Team management and organization structure'
  },
  {
    id: 'departments',
    label: 'Departments',
    path: '/dashboard/departments',
    icon: 'Building',
    roles: ['HR'],
    description: 'Department and team structure'
  },
  {
    id: 'attendance',
    label: 'Attendance',
    path: '/dashboard/attendance',
    icon: 'Clock',
    roles: ['HR', 'Manager', 'Employee'],
    description: 'Time tracking and leave management'
  },
  {
    id: 'payroll',
    label: 'Payroll',
    path: '/dashboard/payroll',
    icon: 'DollarSign',
    roles: ['HR', 'Employee'],
    description: 'Salary and compensation management'
  },
  {
    id: 'performance',
    label: 'Performance',
    path: '/dashboard/performance',
    icon: 'Target',
    roles: ['HR', 'Manager', 'Employee'],
    description: 'Goals, reviews, and feedback'
  },
  {
    id: 'documents',
    label: 'Documents',
    path: '/dashboard/documents',
    icon: 'FileText',
    roles: ['HR', 'Employee'],
    description: 'Document management and storage'
  }
];

export function hasFeatureAccess(featureId: string, userRole: string): boolean {
  const feature = FEATURES.find(f => f.id === featureId);
  return feature ? feature.roles.includes(userRole) : false;
}

export function getAccessibleFeatures(userRole: string): Feature[] {
  return FEATURES.filter(feature => feature.roles.includes(userRole));
} 