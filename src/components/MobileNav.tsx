'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  BarChart3,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface MobileNavProps {
  role: string;
}

export default function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  const getMenuItems = () => {
    const roleLower = role.toLowerCase();

    // Admin
    if (roleLower === 'admin') {
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/users', icon: Users, label: 'Users' },
        { href: '/courses', icon: BookOpen, label: 'Courses' },
        { href: '/classes', icon: ClipboardList, label: 'Classes' },
        { href: '/reports', icon: BarChart3, label: 'Reports' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Department Head
    if (roleLower === 'department_head') {
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/department-head/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/users', icon: Users, label: 'Faculty' },
        { href: '/courses', icon: BookOpen, label: 'Courses' },
        { href: '/classes', icon: ClipboardList, label: 'Classes' },
        { href: '/reports', icon: BarChart3, label: 'Reports' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Teacher
    if (roleLower === 'teacher') {
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/teacher/classes', icon: BookOpen, label: 'My Classes' },
        { href: '/attendance', icon: ClipboardList, label: 'Attendance' },
        { href: '/grades', icon: BarChart3, label: 'Grades' },
        { href: '/assignments', icon: ClipboardList, label: 'Assignments' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Student
    if (roleLower === 'student') {
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/student/classes', icon: BookOpen, label: 'My Classes' },
        { href: '/grades', icon: BarChart3, label: 'My Grades' },
        { href: '/assignments', icon: ClipboardList, label: 'Assignments' },
        { href: '/attendance', icon: ClipboardList, label: 'My Attendance' },
      ];
    }

    // Parent
    if (roleLower === 'parent') {
      return [
        { href: '/welcome', icon: Home, label: 'Home' },
        { href: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/grades', icon: BarChart3, label: 'Child Grades' },
        { href: '/attendance', icon: ClipboardList, label: 'Child Attendance' },
        { href: '/reports', icon: BarChart3, label: 'Reports' },
        { href: '/settings', icon: Settings, label: 'Settings' },
      ];
    }

    // Default
    return [
      { href: '/welcome', icon: Home, label: 'Home' },
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/settings', icon: Settings, label: 'Settings' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors"
      >
        {isOpen ? <X size={24} className="text-[#1E3A8A]" /> : <Menu size={24} className="text-[#1E3A8A]" />}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1E3A8A]">Elite High School</h1>
              <p className="text-xs text-[#78716C]">Kampala, Uganda</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'text-[#57534E] hover:bg-[#F5F5F4]'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E7E5E4]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-[#57534E] hover:bg-[#F5F5F4] rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
