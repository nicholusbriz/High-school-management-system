'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '@/lib/routing';
import MainLayout from '@/components/MainLayout';
import CardSkeleton from '@/components/skeletons/CardSkeleton';
import api from '@/lib/api';

interface ClassInfo {
  id: number;
  course_name: string;
  section: string;
  room: string;
  schedule: string;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [userRole, setUserRole] = useState<string>('teacher');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { user } = await fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        setUserRole(user.role?.name?.toLowerCase() || 'teacher');
      }
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchClasses();
    }
  }, [currentUser]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      const classes = response.data || [];

      // Filter classes based on user role
      let filteredClasses = classes;
      if (userRole === 'teacher') {
        filteredClasses = classes.filter((cls: any) => cls.teacherId === currentUser.id);
      }

      // Transform to match ClassInfo interface
      const transformedClasses = filteredClasses.map((cls: any) => ({
        id: cls.id,
        course_name: cls.course?.name || 'Unknown',
        section: cls.section,
        room: cls.roomNumber || 'N/A',
        schedule: cls.schedule || 'N/A',
      }));

      setClasses(transformedClasses);
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {loading ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Attendance</h1>
            <p className="text-sm sm:text-base text-[#78716C] mt-2">Mark and manage student attendance</p>
          </div>
          <CardSkeleton count={2} />
        </div>
      ) : (
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Attendance</h1>
          <p className="text-sm sm:text-base text-[#78716C] mt-2">Mark and manage student attendance</p>
        </div>

        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#44403C] mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-[#44403C] mb-2">
                Select Class
              </label>
              <select 
                className="input"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.course_name} - Section {cls.section} ({cls.room})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6 text-center">
            {selectedClass ? (
              <p className="text-[#78716C]">
                Attendance marking for selected class will appear here
              </p>
            ) : (
              <p className="text-[#78716C]">
                {classes.length === 0 
                  ? 'No classes available for your account' 
                  : 'Select a class to mark attendance'}
              </p>
            )}
          </div>
        </div>
      </div>
      )}
    </MainLayout>
  );
}
