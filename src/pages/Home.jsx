import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-blue-100">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight">
              ApplySmart: Your Job Hunt Command Center
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-lg">
              Track applications, update status, compare your resume skillset and never miss a follow-up again. Build your future with better job workflow and greater confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Go to Dashboard
              </Link>

              <Link
                to="/addjob"
                className="px-6 py-3 bg-white border border-blue-600 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg transition"
              >
                Add New Job
              </Link>

              <Link
                to="/upload-resume"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                Upload Resume
              </Link>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white border border-blue-100">
            <img
              src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1400&q=80"
              alt="Job tracking dashboard"
              className="w-full h-72 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-blue-900">What you can do</h3>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li>✔ Match your resume with job skills in one click.</li>
                <li>✔ Track application and interview timelines easily.</li>
                <li>✔ Set status to Applied / Interview / Selected / Rejected.</li>
                <li>✔ Keep notes, follow-up reminders, and job links handy.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-blue-200 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-blue-900 text-center">Why ApplySmart?</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Centralized job management',
                desc: 'View all your applications in a single dashboard with status and dates.'
              },
              {
                title: 'Skill match intelligence',
                desc: 'Compare job requirements against your resume and fill gaps quickly.'
              },
              {
                title: 'Faster follow-ups',
                desc: 'Record follow-up dates and interview milestones with ease.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
                <h3 className="font-semibold text-blue-800 text-xl">{item.title}</h3>
                <p className="mt-3 text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
