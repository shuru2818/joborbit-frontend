import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom'

const UploadResume = () => {
    const navigate = useNavigate();
  const { user } = useContext(AuthContext)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file only')
        setFile(null)
        return
      }
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
      setMessage('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.append('resume', file)

    try {
       await axios.post('/resume/uploadresume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setMessage('Resume uploaded successfully! Skills extracted and saved.')
      setFile(null)
      // Reset file input
      document.getElementById('resume-file').value = ''
      navigate("/dashboard")
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Please log in to upload your resume
            </h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Upload Your Resume
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Upload your resume in PDF format to get AI-powered skill matching
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-2">
              Resume File (PDF only, max 5MB)
            </label>
            <input
              id="resume-file"
              name="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading}
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!file || uploading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">What happens next?</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 space-y-2">
            <p>• Your resume will be analyzed for skills and experience</p>
            <p>• Skills will be extracted and stored for job matching</p>
            <p>• You can upload a new resume anytime to update your profile</p>
            <p>• Previous resumes will be replaced with the new upload</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadResume;