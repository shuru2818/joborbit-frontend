import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold text-blue-600">JobOrbit</Link>
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/addjob" className="hover:text-blue-600">
            Add Job
          </Link>
          <Link to="/upload-resume" className="hover:text-blue-600">
            Upload Resume
          </Link>
        </div>

        <div className="space-x-5 text-sm md:text-base">
          {user ? (
            <>
              <span className="font-semibold text-gray-700">Hello, {user.username || user.name || user.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>
              <Link to="/signup" className="hover:text-blue-600">
                SignUp
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;