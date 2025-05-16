import { Mail } from 'lucide-react';

function Credits() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
      
      <div className="card p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Sviluppatore</h2>
            <p className="text-gray-700">Made by Benjamin Pistocchi</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Collaborazioni</h2>
            <div className="flex items-center space-x-2 text-gray-700">
              <Mail className="h-5 w-5 text-primary-600" />
              <a href="mailto:bp.business.com" className="hover:text-primary-600 transition-colors">
                bp.business.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Credits