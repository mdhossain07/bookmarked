function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
          📚 Bookmarked
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Your personal media tracking application
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Frontend Status
            </h2>
            <p className="text-blue-700 text-sm">
              React application is running successfully!
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-900 mb-2">Backend API</h2>
            <p className="text-green-700 text-sm">
              API server should be running on port 3001
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h2 className="font-semibold text-purple-900 mb-2">Shared Types</h2>
            <p className="text-purple-700 text-sm">
              TypeScript types package is configured
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Phase 1: Foundation & Setup Complete
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
