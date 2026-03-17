import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

const JobDetail = () => {
  const { id: jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [missingSkills, setMissingSkills] = useState([])
  const [resume, setResume] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    status: '',
    applicationDate: '',
    interviewDate: '',
    followUpDate: '',
    notes: ''
  })
  const [updating, setUpdating] = useState(false)
  const editFormRef = useRef(null)

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await API.get(`/jobs/getjobs`)
        const foundJob = res.data.jobs.find(j => j._id === jobId)
        if (foundJob) {
          setJob(foundJob)
          setError('')

          // Fetch resume and calculate missing skills
          try {
            const resumeRes = await API.get('/resume/getresume')
            setResume(resumeRes.data)

            // Calculate missing skills by calling match API
            const matchRes = await API.post(`/jobs/${jobId}/match`, {
              resumeId: resumeRes.data._id
            })
            setMissingSkills(matchRes.data.missing || [])
          } catch (resumeErr) {
            console.log('No resume or match error:', resumeErr)
            setMissingSkills([])
          }
        } else {
          setError('Job not found')
        }
      } catch (err) {
        console.log('Error:', err)
        setError('Failed to fetch job details')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetail()
    } else {
      setError('No job ID provided')
      setLoading(false)
    }
  }, [jobId])

  const handleEditClick = () => {
    setEditForm({
      status: job.status,
      applicationDate: job.applicationDate ? job.applicationDate.split('T')[0] : '',
      interviewDate: job.interviewDate ? job.interviewDate.split('T')[0] : '',
      followUpDate: job.followUpDate ? job.followUpDate.split('T')[0] : '',
      notes: job.notes || ''
    })
    setIsEditing(true)
    
    // Scroll to edit form after it's rendered
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      status: '',
      applicationDate: '',
      interviewDate: '',
      followUpDate: '',
      notes: ''
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateJob = async (e) => {
    e.preventDefault()
    setUpdating(true)

    console.log('Updating job with data:', editForm)

    try {
      const res = await API.put(`/jobs/${jobId}/updatejob`, editForm)
      console.log('Update response:', res.data)
      setJob(res.data.job || res.data)
      setIsEditing(false)
      showMessage('success', 'Job updated successfully!')
    } catch (err) {
      console.log('Update error:', err)
      console.log('Error response:', err.response?.data)
      showMessage('error', err.response?.data?.message || 'Failed to update job')
    } finally {
      setUpdating(false)
    }
  }

  const showMessage = (type, text) => {
    // Simple alert for now, can be enhanced with proper message state
    if (type === 'success') {
      alert(text)
    } else {
      alert('Error: ' + text)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-10 text-center">Loading...</div>
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-100 p-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        > 
          ← Back to Dashboard
        </button>
        <div className="bg-red-100 p-4 rounded text-red-800">
          {error || 'Job not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          ← Back to Dashboard
        </button>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            ✏️ Edit Job
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{job.companyName}</h1>
          <p className="text-2xl text-gray-600 mb-4">{job.role}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              job.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
              job.status === 'Interview' ? 'bg-yellow-100 text-yellow-800' :
              job.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              job.status === 'Selected' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {job.status}
            </span>
            <span className="text-lg font-semibold text-gray-700">
              Match Score: {job.matchScore || 0}%
            </span>
          </div>
        </div>

        {job.jobLink && (
          <div className="mb-6">
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-lg"
            >
              View Job Posting →
            </a>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.jobDescription}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills && job.skills.length > 0 ? (
              job.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-600">No skills listed</p>
            )}
          </div>
        </div>

        {resume && missingSkills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Missing Skills</h2>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              These skills are required for this job but not found in your resume.
            </p>
          </div>
        )}

        {resume && missingSkills.length === 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Skills Match</h2>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✅ Great! Your resume contains all the required skills for this job.
              </p>
            </div>
          </div>
        )}

        {job.notes && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Notes</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded">
              {job.notes}
            </p>
          </div>
        )}

        {job.interviewDate && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Interview Date</h2>
            <p className="text-gray-700 text-lg">
              {new Date(job.interviewDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Application Timeline */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Application Timeline</h2>
          <div className="space-y-4">
            {/* Application Date */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-800">Application Submitted</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Applied</span>
                </div>
                <p className="text-gray-600">
                  {job.applicationDate ? new Date(job.applicationDate).toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Interview Date */}
            {job.interviewDate && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-800">Interview Scheduled</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Interview</span>
                  </div>
                  <p className="text-gray-600">
                    {new Date(job.interviewDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up Date */}
            {job.followUpDate && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-800">Follow-up Date</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Follow-up</span>
                  </div>
                  <p className="text-gray-600">
                    {new Date(job.followUpDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                job.status === 'Selected' ? 'bg-green-500' :
                job.status === 'Rejected' ? 'bg-red-500' :
                job.status === 'Interview' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-800">Current Status</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    job.status === 'Selected' ? 'bg-green-100 text-green-800' :
                    job.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    job.status === 'Interview' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-gray-600">
                  Last updated: {new Date(job.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div ref={editFormRef} className="mb-6 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Job</h2>
            <form onSubmit={handleUpdateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Selected">Selected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                  <input
                    type="date"
                    name="applicationDate"
                    value={editForm.applicationDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interview Date</label>
                  <input
                    type="date"
                    name="interviewDate"
                    value={editForm.interviewDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={editForm.followUpDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Job'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="border-t pt-6 mt-6">
          <p className="text-sm text-gray-500">
            Created: {new Date(job.createdAt).toLocaleDateString()} | Updated: {new Date(job.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default JobDetail