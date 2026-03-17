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

 return(

  <div className="min-h-screen bg-gray-100 p-10">

   {message.text && (
    <div className={`mb-6 p-4 rounded-lg text-white font-semibold ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message.text}
    </div>
   )}

   <h1 className="text-2xl font-bold mb-6">
    Your Jobs
   </h1>
   <button
    onClick={() => navigate('/addjob')}
    className="mb-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors duration-200"
   >
    + Add Job
   </button>

   {/* Resume Upload Section */}
   <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
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

    {jobs.map((job)=>(
     
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

    ))}

   </div>

  </div>

 )

}

export default Dashboard