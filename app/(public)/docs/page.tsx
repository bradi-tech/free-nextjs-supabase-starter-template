import React from 'react'

export default function Docs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation</h1>
          <p className="text-lg text-gray-600">
            Everything you need to get started and build amazing applications.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Getting Started Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="bg-white rounded-lg border p-6">
              <p className="text-gray-700 mb-4">
                Welcome to our platform! Here's how to get started quickly:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Create your account or sign in</li>
                <li>Set up your workspace</li>
                <li>Explore the available features</li>
                <li>Start building your first project</li>
              </ol>
            </div>
          </section>

          {/* Quick Links Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Reference</h3>
                <p className="text-gray-600 mb-4">
                  Complete reference for all available APIs and endpoints.
                </p>
                <a href="#api" className="text-blue-600 hover:text-blue-700 font-medium">
                  View API docs →
                </a>
              </div>
              
              <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Examples</h3>
                <p className="text-gray-600 mb-4">
                  Code examples and tutorials to help you get started.
                </p>
                <a href="#examples" className="text-blue-600 hover:text-blue-700 font-medium">
                  Browse examples →
                </a>
              </div>
            </div>
          </section>

          {/* API Reference Section */}
          <section id="api">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">API Reference</h2>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Authentication</h3>
              <p className="text-gray-700 mb-4">
                All API requests require authentication. Include your API key in the header:
              </p>
              <div className="bg-gray-900 rounded-md p-4 mb-4">
                <code className="text-green-400 text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">Base URL</h3>
              <div className="bg-gray-900 rounded-md p-4">
                <code className="text-green-400 text-sm">
                  https://api.example.com/v1/
                </code>
              </div>
            </div>
          </section>

          {/* Examples Section */}
          <section id="examples">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Examples</h2>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Request</h3>
              <p className="text-gray-700 mb-4">
                Here's a simple example of making a request:
              </p>
              <div className="bg-gray-900 rounded-md p-4">
                <code className="text-green-400 text-sm block whitespace-pre">{`fetch('/api/data', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <p className="text-blue-800 mb-4">
                Can't find what you're looking for? We're here to help!
              </p>
              <div className="space-y-2">
                <p className="text-blue-700">
                  📧 Email: <span className="font-medium">support@example.com</span>
                </p>
                <p className="text-blue-700">
                  💬 Discord: <span className="font-medium">Join our community</span>
                </p>
                <p className="text-blue-700">
                  📚 More resources: <span className="font-medium">Check our knowledge base</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}