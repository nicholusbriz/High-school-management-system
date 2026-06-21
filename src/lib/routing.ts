import { getCurrentUser } from './auth';

// Role-based navigation menu items
export const getMenuItemsByRole = (role: string) => {
  const roleLower = role.toLowerCase();

  const menuConfigs = {
    admin: [
      { href: '/welcome', icon: 'Home', label: 'Home' },
      { href: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { href: '/users', icon: 'Users', label: 'Users' },
      { href: '/courses', icon: 'BookOpen', label: 'Courses' },
      { href: '/classes', icon: 'ClipboardList', label: 'Classes' },
      { href: '/reports', icon: 'BarChart3', label: 'Reports' },
      { href: '/settings', icon: 'Settings', label: 'Settings' },
    ],
    department_head: [
      { href: '/welcome', icon: 'Home', label: 'Home' },
      { href: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { href: '/users', icon: 'Users', label: 'Faculty' },
      { href: '/courses', icon: 'BookOpen', label: 'Courses' },
      { href: '/classes', icon: 'ClipboardList', label: 'Classes' },
      { href: '/reports', icon: 'BarChart3', label: 'Reports' },
      { href: '/settings', icon: 'Settings', label: 'Settings' },
    ],
    teacher: [
      { href: '/welcome', icon: 'Home', label: 'Home' },
      { href: '/teacher/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { href: '/teacher/classes', icon: 'BookOpen', label: 'My Classes' },
      { href: '/attendance', icon: 'ClipboardCheck', label: 'Attendance' },
      { href: '/grades', icon: 'BarChart3', label: 'Grades' },
      { href: '/assignments', icon: 'ClipboardList', label: 'Assignments' },
      { href: '/settings', icon: 'Settings', label: 'Settings' },
    ],
    student: [
      { href: '/welcome', icon: 'Home', label: 'Home' },
      { href: '/student/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { href: '/student/classes', icon: 'BookOpen', label: 'My Classes' },
      { href: '/grades', icon: 'BarChart3', label: 'My Grades' },
      { href: '/assignments', icon: 'ClipboardList', label: 'Assignments' },
      { href: '/attendance', icon: 'ClipboardCheck', label: 'My Attendance' },
    ],
    parent: [
      { href: '/welcome', icon: 'Home', label: 'Home' },
      { href: '/parent/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
      { href: '/grades', icon: 'BarChart3', label: 'Child Grades' },
      { href: '/attendance', icon: 'ClipboardCheck', label: 'Child Attendance' },
      { href: '/reports', icon: 'BarChart3', label: 'Reports' },
      { href: '/settings', icon: 'Settings', label: 'Settings' },
    ],
  };

  return menuConfigs[roleLower as keyof typeof menuConfigs] || menuConfigs.admin;
};

// Role-based route protection
export const getProtectedRoutes = () => ({
  '/dashboard': ['admin', 'department_head'],
  '/users': ['admin', 'department_head'],
  '/courses': ['admin', 'department_head', 'teacher'],
  '/classes': ['admin', 'department_head', 'teacher'],
  '/reports': ['admin', 'department_head'],
  '/settings': ['admin', 'department_head', 'teacher', 'student', 'parent'],
  '/attendance': ['admin', 'department_head', 'teacher'],
  '/grades': ['admin', 'department_head', 'teacher', 'student'],
  '/assignments': ['admin', 'department_head', 'teacher', 'student'],
  '/welcome': ['admin', 'department_head', 'teacher', 'student', 'parent'],
  '/teacher/dashboard': ['teacher'],
  '/teacher/classes': ['teacher'],
  '/student/dashboard': ['student'],
  '/student/classes': ['student'],
  '/parent/dashboard': ['parent'],
  '/department-head/dashboard': ['department_head'],
});

// Role-based redirects
export const getRoleRedirect = (role: string) => {
  const redirects: Record<string, string> = {
    admin: '/dashboard',
    department_head: '/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
  };
  return redirects[role.toLowerCase()] || '/dashboard';
};

// Check if user has access to route
export const hasRouteAccess = (userRole: string, pathname: string, protectedRoutes: Record<string, string[]>) => {
  const roleLower = userRole.toLowerCase();
  
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(roleLower);
    }
  }
  
  return true; // Default to allow if not in protected routes
};

// Fetch current user with error handling
export const fetchCurrentUser = async () => {
  try {
    const user = await getCurrentUser();
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};
