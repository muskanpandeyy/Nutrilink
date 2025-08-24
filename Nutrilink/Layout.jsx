import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ClipboardList, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Footer from './Footer';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <Outlet />
        </div>
        {isHomePage && <Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <Package className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">NutriLink</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 space-y-2">
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

            <Link
              to="/donations"
              className={`flex items-center px-4 py-2 rounded-lg ${
                location.pathname === '/donations'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5 mr-3" />
              {user?.role === 'donor' ? 'My Donations' : 'Browse Donations'}
            </Link>

            {user?.role === 'receiver' && (
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
            )}

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

            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      {isHomePage && <Footer />}
    </div>
  );
};

export default Layout;