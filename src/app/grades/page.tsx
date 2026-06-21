'use client';

import { useEffect, useState } from 'react';
import { fetchCurrentUser } from '@/lib/routing';
import MainLayout from '@/components/MainLayout';
import CardSkeleton from '@/components/skeletons/CardSkeleton';
import api from '@/lib/api';

interface Class {
  id: number;
  section: string;
  course: {
    name: string;
  };
}

interface Grade {
  id: number;
  gradeType: string;
  score: number;
  maxScore: number;
  enrollment: {
    student: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function GradesPage() {
  const [userRole, setUserRole] = useState<string>('student');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { user } = await fetchCurrentUser();
      if (user) {
        setCurrentUser(user);
        setUserRole(user.role?.name?.toLowerCase() || 'student');
      }
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [classesRes, gradesRes] = await Promise.all([
        api.get('/classes'),
        api.get('/grades'),
      ]);
      
      const classesData = classesRes.data || [];
      const gradesData = gradesRes.data || [];

      // Filter classes based on user role
      let filteredClasses = classesData;
      if (userRole === 'teacher') {
        filteredClasses = classesData.filter((c: any) => c.teacherId === currentUser.id);
      }

      setClasses(filteredClasses);
      setGrades(gradesData);
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = userRole === 'teacher';

  return (
    <MainLayout>
      {loading ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
              {isTeacher ? 'Grade Management' : 'My Grades'}
            </h1>
            <p className="text-sm sm:text-base text-[#78716C] mt-2">
              {isTeacher ? 'Enter and manage student grades' : 'View your academic performance'}
            </p>
          </div>
          <CardSkeleton count={2} />
        </div>
      ) : (
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
            {isTeacher ? 'Grade Management' : 'My Grades'}
          </h1>
          <p className="text-sm sm:text-base text-[#78716C] mt-2">
            {isTeacher ? 'Enter and manage student grades' : 'View your academic performance'}
          </p>
        </div>

        <div className="card p-4 sm:p-6">
          {isTeacher ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#44403C] mb-2">
                  Select Class
                </label>
                <select 
                  className="input w-full sm:w-64"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.course?.name} - Section {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {selectedClass ? 'Grades for selected class will appear here' : 'Select a class to view and enter grades'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {grades.length === 0 ? 'No grades available yet' : 'Your grades will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
      )}
    </MainLayout>
  );
}
