import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, []);

  if (!user) return null;

  const modules = [
    { label: "AI Interview", path: "/interview", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Coding Round", path: "/coding-round", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "SQL Quiz", path: "/sql-quiz", color: "bg-teal-600 hover:bg-teal-700" },
    { label: "Resume Upload", path: "/resume", color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Performance Analytics", path: "/analytics", color: "bg-green-600 hover:bg-green-700" },
  ];

  return (
    <div className="min-h-screen app-bg text-white">
      <Navbar />
      <div className="px-6 pb-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
          {modules.map((m) => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className={`${m.color} px-6 py-6 rounded-lg font-semibold text-left`}
            >
              {m.label}
            </button>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
