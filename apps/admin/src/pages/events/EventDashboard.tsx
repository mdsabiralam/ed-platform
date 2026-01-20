import { useState, useEffect } from 'react';

interface Event {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location: string;
}

export default function EventDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newEvent, setNewEvent] = useState({
    name: '',
    startTime: '',
    endTime: '',
    location: '',
    tenantId: 'default-tenant-id' // Replace with actual tenant ID from auth
  });

  // Load Events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Replace with your actual backend URL
      const response = await fetch('http://localhost:3000/api/event/list'); 
      // Note: backend e list endpoint add kora lagbe, apatoto placeholder
      if(response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        alert('Event Created Successfully!');
        setShowModal(false);
        fetchEvents(); // Refresh list
      } else {
        alert('Failed to create event');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Event Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Create New Event
        </button>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 && !loading && <p>No events found.</p>}
        {events.map((event) => (
          <div key={event.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
            <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
            <p className="text-gray-600">📍 {event.location || 'Campus'}</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Start: {new Date(event.startTime).toLocaleString()}</p>
              <p>End: {new Date(event.endTime).toLocaleString()}</p>
            </div>
            <button className="mt-4 w-full bg-gray-100 text-indigo-600 py-2 rounded hover:bg-gray-200">
              Manage Duties
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded"
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Location</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded"
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full border p-2 rounded"
                  value={newEvent.startTime}
                  onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full border p-2 rounded"
                  value={newEvent.endTime}
                  onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}