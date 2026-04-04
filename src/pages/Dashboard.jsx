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
 const [showResumeModal, setShowResumeModal] = useState(false)
 const [statusFilter, setStatusFilter] = useState('All')
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
    setShowResumeModal(true)
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
  const matchesSearch = !q || (
    job.companyName.toLowerCase().includes(q) ||
    job.role.toLowerCase().includes(q) ||
    (job.status || '').toLowerCase().includes(q)
  )
  const matchesFilter = statusFilter === 'All' || job.status === statusFilter
  return matchesSearch && matchesFilter
 })

 const totalJobs = jobs.length
 const appliedCount = jobs.filter(job => job.status === 'Applied').length
 const interviewCount = jobs.filter(job => job.status === 'Interview').length
 const selectedCount = jobs.filter(job => job.status === 'Selected').length
 const rejectedCount = jobs.filter(job => job.status === 'Rejected').length
 const verifiedJobs = jobs.filter(job => job.matchScore > 0).length
 const resumeStatus = uploadedResume ? 'Uploaded' : 'Not uploaded'

 return(

  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 lg:p-10">

   {/* Resume Modal */}
   {showResumeModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-8">
          <div className="w-16 h-16 bg-linear-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Resume Required</h3>
          <p className="text-gray-600 text-center mb-6">
            Please upload your resume first to calculate skill match scores with job postings.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                fileInputRef.current?.click()
                setShowResumeModal(false)
              }}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Resume Now
            </button>
            <button
              onClick={() => setShowResumeModal(false)}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
   )}

   {message.text && (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-white font-semibold shadow-2xl transition-all duration-300 ${
      message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center">
        {message.type === 'success' ? (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {message.text}
      </div>
    </div>
   )}

   <div className="max-w-7xl mx-auto">
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
          Job Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          {filteredJobs.length} of {totalJobs} jobs • {verifiedJobs} matched 
        </p>
      </div>
      <button
        onClick={() => navigate('/addjob')}
        className="inline-flex items-center px-5 py-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white font-semibold text-sm rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Job
      </button>
    </div>

    <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search jobs..."
            className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200 text-sm"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`inline-flex items-center px-4 py-2 text-white font-semibold text-xs rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer ${
            uploadedResume 
              ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
              : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Uploading...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="hidden sm:inline">{uploadedResume ? 'Resume ✓' : 'Upload Resume'}</span>
              <span className="sm:hidden">{uploadedResume ? '✓' : 'Upload'}</span>
            </>
          )}
        </button>
        {uploadedResume && (
          <button
            onClick={handleDeleteResume}
            className="inline-flex items-center px-3 py-2 bg-red-500 text-white font-semibold text-xs rounded-lg hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>

    <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
      {['All', 'Applied', 'Interview', 'Selected', 'Rejected'].map((status) => {
        let count = 0
        if (status === 'All') count = totalJobs
        else if (status === 'Applied') count = appliedCount
        else if (status === 'Interview') count = interviewCount
        else if (status === 'Selected') count = selectedCount
        else if (status === 'Rejected') count = rejectedCount
        
        return (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {status}
            <span className={`ml-2 font-bold ${
              statusFilter === status ? 'text-blue-100' : 'text-blue-600'
            }`}>
              {count}
            </span>
          </button>
        )
      })}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
     <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-white/20 flex items-center gap-3">
       <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
         </svg>
       </div>
       <div>
         <p className="text-xs text-gray-600 uppercase tracking-wide">Total Jobs</p>
         <p className="text-xl font-bold text-blue-600">{totalJobs}</p>
       </div>
     </div>

     <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-white/20 flex items-center gap-3">
       <div className="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
       </div>
       <div>
         <p className="text-xs text-gray-600 uppercase tracking-wide">Matched</p>
         <p className="text-xl font-bold text-green-600">{verifiedJobs}</p>
       </div>
     </div>

     <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-white/20 flex items-center gap-3">
       <div className={`w-8 h-8 bg-linear-to-r ${uploadedResume ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
         </svg>
       </div>
       <div>
         <p className="text-xs text-gray-600 uppercase tracking-wide">Resume</p>
         <p className={`text-sm font-bold ${uploadedResume ? 'text-green-600' : 'text-red-600'}`}>
           {resumeStatus}
         </p>
       </div>
     </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
     {filteredJobs.length > 0 ? filteredJobs.map((job)=>(
      <div
       key={job._id}
       className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-white/20 hover:-translate-y-1 group"
      >
       <div className="flex items-start justify-between mb-3">
         <div className="flex-1 min-w-0">
           <h3 className="text-sm font-bold text-gray-900 truncate">{job.companyName}</h3>
           <p className="text-xs text-gray-600 truncate">{job.role}</p>
         </div>
         <select
           value={job.status}
           onChange={(e) => handleUpdateStatus(job._id, e.target.value)}
           className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer border-0 ml-2 flex-shrink-0 ${
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
       </div>

       <div className="mb-3">
         <div className="flex items-center justify-between mb-1">
           <span className="text-xs font-medium text-gray-700">Match</span>
           <span className="text-sm font-bold text-gray-900">{job.matchScore || 0}%</span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2">
           <div
             className="bg-linear-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
             style={{ width: `${job.matchScore || 0}%` }}
           ></div>
         </div>
       </div>

       {missingSkills[job._id] && missingSkills[job._id].length > 0 && (
         <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
           <p className="text-xs font-semibold text-red-800 mb-1">Missing Skills:</p>
           <div className="flex flex-wrap gap-1">
             {missingSkills[job._id].slice(0, 2).map((skill, idx) => (
               <span key={idx} className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                 {skill}
               </span>
             ))}
             {missingSkills[job._id].length > 2 && (
               <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                 +{missingSkills[job._id].length - 2}
               </span>
             )}
           </div>
         </div>
       )}

       <div className="grid grid-cols-2 gap-2">
         <button
           onClick={() => handleMatch(job._id)}
           className="col-span-2 inline-flex items-center justify-center px-3 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
           disabled={!uploadedResume}
           title="Match Resume"
         >
           <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           Match
         </button>

         <button
           onClick={() => navigate(`/jobdetail/${job._id}`)}
           className="inline-flex items-center justify-center px-3 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
           title="View Details"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
           </svg>
         </button>

         <button
           onClick={() => handleDeleteJob(job._id)}
           className="inline-flex items-center justify-center px-3 py-2 bg-red-500 text-white font-semibold text-xs rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
           title="Delete Job"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
           </svg>
         </button>
       </div>
      </div>
     )) : (
       <div className="col-span-full text-center py-12">
         <div className="w-20 h-20 bg-linear-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
           </svg>
         </div>
         <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs found</h3>
         <p className="text-sm text-gray-600 mb-4">Try adjusting your search or add a new job.</p>
         <button
           onClick={() => navigate('/addjob')}
           className="inline-flex items-center px-5 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
         >
           <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
           </svg>
           Add Job
         </button>
       </div>
     )}
    </div>
   </div>
  </div>
 )
}

export default Dashboard