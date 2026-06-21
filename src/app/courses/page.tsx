'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import MainLayout from '@/components/MainLayout';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  grade_level: string;
  department: {
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userRole, setUserRole] = useState<string>('admin');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department_id: '',
    credits: '3',
    grade_level: '9',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUserRole(userData.role?.name?.toLowerCase() || 'admin');
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/departments'),
      ]);
      setCourses(coursesRes.data.data || coursesRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/courses', {
        ...formData,
        departmentId: parseInt(formData.department_id),
        credits: parseInt(formData.credits),
      });
      setShowModal(false);
      setFormData({
        code: '',
        name: '',
        description: '',
        department_id: '',
        credits: '3',
        grade_level: '9',
      });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'department_head', 'teacher', 'student']}>
      <MainLayout>
        {loading ? (
          <TableSkeleton rows={5} columns={4} />
        ) : (
          <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">Course Management</h1>
            <p className="text-sm sm:text-base text-[#78716C] mt-2">Manage all courses and curriculum</p>
          </div>

          <div className="card">
            <div className="p-6 border-b border-[#E7E5E4]">
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary"
            >
              Add New Course
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-[#78716C]">Loading courses...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#F5F5F4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Grade Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#57534E] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E7E5E4]">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-[#78716C]">
                        No courses found. Click "Add New Course" to create your first course.
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#1C1917]">
                            {course.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#1C1917]">{course.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#78716C]">
                            {course.department?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F3E8FF] text-[#9333EA]">
                            Grade {course.grade_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#78716C]">
                          {course.credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#1E3A8A] hover:text-[#1E40AF] mr-4">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Course Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 sm:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] mb-6">Add New Course</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#44403C] mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g., MATH101"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#44403C] mb-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Algebra I"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#44403C] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#44403C] mb-1">
                    Department
                  </label>
                  <select
                    required
                    value={formData.department_id}
                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#44403C] mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({...formData, credits: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#44403C] mb-1">
                      Grade Level
                    </label>
                    <select
                      value={formData.grade_level}
                      onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                      className="input"
                    >
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#D6D3D1] rounded-lg text-[#44403C] hover:bg-[#F5F5F4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      )}
      </MainLayout>
    </ProtectedRoute>
  );
}
