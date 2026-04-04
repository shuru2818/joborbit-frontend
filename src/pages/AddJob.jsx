import { useState } from "react"
import API from "../api/axios"
import { useNavigate } from "react-router-dom"

function AddJob(){

 const navigate = useNavigate()

 const [formData,setFormData] = useState({
  companyName:"",
  role:"",
  jobLink:"",
  jobDescription:"",
  status:"Applied",
  interviewDate:"",
  notes:""
 })

 const [loading, setLoading] = useState(false)

 const handleChange = (e)=>{
  setFormData({
   ...formData,
   [e.target.name]:e.target.value
  })
 }

 const handleSubmit = async(e)=>{
  e.preventDefault()
  setLoading(true)

  try{

   const res = await API.post("/jobs/addjob",formData)

   console.log(res.data)

   navigate("/")

  }catch(err){
   console.log(err.response?.data || err.message)
   setLoading(false)
  }
 }

 const inputClass = "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition duration-200 bg-white text-gray-700 placeholder-gray-400 text-sm"
 const labelClass = "block text-xs font-semibold text-gray-700 mb-1"

 return(

  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-6 px-4">

   <div className="w-full max-w-xl">

    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
     
     {/* Header */}
     <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
      <h1 className="text-2xl font-bold text-white">Add New Job</h1>
     </div>

     {/* Form Content */}
     <form onSubmit={handleSubmit} className="p-4 space-y-3">

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-2">
       <div>
        <label className={labelClass}>Company Name *</label>
        <input
         type="text"
         name="companyName"
         placeholder="Company"
         value={formData.companyName}
         onChange={handleChange}
         required
         className={inputClass}
        />
       </div>

       <div>
        <label className={labelClass}>Job Role *</label>
        <input
         type="text"
         name="role"
         placeholder="Role"
         value={formData.role}
         onChange={handleChange}
         required
         className={inputClass}
        />
       </div>
      </div>

      <div>
       <label className={labelClass}>Job Link</label>
       <input
        type="url"
        name="jobLink"
        placeholder="https://..."
        value={formData.jobLink}
        onChange={handleChange}
        className={inputClass}
       />
      </div>

      <div>
       <label className={labelClass}>Job Description *</label>
       <textarea
        name="jobDescription"
        placeholder="Paste job description..."
        rows="3"
        value={formData.jobDescription}
        onChange={handleChange}
        required
        className={inputClass + " resize-none"}
       />
      </div>

      <div className="grid grid-cols-2 gap-2">
       <div>
        <label className={labelClass}>Status *</label>
        <select
         name="status"
         value={formData.status}
         onChange={handleChange}
         className={inputClass}
        >
         <option value="Applied">Applied</option>
         <option value="Interview">Interview</option>
         <option value="Rejected">Rejected</option>
         <option value="Offer">Offer</option>
        </select>
       </div>

       <div>
        <label className={labelClass}>Interview Date</label>
        <input
         type="date"
         name="interviewDate"
         value={formData.interviewDate}
         onChange={handleChange}
         className={inputClass}
        />
       </div>
      </div>

      <div>
       <label className={labelClass}>Notes</label>
       <textarea
        name="notes"
        placeholder="Additional notes..."
        rows="2"
        value={formData.notes}
        onChange={handleChange}
        className={inputClass + " resize-none"}
       />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
       <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
       >
        {loading ? (
         <>
          <span className="animate-spin mr-2">⏳</span>
          Adding...
         </>
        ) : (
         "Add Job"
        )}
       </button>

       <button
        type="button"
        onClick={() => navigate("/")}
        className="px-6 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition duration-200 text-sm"
       >
        Cancel
       </button>
      </div>

     </form>

    </div>

   </div>

  </div>

 )

}

export default AddJob