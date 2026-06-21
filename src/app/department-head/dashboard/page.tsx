'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Award, UserCheck } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface Stats {
  total_students: number;
  active_courses: number;
  attendance_rate: number;
  average_gpa: number;
}

interface Activity {
  type: string;
  message: string;
  details: string;
  created_at: string;
}

interface Event {
  title: string;
  date: string;
  type: string;
}

export default function DepartmentHeadDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_students: 0,
    active_courses: 0,
    attendance_rate: 0,
    average_gpa: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Calculate stats from actual data
      const totalStudents = users.filter((u: any) => u.role?.name === 'student').length;
      const activeCourses = courses.length;
      const totalEnrollments = classes.reduce((sum: number, cls: any) => sum + (cls.enrollments?.length || 0), 0);

      setStats({
        total_students: totalStudents,
        active_courses: activeCourses,
        attendance_rate: 0,
        average_gpa: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'bg-blue-500';
      case 'grade':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'border-blue-500';
      case 'exam':
        return 'border-purple-500';
      case 'holiday':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['department_head']}>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['department_head']}>
      <MainLayout>
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Head Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your department and oversee academic performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Department Students"
              value={stats.total_students.toString()}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Department Courses"
              value={stats.active_courses.toString()}
              icon={BookOpen}
              color="green"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${stats.attendance_rate}%`}
              icon={ClipboardCheck}
              color="purple"
            />
            <DashboardCard
              title="Department GPA"
              value={stats.average_gpa.toFixed(2)}
              icon={TrendingUp}
              color="orange"
            />
          </div>

        {/* Department Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Faculty Members</p>
                  <p className="text-3xl font-bold mt-2">0</p>
                  <p className="text-blue-100 text-xs mt-1">Active teachers</p>
                </div>
                <UserCheck className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Classes</p>
                  <p className="text-3xl font-bold mt-2">0</p>
                  <p className="text-green-100 text-xs mt-1">This semester</p>
                </div>
                <BookOpen className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Top Performers</p>
                  <p className="text-3xl font-bold mt-2">0</p>
                  <p className="text-purple-100 text-xs mt-1">GPA above 3.5</p>
                </div>
                <Award className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Department Activity</h2>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.message}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No upcoming events
                  </p>
                ) : (
                  events.map((event, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border-l-4 bg-gray-50 dark:bg-gray-700 ${getEventColor(event.type)}`}
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(event.date)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        {/* Department Performance Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Department Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Course Distribution</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Core Courses</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Elective Courses</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Advanced Courses</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">0</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Grade Distribution</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">A (90-100%)</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">B (80-89%)</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">C (70-79%)</span>
                    <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
