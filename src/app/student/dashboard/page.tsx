'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ClipboardCheck, TrendingUp, FileText } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface StudentStats {
  enrolled_courses: number;
  attendance_rate: number;
  average_grade: number;
  pending_assignments: number;
}

interface Course {
  id: number;
  course_name: string;
  course_code: string;
  section: string;
  teacher_name: string;
  schedule: string;
  room: string;
}

interface Grade {
  course_name: string;
  grade_type: string;
  score: number;
  max_score: number;
  percentage: number;
  date: string;
}

interface Assignment {
  id: number;
  title: string;
  course_name: string;
  due_date: string;
  max_score: number;
  is_submitted: boolean;
  status: string;
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats>({
    enrolled_courses: 0,
    attendance_rate: 0,
    average_grade: 0,
    pending_assignments: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [classesRes, gradesRes, assignmentsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/grades'),
        api.get('/assignments'),
      ]);
      
      const classes = classesRes.data || [];
      const grades = gradesRes.data || [];
      const assignments = assignmentsRes.data || [];
      
      // Calculate stats
      const enrolledCourses = classes.length;
      const pendingAssignments = assignments.filter((a: any) => !a.submissions?.length).length;
      
      setStats({
        enrolled_courses: enrolledCourses,
        attendance_rate: 0,
        average_grade: 0,
        pending_assignments: pendingAssignments,
      });
      
      // Transform classes data
      const transformedCourses = classes.map((cls: any) => ({
        id: cls.id,
        course_name: cls.course?.name || 'Unknown',
        course_code: cls.course?.code || 'N/A',
        section: cls.section,
        teacher_name: `${cls.teacher?.firstName || ''} ${cls.teacher?.lastName || ''}`,
        schedule: cls.schedule,
        room: cls.roomNumber,
      }));
      setCourses(transformedCourses);
      
      // Transform grades data
      const transformedGrades = grades.map((g: any) => ({
        course_name: g.enrollment?.class?.course?.name || 'Unknown',
        grade_type: g.gradeType,
        score: g.score,
        max_score: g.maxScore,
        percentage: Math.round((g.score / g.maxScore) * 100),
        date: g.createdAt || new Date().toISOString(),
      }));
      setGrades(transformedGrades);
      
      // Transform assignments data
      const transformedAssignments = assignments.map((a: any) => ({
        id: a.id,
        title: a.title,
        course_name: a.class?.course?.name || 'Unknown',
        due_date: a.dueDate,
        max_score: a.maxScore,
        is_submitted: a.submissions?.length > 0,
        status: a.submissions?.length > 0 ? 'Submitted' : 'Pending',
      }));
      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <div className="flex">
          <Sidebar role="student" />
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
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex">
        <Sidebar role="student" />
        
        <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's your academic overview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Enrolled Courses"
              value={stats.enrolled_courses.toString()}
              icon={BookOpen}
              color="blue"
            />
            <DashboardCard
              title="Attendance Rate"
              value={`${stats.attendance_rate}%`}
              icon={ClipboardCheck}
              color="green"
            />
            <DashboardCard
              title="Average Grade"
              value={`${stats.average_grade}%`}
              icon={TrendingUp}
              color="purple"
            />
            <DashboardCard
              title="Pending Assignments"
              value={stats.pending_assignments.toString()}
              icon={FileText}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Courses</h2>
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {course.course_name} ({course.course_code})
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Section {course.section} • {course.teacher_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {course.schedule} • Room {course.room}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No courses enrolled yet. Contact your advisor to enroll in courses.
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Grades</h2>
              {grades.length > 0 ? (
                <div className="space-y-3">
                  {grades.map((grade, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {grade.course_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {grade.grade_type} • {grade.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {grade.score}/{grade.max_score}
                        </p>
                        <p className={`text-sm ${
                          grade.percentage >= 90 ? 'text-green-600' :
                          grade.percentage >= 80 ? 'text-blue-600' :
                          grade.percentage >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {grade.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No grades available yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Assignments</h2>
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Max Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {assignment.course_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {assignment.due_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {assignment.max_score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            assignment.is_submitted
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming assignments.
              </p>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
