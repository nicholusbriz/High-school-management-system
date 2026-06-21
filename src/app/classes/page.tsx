'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import MainLayout from '@/components/MainLayout';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

interface Class {
  id: number;
  section: string;
  room_number: string;
  schedule: string;
  capacity: number;
  course: {
    code: string;
    name: string;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [userRole, setUserRole] = useState<string>('teacher');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchClasses();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUserRole(userData.role?.name?.toLowerCase() || 'teacher');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {loading ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">Manage your assigned classes</p>
          </div>
          <CardSkeleton count={3} />
        </div>
      ) : (
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Classes</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">Manage your assigned classes</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {classes.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No classes assigned yet. Contact administration to get class assignments.
                </p>
              </div>
            ) : (
              classes.map((classItem) => (
                <div key={classItem.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {classItem.course?.name || 'Unknown Course'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {classItem.course?.code} - Section {classItem.section}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Room:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {classItem.room_number || 'TBA'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {classItem.schedule || 'TBA'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        0/{classItem.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm sm:text-base">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      )}
    </MainLayout>
  );
}
