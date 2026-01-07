import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JobQueue from './pages/JobQueue';
import Workbench from './pages/Workbench';
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white shadow p-4 flex justify-between items-center">
          <div className="font-bold text-xl text-blue-600">
            <Link to="/">EduMatrix Ops</Link>
          </div>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-500">Job Queue</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<JobQueue />} />
          <Route path="/workbench/:id" element={<Workbench />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
