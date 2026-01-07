import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ConciergeRequestDetail {
  id: string;
  rawImageUrl: string;
  subject: string;
  // ... other fields
}

const Workbench: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ConciergeRequestDetail | null>(null);
  const [zoom, setZoom] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: ''
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/concierge/requests/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setRequest(data))
      .catch(err => {
        console.error("Fetch failed", err);
        setRequest({
          id: id || '1',
          rawImageUrl: 'https://via.placeholder.com/600x800.png?text=Textbook+Page',
          subject: 'Math'
        });
      });
  }, [id]);

  const handleAutoGenerate = () => {
    if (!request) return;
    fetch(`/api/concierge/requests/${request.id}/auto-generate`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.title || 'Auto-Generated Homework',
          description: data.description || 'Please solve the problems from the page.',
          questions: (data.questions || []).map((q: any) => `${q.q}\n${q.a}`).join('\n\n') || '1. What is 2+2?\n2. Calculate the area of...'
        });
      })
      .catch(() => {
        // Fallback Mock
        setFormData({
          title: 'Auto-Generated Homework',
          description: 'Please solve the problems from the page.',
          questions: '1. What is 2+2?\n2. Calculate the area of...'
        });
      });
  };

  const handlePublish = () => {
    if (!request) return;
    fetch(`/api/concierge/requests/${request.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      alert('Published and Notification Sent!');
      navigate('/');
    }).catch(err => console.error(err));
  };

  if (!request) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      {/* Left Panel: Image Viewer */}
      <div className="w-1/2 bg-gray-200 overflow-hidden relative border-r">
        <div className="absolute top-2 left-2 z-10 bg-white p-2 rounded shadow space-x-2">
          <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="px-2 border rounded">-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => z + 0.5)} className="px-2 border rounded">+</button>
        </div>
        <div
          className="w-full h-full flex items-center justify-center overflow-auto"
          style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
        >
          <img
            src={request.rawImageUrl}
            alt="Textbook"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease-out'
            }}
            className="max-w-none"
          />
        </div>
      </div>

      {/* Right Panel: Content Form */}
      <div className="w-1/2 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Create Content: {request.subject}</h2>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full border p-2 rounded h-24"
            />
          </div>
          <div>
             <label className="block text-sm font-medium mb-1">Questions / Content</label>
             <textarea
               value={formData.questions}
               onChange={e => setFormData({...formData, questions: e.target.value})}
               className="w-full border p-2 rounded h-48 font-mono text-sm"
             />
          </div>

          <button
            onClick={handleAutoGenerate}
            className="w-full bg-purple-100 text-purple-700 border border-purple-300 py-2 rounded hover:bg-purple-200 transition"
          >
            ✨ Auto-Generate with AI
          </button>
        </div>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={handlePublish}
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition"
          >
            Publish & Notify Teacher
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workbench;
