import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold text-blue-600">ApplySmart</Link>
            <p className="hidden sm:block text-sm text-gray-500">AI job tracker</p>
          </div>

          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link to="/addjob" className="text-sm font-medium text-gray-700 hover:text-blue-600">Add Job</Link>
            <Link to="/upload-resume" className="text-sm font-medium text-gray-700 hover:text-blue-600">Upload Resume</Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hello, {user.username || user.email}</span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 text-sm font-medium text-gray-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">Login</Link>
                <Link to="/signup" className="text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden absolute inset-x-0 top-full z-30 border-t border-gray-100 bg-white shadow-md">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" className="block text-gray-700 font-medium px-3 py-2 rounded hover:bg-gray-100" onClick={toggleMenu}>Home</Link>
            <Link to="/dashboard" className="block text-gray-700 font-medium px-3 py-2 rounded hover:bg-gray-100" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/addjob" className="block text-gray-700 font-medium px-3 py-2 rounded hover:bg-gray-100" onClick={toggleMenu}>Add Job</Link>
            <Link to="/upload-resume" className="block text-gray-700 font-medium px-3 py-2 rounded hover:bg-gray-100" onClick={toggleMenu}>Upload Resume</Link>
            <div className="border-t border-gray-100" />
            {user ? (
              <>
                <span className="block text-gray-600 px-3 py-2">Hello, {user.username || user.email}</span>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-blue-600 px-3 py-2 rounded hover:bg-gray-100" onClick={toggleMenu}>Login</Link>
                <Link to="/signup" className="block text-white bg-blue-600 px-3 py-2 rounded hover:bg-blue-700" onClick={toggleMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;