import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate("/dashboard")} className="mt-4 text-blue-400">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Performance</h1>
          <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-white">
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Interview Sessions</p>
            <p className="text-3xl font-bold">{data.total_interview_sessions}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Avg Score</p>
            <p className="text-3xl font-bold">
              {data.overall_average_score !== null ? `${data.overall_average_score}/10` : "—"}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Coding Attempts</p>
            <p className="text-3xl font-bold">{data.coding_submissions_count}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
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
                <div key={s.session_id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold">{s.role}</p>
                      <p className="text-gray-400 text-sm">{s.topic}</p>
                    </div>
                    <p className="text-xl font-bold text-blue-400">{s.average_score}/10</p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(s.average_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
