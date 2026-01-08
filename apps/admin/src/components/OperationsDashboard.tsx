// apps/admin/src/components/OperationsDashboard.tsx
import React, { useState, useEffect } from 'react';

// Types
interface Request {
    id: string;
    rawImageUrl: string;
    instructionText: string;
    status: string;
    teacher?: {
        user: {
            email: string;
        }
    };
}

interface ClassOption {
    id: string;
    name: string;
}

const OperationsDashboard: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [editorContent, setEditorContent] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock Classes for the dropdown (In real app, fetch from /api/classes)
    const mockClasses: ClassOption[] = [
        { id: 'class-1', name: 'Grade 9 - Section A' },
        { id: 'class-2', name: 'Grade 10 - Science' },
        { id: 'class-3', name: 'Grade 12 - Physics' },
    ];

    useEffect(() => {
        fetchRequests();
    }, []);

    const getToken = () => localStorage.getItem('token') || 'mock-dev-token';

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/concierge/requests?status=PENDING', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            } else {
                console.error('Failed to fetch requests', res.status);
            }
        } catch (err) {
            console.error('Network error fetching requests', err);
        }
    };

    const handlePublish = async () => {
        if (!selectedRequest) return;
        if (!selectedClassId) {
            alert('Please select a class to publish to.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/concierge/request/${selectedRequest.id}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    title: `Assignment from ${selectedRequest.teacher?.user.email || 'Teacher'}`,
                    description: editorContent,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default: 1 week due date
                    classId: selectedClassId
                })
            });

            if (res.ok) {
                alert('Assignment published successfully!');
                setEditorContent('');
                setSelectedClassId('');
                setSelectedRequest(null);
                fetchRequests(); // Refresh the queue
            } else {
                alert('Failed to publish assignment. Please try again.');
            }
        } catch (err) {
            console.error('Publish error', err);
            alert('An error occurred while publishing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
            {/* Sidebar / Job Queue */}
            <div className="job-queue" style={{ width: '300px', borderRight: '1px solid #ccc', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #ddd', background: '#fff' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Job Queue</h2>
                    <span style={{ fontSize: '12px', color: '#666' }}>{requests.length} Pending Requests</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {requests.length === 0 ? (
                        <div style={{ padding: '20px', color: '#999', textAlign: 'center' }}>No pending requests</div>
                    ) : (
                        requests.map(req => (
                            <div
                                key={req.id}
                                onClick={() => {
                                    setSelectedRequest(req);
                                    setEditorContent(''); // Reset editor on new selection
                                }}
                                style={{
                                    padding: '15px',
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    background: selectedRequest?.id === req.id ? '#e6f7ff' : 'white',
                                    borderLeft: selectedRequest?.id === req.id ? '4px solid #1890ff' : '4px solid transparent'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Request #{req.id.substring(0, 6)}</div>
                                <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px' }}>
                                    {req.instructionText || 'No instructions provided'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    Status: <span style={{ color: 'orange' }}>{req.status}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Workspace */}
            {selectedRequest ? (
                <div className="workspace" style={{ flex: 1, display: 'flex' }}>
                    {/* Left: Raw Input (Image) */}
                    <div className="image-view" style={{ flex: 1, background: '#222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
                         <img
                            src={selectedRequest.rawImageUrl}
                            alt="Teacher Request"
                            style={{ maxWidth: '100%', maxHeight: '80%', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                         />
                         <div style={{ marginTop: '20px', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', maxWidth: '80%' }}>
                             <strong>Instructions:</strong> {selectedRequest.instructionText}
                         </div>
                    </div>

                    {/* Right: Content Editor & Publish */}
                    <div className="editor-view" style={{ width: '400px', padding: '20px', display: 'flex', flexDirection: 'column', background: 'white', borderLeft: '1px solid #ccc' }}>
                        <h3 style={{ marginTop: 0 }}>Content Editor</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Target Class</label>
                            <select
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Select Class --</option>
                                {mockClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assignment Content</label>
                            <textarea
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none', fontFamily: 'monospace' }}
                                placeholder="Type Questions, Video Links, or Instructions here..."
                            />
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            style={{
                                padding: '15px',
                                background: loading ? '#ccc' : '#1890ff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Publishing...' : 'Publish to Students'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5', color: '#999', fontSize: '18px' }}>
                    Select a request from the queue to start processing
                </div>
            )}
        </div>
    );
};

export default OperationsDashboard;
