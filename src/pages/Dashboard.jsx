import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function Dashboard(){
 const navigate = useNavigate()

 const [jobs,setJobs] = useState([])
 const [uploadedResume, setUploadedResume] = useState(null)
 const [uploading, setUploading] = useState(false)
 const [message, setMessage] = useState({ type: '', text: '' })
 const [missingSkills, setMissingSkills] = useState({})
 const [searchQuery, setSearchQuery] = useState('')
 const fileInputRef = useRef(null)
 const messageTimeoutRef = useRef(null)

 const showMessage = (type, text) => {
  setMessage({ type, text })
  if (messageTimeoutRef.current) {
    clearTimeout(messageTimeoutRef.current)
  }
  messageTimeoutRef.current = setTimeout(() => {
    setMessage({ type: '', text: '' })
  }, 3000)
 }

 useEffect(()=>{

  const fetchJobs = async()=>{

   try{

    const res = await API.get("/jobs/getjobs")

    setJobs(res.data.jobs)

   }catch(err){
    console.log(err)
   }

  } 

  const fetchResume = async () => {
    try {
      const res = await API.get('/resume/getresume')
      setUploadedResume(res.data)
    } catch (err) {
      console.log('No resume found or error:', err)
    }
  }

  fetchJobs()
  fetchResume()

 },[])

 const handleFileUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('resume', file)

  setUploading(true)
  try {
    const res = await API.post('/resume/uploadresume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    setUploadedResume(res.data)
    showMessage('success', 'Resume uploaded successfully!')
  } catch (err) {
    console.log(err)
    showMessage('error', err.response?.data?.message || 'Failed to upload resume')
  } finally {
    setUploading(false)
  }
 }

 const handleDeleteResume = async () => {
  try {
    await API.delete('/resume/deleteresume')
    setUploadedResume(null)
    setJobs(jobs.map(job => job.matchScore > 0 ? { ...job, matchScore: 0 } : job))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    showMessage('success', 'Resume deleted successfully!')
  } catch (err) {
    console.log(err)
    showMessage('error', err.response?.data?.message || 'Failed to delete resume')
  }
 }

 const handleMatch = async (jobId) => {
  if (!uploadedResume) {
    showMessage('error', 'Please upload a resume first')
    return
  }

  try {
    const res = await API.post(`/jobs/${jobId}/match`, {
      resumeId: uploadedResume._id
    })
    
    // Update the job's match score in the state
    setJobs(jobs.map(job => 
      job._id === jobId 
        ? { ...job, matchScore: res.data.matchScore } 
        : job
    ))
    setMissingSkills(prev => ({ ...prev, [jobId]: res.data.missing || [] }))
    showMessage('success', `Match score: ${res.data.matchScore}%`)

  } catch (err) {
    console.log(err)
    showMessage('error', err.response?.data?.message || 'Failed to calculate match')
  }
 }

 const handleUpdateStatus = async (jobId, newStatus) => {
  try {
    const res = await API.put(`/jobs/${jobId}/updatejob`, { status: newStatus })
    setJobs(jobs.map(job => 
      job._id === jobId 
        ? { ...job, status: res.data.status } 
        : job
    ))
    showMessage('success', `Status updated to ${newStatus}`)
  } catch (err) {
    console.log(err)
    showMessage('error', err.response?.data?.message || 'Failed to update status')
  }
 }

 const handleDeleteJob = async (jobId) => {
  try {
    await API.delete(`/jobs/${jobId}/deletejob`)
    setJobs(jobs.filter(job => job._id !== jobId))
    setMissingSkills(prev => {
      const updated = { ...prev }
      delete updated[jobId]
      return updated
    })
    showMessage('success', 'Job deleted successfully!')
  } catch (err) {
    console.log(err)
    showMessage('error', err.response?.data?.message || 'Failed to delete job')
  }
 }

 const filteredJobs = jobs.filter(job => {
  const q = searchQuery.trim().toLowerCase()
  if (!q) return true
  return (
    job.companyName.toLowerCase().includes(q) ||
    job.role.toLowerCase().includes(q) ||
    (job.status || '').toLowerCase().includes(q)
  )
 })

 const totalJobs = jobs.length
 const verifiedJobs = jobs.filter(job => job.matchScore > 0).length
 const resumeStatus = uploadedResume ? 'Uploaded' : 'Not uploaded'

 return(

  <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-rose-50 p-10">

   {message.text && (
    <div className={`mb-6 p-4 rounded-lg text-white font-semibold ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message.text}
    </div>
   )}

   <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
    <div className="lg:col-span-3 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Recruitment Dashboard</h1>
      <p className="text-sm text-gray-500">Manage jobs, resume analytics and match scores in one place. Make your career decisions smarter with AI insights.</p>
    </div>
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Total Jobs</div>
        <div className="text-2xl font-bold text-blue-700">{totalJobs}</div>
      </div>
      <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full">📊</div>
    </div>
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Matched Jobs</div>
        <div className="text-2xl font-bold text-green-700">{verifiedJobs}</div>
      </div>
      <div className="bg-green-100 text-green-700 px-3 py-2 rounded-full">✅</div>
    </div>
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Resume</div>
        <div className="text-2xl font-bold text-purple-700">{resumeStatus}</div>
      </div>
      <div className="bg-purple-100 text-purple-700 px-3 py-2 rounded-full">📄</div>
    </div>
   </div>

   <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
     <div className="flex items-center gap-2 w-full sm:w-auto">
       <input
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         type="text"
         placeholder="Search company, role, status..."
         className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
       />
       <button
         onClick={() => setSearchQuery('')}
         className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-100"
       >
         Clear
       </button>
     </div>
     <button
       onClick={() => navigate('/addjob')}
       className="px-6 py-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-xl transition-all"
     >
       + Add Job
     </button>
   </div>

   <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-100">
    <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
    <div className="flex items-center space-x-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={uploading}
      />
      {uploading && <span className="text-blue-600">Uploading...</span>}
      {uploadedResume && (
        <div className="flex items-center space-x-2">
          <span className="text-green-600">Resume uploaded: {uploadedResume.fileName}</span>
          <button
            onClick={handleDeleteResume}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {filteredJobs.length > 0 ? filteredJobs.map((job)=>(
     
     <div
      key={job._id}
      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
     >

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
       {job.companyName}
      </h2>

      <p className="text-gray-600 mb-3">
       {job.role}
      </p>

      <div className="flex justify-between items-center mb-2">
        <select
          value={job.status}
          onChange={(e) => handleUpdateStatus(job._id, e.target.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
            job.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
            job.status === 'Interview' ? 'bg-yellow-100 text-yellow-800' :
            job.status === 'Rejected' ? 'bg-red-100 text-red-800' :
            job.status === 'Selected' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Rejected">Rejected</option>
          <option value="Selected">Selected</option>
        </select>
        <button
          onClick={() => handleDeleteJob(job._id)}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-sm text-gray-500 mr-2">Match Score:</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${job.matchScore || 0}%` }}
          ></div>
        </div>
        <span className="text-sm font-semibold text-gray-700 ml-2">{job.matchScore || 0}%</span>
      </div>

      {missingSkills[job._id] && missingSkills[job._id].length > 0 && (
        <div className="mb-4 p-3 bg-red-50 rounded">
          <p className="text-sm font-semibold text-red-800 mb-2">Missing Skills:</p>
          <div className="flex flex-wrap gap-2">
            {missingSkills[job._id].map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => handleMatch(job._id)}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 mb-2"
        disabled={!uploadedResume}
      >
        Match with Resume
      </button>

      <button
        onClick={() => navigate(`/jobdetail/${job._id}`)}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
      >
        View Details
      </button>

     </div>

    )) : (
      <div className="lg:col-span-3 col-span-1 text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">No matching jobs found</h3>
        <p className="text-sm text-gray-500 mt-2">Try changing your search or add a new job.</p>
      </div>
    )}

   </div>

  </div>

 )

}

export default Dashboard