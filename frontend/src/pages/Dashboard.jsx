import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  const modules = [
    { label: "AI Interview", path: "/interview", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Coding Round", path: "/coding-round", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "SQL Quiz", path: "/sql-quiz", color: "bg-teal-600 hover:bg-teal-700" },
    { label: "Resume Upload", path: "/resume", color: "bg-orange-600 hover:bg-orange-700" },
    { label: "Performance Analytics", path: "/analytics", color: "bg-green-600 hover:bg-green-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          Logout
        </button>
      </div>
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
  );
}

export default Dashboard;
