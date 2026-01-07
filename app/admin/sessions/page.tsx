'use client';

import { useState, useEffect } from 'react';

interface AdmissionSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock fetch - in real app, fetch from /api/admission/session
  useEffect(() => {
    // Simulated API call
    setSessions([
      {
        id: '1',
        name: '2024-2025',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      },
      {
        id: '2',
        name: '2023-2024',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        isActive: false,
      },
    ]);
  }, []);

  const handleToggleActive = async (id: string) => {
    // In real app, call POST /api/admission/session (update) or specific endpoint
    // For now, just update local state logic
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          return { ...session, isActive: true };
        }
        return { ...session, isActive: false }; // Enforce single active session
      })
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admission Session Manager</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap">{session.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{session.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{session.endDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(session.id)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      session.isActive ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className="sr-only">Toggle Active</span>
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        session.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
