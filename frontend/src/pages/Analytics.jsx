import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";

function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/analytics/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics."));
  }, []);

  return (
    <div className="min-h-screen app-bg text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pb-8 space-y-8">
        {error && <p className="text-red-400">{error}</p>}
        {!data && !error && <p>Loading...</p>}

        {data && (
          <>
            <h1 className="text-2xl font-bold">Your Performance</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Interview Sessions</p>
                <p className="text-3xl font-bold">{data.total_interview_sessions}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Avg Score</p>
                <p className="text-3xl font-bold">
                  {data.overall_average_score !== null ? `${data.overall_average_score}/10` : "—"}
                </p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Coding Attempts</p>
                <p className="text-3xl font-bold">{data.coding_submissions_count}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-gray-400 text-sm">SQL Attempts</p>
                <p className="text-3xl font-bold">{data.sql_attempts_count}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Interview History</h2>
              {data.sessions.length === 0 ? (
                <p className="text-gray-400">No interview sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((s) => (
                    <button
                      key={s.session_id}
                      onClick={() => navigate(`/session/${s.session_id}`)}
                      className="w-full text-left bg-black/20 backdrop-blur-sm hover:bg-black/30 p-4 rounded-lg block"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold">{s.role}</p>
                          <p className="text-gray-400 text-sm">{s.topic}</p>
                        </div>
                        <p className="text-xl font-bold text-blue-300">{s.average_score}/10</p>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(s.average_score / 10) * 100}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
