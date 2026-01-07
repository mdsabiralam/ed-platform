import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ConciergeRequest {
  id: string;
  teacher: {
    user: {
      firstName: string;
      lastName: string;
    }
  };
  subject: string;
  receivedAt: string;
  status: string;
}

const JobQueue: React.FC = () => {
  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/concierge/requests?status=PENDING_OR_PROCESSING')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setRequests(data))
      .catch(err => {
        console.error("Fetch failed, falling back to mock data", err);
        // Fallback Mock Data for Development/Demo if backend is offline
        setRequests([
          {
            id: '1',
            teacher: { user: { firstName: 'John', lastName: 'Doe' } },
            subject: 'Math',
            receivedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            status: 'PENDING'
          },
          {
            id: '2',
            teacher: { user: { firstName: 'Jane', lastName: 'Smith' } },
            subject: 'Science',
            receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            status: 'PENDING'
          }
        ]);
      });
  }, []);

  const isSlaBreach = (receivedAt: string) => {
    const diff = Date.now() - new Date(receivedAt).getTime();
    return diff > 2 * 60 * 60 * 1000;
  };

  const handleTakeJob = (id: string) => {
    fetch(`/api/concierge/requests/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId: 'current-user-id' })
    }).catch(console.error);
    navigate(`/workbench/${id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Queue</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-2 px-4 text-left">Request ID</th>
              <th className="py-2 px-4 text-left">Teacher Name</th>
              <th className="py-2 px-4 text-left">Subject</th>
              <th className="py-2 px-4 text-left">Received At</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className={`border-b ${isSlaBreach(req.receivedAt) ? 'bg-red-50' : ''}`}
              >
                <td className="py-2 px-4">{req.id}</td>
                <td className="py-2 px-4">{req.teacher.user.firstName} {req.teacher.user.lastName}</td>
                <td className="py-2 px-4">{req.subject}</td>
                <td className="py-2 px-4">{new Date(req.receivedAt).toLocaleString()}</td>
                <td className="py-2 px-4">
                  {isSlaBreach(req.receivedAt) && (
                     <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">SLA Breach</span>
                  )}
                  {req.status}
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleTakeJob(req.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Take Job
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobQueue;
