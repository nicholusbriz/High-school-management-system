'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { BookOpen, Clock, MapPin, User } from 'lucide-react';

interface Course {
  id: number;
  course_name: string;
  course_code: string;
  section: string;
  teacher_name: string;
  schedule: string;
  room: string;
}

export default function StudentClassesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/classes');
      const classes = response.data || [];
      // Transform classes data to match Course interface
      const courses = classes.map((cls: any) => ({
        id: cls.id,
        course_name: cls.course?.name || 'Unknown',
        course_code: cls.course?.code || 'N/A',
        section: cls.section,
        teacher_name: `${cls.teacher?.firstName || ''} ${cls.teacher?.lastName || ''}`,
        schedule: cls.schedule,
        room: cls.roomNumber,
      }));
      setCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex">
        <Sidebar role="student" />
        
        <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View your enrolled courses and schedules</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No classes enrolled yet. Contact your advisor to enroll in courses.
                  </p>
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-lg">
                      <h3 className="text-lg font-semibold text-white">
                        {course.course_name}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {course.course_code} - Section {course.section}
                      </p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Instructor</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {course.teacher_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Schedule</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {course.schedule}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Room</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {course.room}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <button 
                        onClick={() => router.push('/grades')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Course Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
