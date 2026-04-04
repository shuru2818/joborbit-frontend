import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/Logo.jpeg" alt="Job Orbit Logo" className="w-10 h-10 object-cover rounded-xl shadow-lg border border-gray-200" />
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Job Orbit</span>
            </Link>
            <p className="hidden sm:block text-sm text-gray-500">AI job tracker</p>
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Dashboard</Link>
            <Link to="/addjob" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Add Job</Link>
            <Link to="/upload-resume" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Upload Resume</Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-full">
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username || user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/signup" className="text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden absolute inset-x-0 top-full z-30 border-t border-gray-100 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className="block text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleMenu}>Home</Link>
            <Link to="/dashboard" className="block text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/addjob" className="block text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleMenu}>Add Job</Link>
            <Link to="/upload-resume" className="block text-gray-700 font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleMenu}>Upload Resume</Link>
            <div className="border-t border-gray-100" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="block text-gray-600 px-3 py-2">{user.username || user.email}</span>
                </div>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={toggleMenu}>Login</Link>
                <Link to="/signup" className="block text-white bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors" onClick={toggleMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;