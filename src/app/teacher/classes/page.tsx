'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { BookOpen, Users, MapPin, Clock } from 'lucide-react';

interface ClassInfo {
  id: number;
  course_name: string;
  section: string;
  room_number: string;
  schedule: string;
  student_count: number;
  capacity: number;
}

export default function TeacherClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (count: number, capacity: number) => {
    const percentage = (count / capacity) * 100;
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <div className="flex">
        <Sidebar role="teacher" />
        
        <main className="ml-64 flex-1 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your assigned classes and students</p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.length === 0 ? (
                <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No classes assigned yet. Contact administration to get class assignments.
                  </p>
                </div>
              ) : (
                classes.map((classItem) => (
                  <div key={classItem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-lg">
                      <h3 className="text-lg font-semibold text-white">
                        {classItem.course_name}
                      </h3>
                      <p className="text-green-100 text-sm">
                        Section {classItem.section}
                      </p>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Students</p>
                          <p className={`font-bold ${getCapacityColor(classItem.student_count, classItem.capacity)}`}>
                            {classItem.student_count} / {classItem.capacity}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${(classItem.student_count / classItem.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Schedule</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {classItem.schedule}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Room</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {classItem.room_number}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => router.push('/attendance')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Attendance
                      </button>
                      <button 
                        onClick={() => router.push('/grades')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Grades
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
