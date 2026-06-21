'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import MainLayout from '@/components/MainLayout';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  class: {
    course: {
      name: string;
    };
  };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userRole, setUserRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchAssignments();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUserRole(userData.role?.name?.toLowerCase() || 'student');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments');
      setAssignments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
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

  return (
    <MainLayout>
      {loading ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Assignments</h1>
            <p className="text-sm sm:text-base text-[#78716C] mt-2">View and submit your assignments</p>
          </div>
          <CardSkeleton count={3} />
        </div>
      ) : (
        <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Assignments</h1>
          <p className="text-sm sm:text-base text-[#78716C] mt-2">View and submit your assignments</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-[#78716C]">Loading assignments...</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {assignments.length === 0 ? (
              <div className="card p-6 sm:p-8 text-center">
                <p className="text-[#78716C]">
                  No assignments available
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment.id} className="card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-[#1C1917] mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#78716C] mb-2">
                        {assignment.class?.course?.name || 'Unknown Course'}
                      </p>
                      <p className="text-xs sm:text-sm text-[#44403C] mb-4">
                        {assignment.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-[#78716C]">
                          Due: {formatDate(assignment.due_date)}
                        </span>
                        <span className="text-[#78716C]">
                          Points: {assignment.max_score}
                        </span>
                      </div>
                    </div>
                    <button className="btn-primary w-full sm:w-auto text-sm sm:text-base">
                      Submit
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
