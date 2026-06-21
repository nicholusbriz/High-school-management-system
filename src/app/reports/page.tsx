'use client';

import { useState, useEffect } from 'react';
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import api from '@/lib/api';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // In a real app, this would fetch from a reports API
      // For now, we'll use placeholder data
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const reports = [
    {
      id: 1,
      title: 'Student Performance Report',
      description: 'Comprehensive analysis of student grades and performance',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      id: 2,
      title: 'Attendance Report',
      description: 'Daily and monthly attendance statistics',
      icon: Users,
      color: 'green',
    },
    {
      id: 3,
      title: 'Course Enrollment Report',
      description: 'Overview of course enrollments and capacity',
      icon: BarChart3,
      color: 'purple',
    },
    {
      id: 4,
      title: 'Grade Distribution Report',
      description: 'Statistical analysis of grade distributions',
      icon: FileText,
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
  };

  return (
    <MainLayout>
      {loading ? (
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Generate and view system reports</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-full ${colorClasses[report.color as keyof typeof colorClasses]}`}>
                    <Icon size={24} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {report.description}
                    </p>
                    <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-medium">
                      Generate Report →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reports generated yet
              </div>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{report.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.date}</p>
                  </div>
                  <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}
    </MainLayout>
  );
}
