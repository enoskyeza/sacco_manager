import { Store, Clock } from 'lucide-react';

export default function BusinessComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center max-w-md">
        <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Store className="text-indigo-600" size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Business Management
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="text-indigo-600" size={20} />
          <p className="text-xl font-medium text-indigo-600">
            Coming Soon
          </p>
        </div>
        
        <p className="text-gray-600 mb-8">
          Full business operations including inventory management, sales tracking, 
          and point-of-sale system will be available here soon.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">What's Coming:</h3>
          <ul className="text-left space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Stock/Inventory Management</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Point of Sale (POS) System</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Sales Reports & Analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Business Performance Tracking</span>
            </li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Configure your business settings in <strong>Settings → Businesses</strong>
        </p>
      </div>
    </div>
  );
}
