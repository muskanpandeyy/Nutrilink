import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ClipboardList, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isDonor = user?.role === 'donor';
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          {/* Dashboard Link */}
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 rounded-lg ${
              location.pathname === '/dashboard'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          {/* Role-specific Links */}
          {isDonor ? (
            <Link
              to="/donations"
              className={`flex items-center px-4 py-2 rounded-lg ${
                location.pathname === '/donations'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5 mr-3" />
              My Donations
            </Link>
          ) : (
            <>
              <Link
                to="/donations"
                className={`flex items-center px-4 py-2 rounded-lg ${
                  location.pathname === '/donations'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Package className="h-5 w-5 mr-3" />
                Browse Donations
              </Link>
              <Link
                to="/requests"
                className={`flex items-center px-4 py-2 rounded-lg ${
                  location.pathname === '/requests'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="h-5 w-5 mr-3" />
                My Requests
              </Link>
            </>
          )}

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`flex items-center px-4 py-2 rounded-lg ${
              location.pathname === '/settings'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 rounded-lg p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;