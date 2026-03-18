import { React } from "react";
import {BrowserRouter , Routes , Route} from  "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./compontents/Navbar";
import Footer from "./compontents/Footer";
import ProtectedRoute from "./compontents/ProtectedRoute.jsx";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OTPVerify from "./pages/OTPVerify";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import JobDetail from "./pages/JobDetail";
import UploadResume from "./pages/UploadResume";
import Home from "./pages/Home.jsx"

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="grow">
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login/>} />
              <Route path="/signup" element={<SignUp/>} />
              <Route path="/verify" element={<OTPVerify/>} />
              <Route path="/addjob" element={<ProtectedRoute><AddJob/></ProtectedRoute>} />
              <Route path="/jobdetail/:id" element={<ProtectedRoute><JobDetail/></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
              <Route path="/upload-resume" element={<ProtectedRoute><UploadResume/></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;