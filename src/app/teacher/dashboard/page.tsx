'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardCheck, FileText } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface TeacherStats {
  my_classes: number;
  total_students: number;
  attendance_today: number;
  pending_grades: number;
}

interface ClassInfo {
  id: number;
  course_name: string;
  section: string;
  room_number: string;
  schedule: string;
  student_count: number;
  capacity: number;
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<TeacherStats>({
    my_classes: 0,
    total_students: 0,
    attendance_today: 0,
    pending_grades: 0,
  });
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const [classesRes] = await Promise.all([
        api.get('/classes'),
      ]);
      
      // Calculate stats from classes data
      const classes = classesRes.data || [];
      const myClasses = classes.length;
      const totalStudents = classes.reduce((sum: number, cls: any) => sum + (cls.enrollments?.length || 0), 0);
      
      setStats({
        my_classes: myClasses,
        total_students: totalStudents,
        attendance_today: 0,
        pending_grades: 0,
      });
      setClasses(classes);
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <div className="flex">
          <Sidebar role="teacher" />
          <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="flex">
        <Sidebar role="teacher" />
        
        <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Manage your classes and students.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="My Classes"
              value={stats.my_classes.toString()}
              icon={BookOpen}
              color="blue"
            />
            <DashboardCard
              title="Total Students"
              value={stats.total_students.toString()}
              icon={Users}
              color="green"
            />
            <DashboardCard
              title="Attendance Today"
              value={`${stats.attendance_today}%`}
              icon={ClipboardCheck}
              color="purple"
            />
            <DashboardCard
              title="Pending Grades"
              value={stats.pending_grades.toString()}
              icon={FileText}
              color="orange"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Classes</h2>
            {classes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {classes.map((classInfo) => (
                      <tr key={classInfo.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {classInfo.course_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classInfo.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classInfo.room_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classInfo.schedule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {classInfo.student_count} / {classInfo.capacity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No classes assigned yet. Contact administration to get class assignments.
              </p>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
