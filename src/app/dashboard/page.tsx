'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, ClipboardCheck, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import api from '@/lib/api';

interface DashboardStats {
  total_students: number;
  active_courses: number;
  attendance_rate: number;
  average_gpa: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    active_courses: 0,
    attendance_rate: 0,
    average_gpa: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, classesRes, coursesRes] = await Promise.all([
        api.get('/users'),
        api.get('/classes'),
        api.get('/courses'),
      ]);
      
      const users = usersRes.data || [];
      const classes = classesRes.data || [];
      const courses = coursesRes.data || [];

      const totalStudents = users.filter((u: any) => u.role?.name === 'student').length;
      const activeCourses = courses.length;
      const attendanceRate = 0; // Would calculate from attendance data
      const averageGpa = 0; // Would calculate from grades data

      setStats({
        total_students: totalStudents,
        active_courses: activeCourses,
        attendance_rate: attendanceRate,
        average_gpa: averageGpa,
      });
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mb-2">
              Welcome!
            </h1>
            <p className="text-sm sm:text-base text-[#78716C]">
              Here's what's happening at Elite High School today.
            </p>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1C1917]">{stats.total_students}</p>
            <p className="text-xs sm:text-sm text-[#78716C]">Total Students</p>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FFFBEB] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#F59E0B]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
                +5%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1C1917]">{stats.active_courses}</p>
            <p className="text-xs sm:text-sm text-[#78716C]">Active Courses</p>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ECFDF5] rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#10B981]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
                +8%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1C1917]">{stats.attendance_rate}%</p>
            <p className="text-xs sm:text-sm text-[#78716C]">Attendance Rate</p>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F3E8FF] rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#9333EA]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
                +3%
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#1C1917]">{stats.average_gpa.toFixed(2)}</p>
            <p className="text-xs sm:text-sm text-[#78716C]">Average GPA</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-[#1C1917] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => router.push('/courses')}
              className="btn-primary text-left text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Manage Courses
            </button>
            <button 
              onClick={() => router.push('/users')}
              className="btn-secondary text-left text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              View Students
            </button>
            <button 
              onClick={() => router.push('/attendance')}
              className="bg-[#10B981] text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:bg-[#059669] transition-all text-left text-sm sm:text-base"
            >
              <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              Take Attendance
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-[#1C1917] mb-4">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center py-4 text-[#78716C]">
              Recent activity will appear here
            </div>
          </div>
        </div>
      </div>
      )}
    </MainLayout>
  );
}
