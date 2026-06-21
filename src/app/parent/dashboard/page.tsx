'use client';

import { useEffect, useState } from 'react';
import { Users, ClipboardCheck, TrendingUp, Bell } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { fetchCurrentUser } from '@/lib/routing';

interface ParentStats {
  children_count: number;
  attendance_rate: number;
  average_gpa: number;
  notifications: number;
}

interface Child {
  id: number;
  name: string;
  student_id: string;
  grade_level: number;
  enrolled_courses: number;
  attendance_rate: number;
  gpa: number;
}

export default function ParentDashboardPage() {
  const [stats, setStats] = useState<ParentStats>({
    children_count: 0,
    attendance_rate: 0,
    average_gpa: 0,
    notifications: 0,
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { user } = await fetchCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchParentData();
    }
  }, [currentUser]);

  const fetchParentData = async () => {
    try {
      const [usersRes, gradesRes, notificationsRes] = await Promise.all([
        api.get('/users'),
        api.get('/grades'),
        api.get('/notifications'),
      ]);
      
      const users = usersRes.data || [];
      const grades = gradesRes.data || [];
      const notifications = notificationsRes.data || [];

      // Filter for students linked to this parent
      const students = users.filter((u: any) => 
        u.role?.name === 'student' && u.student?.parentId === currentUser?.id
      );
      
      // Calculate stats
      const childrenCount = students.length;
      const attendanceRate = 0; // Would calculate from attendance data
      const averageGpa = 0; // Would calculate from grades data
      const notificationCount = notifications.length;

      setStats({
        children_count: childrenCount,
        attendance_rate: attendanceRate,
        average_gpa: averageGpa,
        notifications: notificationCount,
      });

      // Transform students to children format
      const transformedChildren = students.map((student: any) => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        student_id: student.student?.studentId || 'N/A',
        grade_level: student.student?.gradeLevel || 9,
        enrolled_courses: 0, // Would calculate from enrollments
        attendance_rate: attendanceRate,
        gpa: averageGpa,
      }));
      
      setChildren(transformedChildren);
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['parent']}>
        <MainLayout>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <MainLayout>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parent Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor your child's academic progress.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Children"
              value={stats.children_count.toString()}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${stats.attendance_rate}%`}
              icon={ClipboardCheck}
              color="green"
            />
            <DashboardCard
              title="Average GPA"
              value={stats.average_gpa.toFixed(2)}
              icon={TrendingUp}
              color="purple"
            />
            <DashboardCard
              title="Notifications"
              value={stats.notifications.toString()}
              icon={Bell}
              color="orange"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Children Overview</h2>
            {children.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Grade Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Enrolled Courses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        GPA
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {children.map((child) => (
                      <tr key={child.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {child.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {child.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          Grade {child.grade_level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {child.enrolled_courses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            child.attendance_rate >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            child.attendance_rate >= 75 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {child.attendance_rate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            child.gpa >= 3.5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            child.gpa >= 2.5 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            child.gpa >= 2.0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {child.gpa.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No children linked to this account. Contact administration to link student accounts.
              </p>
            )}
          </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
