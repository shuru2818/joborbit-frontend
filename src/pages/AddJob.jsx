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

 const handleChange = (e)=>{
  setFormData({
   ...formData,
   [e.target.name]:e.target.value
  })
 }

 const handleSubmit = async(e)=>{
  e.preventDefault()

  try{

   const res = await API.post("/jobs/addjob",formData)

   console.log(res.data)

   navigate("/")

  }catch(err){
   console.log(err.response?.data || err.message)
  }
 }

 return(

  <div className="min-h-screen bg-gray-100 flex items-center justify-center">

   <div className="bg-white p-8 rounded-lg shadow-md w-[550px]">

    <h2 className="text-2xl font-bold mb-6 text-center">
     Add New Job
    </h2>

    <form onSubmit={handleSubmit} className="space-y-4">

     <input
      type="text"
      name="companyName"
      placeholder="Company Name"
      value={formData.companyName}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <input
      type="text"
      name="role"
      placeholder="Job Role"
      value={formData.role}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <input
      type="text"
      name="jobLink"
      placeholder="Job Link"
      value={formData.jobLink}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <textarea
      name="jobDescription"
      placeholder="Paste Job Description"
      rows="5"
      value={formData.jobDescription}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <select
      name="status"
      value={formData.status}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     >
      <option value="Applied">Applied</option>
      <option value="Interview">Interview</option>
      <option value="Rejected">Rejected</option>
      <option value="Offer">Offer</option>
     </select>

     <input
      type="date"
      name="interviewDate"
      value={formData.interviewDate}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <textarea
      name="notes"
      placeholder="Notes"
      rows="3"
      value={formData.notes}
      onChange={handleChange}
      className="w-full border p-2 rounded"
     />

     <button
      type="submit"
      className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
     >
      Add Job
     </button>

    </form>

   </div>

  </div>

 )

}

export default AddJob