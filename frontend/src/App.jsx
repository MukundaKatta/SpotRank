import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BusinessList from './pages/BusinessList';
import BusinessForm from './pages/BusinessForm';
import BusinessDetail from './pages/BusinessDetail';
import PromptExecute from './pages/PromptExecute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center px-2 text-xl font-bold text-primary-600">
                  🎯 SpotRank
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/businesses"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Businesses
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/businesses/new"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  + Add Business
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/businesses/new" element={<BusinessForm />} />
            <Route path="/businesses/:id" element={<BusinessDetail />} />
            <Route path="/businesses/:id/edit" element={<BusinessForm />} />
            <Route path="/businesses/:businessId/prompts/:promptType" element={<PromptExecute />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              SpotRank - Powered by Claude AI
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
