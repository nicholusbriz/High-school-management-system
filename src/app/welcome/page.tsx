'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
}

export default function WelcomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = () => {
    const roleName = user?.role?.name?.toLowerCase();
    switch (roleName) {
      case 'admin':
        return '/dashboard';
      case 'department_head':
        return '/department-head/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      case 'parent':
        return '/parent/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getRoleInfo = () => {
    const roleName = user?.role?.name?.toLowerCase();
    switch (roleName) {
      case 'admin':
        return {
          title: 'Administrator',
          description: 'Manage the entire school system, users, courses, and reports',
          features: [
            { icon: Users, text: 'Manage all users and roles' },
            { icon: BookOpen, text: 'Oversee courses and classes' },
            { icon: ClipboardCheck, text: 'Monitor attendance and grades' },
            { icon: TrendingUp, text: 'View comprehensive reports' },
          ],
          color: 'from-purple-500 to-indigo-600',
        };
      case 'department_head':
        return {
          title: 'Department Head',
          description: 'Manage your department, courses, and faculty members',
          features: [
            { icon: Users, text: 'Manage department faculty' },
            { icon: BookOpen, text: 'Oversee department courses' },
            { icon: ClipboardCheck, text: 'Monitor department performance' },
            { icon: TrendingUp, text: 'View department reports' },
          ],
          color: 'from-blue-500 to-cyan-600',
        };
      case 'teacher':
        return {
          title: 'Teacher',
          description: 'Manage your classes, track attendance, and grade assignments',
          features: [
            { icon: BookOpen, text: 'Manage your classes' },
            { icon: ClipboardCheck, text: 'Track student attendance' },
            { icon: TrendingUp, text: 'Grade assignments and exams' },
            { icon: Users, text: 'Monitor student progress' },
          ],
          color: 'from-green-500 to-emerald-600',
        };
      case 'student':
        return {
          title: 'Student',
          description: 'View your courses, assignments, grades, and attendance',
          features: [
            { icon: BookOpen, text: 'View enrolled courses' },
            { icon: ClipboardCheck, text: 'Check your attendance' },
            { icon: TrendingUp, text: 'Track your grades' },
            { icon: GraduationCap, text: 'Submit assignments' },
          ],
          color: 'from-orange-500 to-red-600',
        };
      case 'parent':
        return {
          title: 'Parent',
          description: "Monitor your child's academic progress and attendance",
          features: [
            { icon: Users, text: "View children's information" },
            { icon: ClipboardCheck, text: 'Monitor attendance' },
            { icon: TrendingUp, text: 'Track academic performance' },
            { icon: BookOpen, text: 'View course enrollment' },
          ],
          color: 'from-pink-500 to-rose-600',
        };
      default:
        return {
          title: 'User',
          description: 'Welcome to the School Management System',
          features: [],
          color: 'from-gray-500 to-gray-600',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] overflow-y-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F59E0B]"></div>
            </div>
            <h1 className="text-5xl font-bold text-[#1E3A8A] mb-4">Loading...</h1>
          </div>
          <CardSkeleton count={2} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] overflow-y-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-6">
            <Sparkles className="w-10 h-10 text-[#F59E0B]" />
          </div>
          <h1 className="text-5xl font-bold text-[#1E3A8A] mb-4">
            Welcome Back, {user.firstName}!
          </h1>
          <p className="text-xl text-[#78716C]">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Role Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card rounded-2xl shadow-2xl overflow-hidden">
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${roleInfo.color} p-8 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{roleInfo.title}</h2>
                  <p className="text-white/90 text-lg">{roleInfo.description}</p>
                </div>
                <GraduationCap className="w-16 h-16 opacity-50" />
              </div>
            </div>

            {/* Features Grid */}
            <div className="p-8">
              <h3 className="text-xl font-semibold text-[#1C1917] mb-6">
                What you can do:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {roleInfo.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 rounded-lg bg-[#F5F5F4] hover:bg-[#E7E5E4] transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-[#1E3A8A]" />
                    </div>
                    <span className="text-[#44403C]">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push(getDashboardPath())}
                  className="flex-1 flex items-center justify-center space-x-2 btn-primary shadow-lg hover:shadow-xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-[#E7E5E4] hover:bg-[#D6D3D1] text-[#44403C] font-semibold py-4 px-6 rounded-lg transition-colors"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats or Tips */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-[#F59E0B] mb-2">
                {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 18 ? '☀️' : '🌙'}
              </div>
              <p className="text-[#78716C]">
                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-[#10B981] mb-2">
                ✓
              </div>
              <p className="text-[#78716C]">
                System Online
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-[#1E3A8A] mb-2">
                📚
              </div>
              <p className="text-[#78716C]">
                Ready to Learn
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
