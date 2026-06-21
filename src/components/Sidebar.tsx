'use client';

import Link from 'next/link';
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
import { getMenuItemsByRole } from '@/lib/routing';

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
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

  const menuItems = getMenuItemsByRole(role);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Home,
      LayoutDashboard,
      Users,
      BookOpen,
      ClipboardList,
      BarChart3,
      Settings,
    };
    return icons[iconName] || LayoutDashboard;
  };

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-[#E7E5E4] h-screen fixed left-0 top-0">
      <div className="p-6">
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
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = getIconComponent(item.icon);
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                  : 'text-[#57534E] hover:bg-[#F5F5F4]'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
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
    </aside>
  );
}
